import { isBlacklistedEmail } from "@/lib/edge-config";
import { prisma } from "@/lib/prisma";
import { isStored, storage } from "@/lib/storage";
import { UserProps } from "@/lib/types";
import { ratelimit } from "@/lib/upstash";
import { sendEmail } from "@dub/email";
import LoginLink from "@dub/email/templates/login-link";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { User, type NextAuthOptions } from "next-auth";
import { AdapterAccount, AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { createId } from "../api/create-id";
import { isProduction, shouldApplyRateLimit } from "../api/environment";
import {
  exceededLoginAttemptsThreshold,
  incrementLoginAttempts,
} from "./lock-account";
import { validatePassword } from "./password";

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL;

const CustomPrismaAdapter = (p: PrismaClient) => {
  return {
    ...PrismaAdapter(p),
    createUser: async (data: any) => {
      return p.user.create({
        data: {
          ...data,
          id: createId({ prefix: "user_" }),
        },
      });
    },
    linkAccount: (account: AdapterAccount) =>
      p.account.create({
        data: {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
      }),
    useVerificationToken: async ({ identifier, token }) => {
      try {
        return await p.verificationToken.delete({
          where: { identifier_token: { identifier, token } },
        });
      } catch (error: any) {
        if (error.code === "P2025") return null;
        throw error;
      }
    },
  };
};

export const authOptions: NextAuthOptions = {
  providers: [
    EmailProvider({
      sendVerificationRequest({ identifier, url }) {
        if (!isProduction) {
          console.log(`Login link: ${url}`);
          return;
        }
        sendEmail({
          to: identifier,
          subject: "Your Login Link",
          react: LoginLink({ url, email: identifier }),
        });
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Login",
      type: "credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) throw new Error("no-credentials");
        const { email, password } = credentials;
        if (!email || !password) throw new Error("no-credentials");

        if (shouldApplyRateLimit) {
          const { success } = await ratelimit(5, "1 m").limit(
            `login-attempts:${email}`,
          );
          if (!success) throw new Error("too-many-login-attempts");
        }

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            passwordHash: true,
            name: true,
            email: true,
            image: true,
            invalidLoginAttempts: true,
            emailVerified: true,
          },
        });

        if (!user || !user.passwordHash) throw new Error("invalid-credentials");
        if (exceededLoginAttemptsThreshold(user)) throw new Error("exceeded-login-attempts");

        const passwordMatch = await validatePassword({
          password,
          passwordHash: user.passwordHash,
        });

        if (!passwordMatch) {
          const exceeded = exceededLoginAttemptsThreshold(
            await incrementLoginAttempts(user),
          );
          if (exceeded) throw new Error("exceeded-login-attempts");
          throw new Error("invalid-credentials");
        }

        if (!user.emailVerified) throw new Error("email-not-verified");

        await prisma.user.update({
          where: { id: user.id },
          data: { invalidLoginAttempts: 0 },
        });

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  // @ts-ignore
  adapter: CustomPrismaAdapter(prisma),
  session: { strategy: "jwt" },
  cookies: {
    sessionToken: {
      name: `${VERCEL_DEPLOYMENT ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: VERCEL_DEPLOYMENT,
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      if (!user.email || (await isBlacklistedEmail(user.email))) return false;
      if (user?.lockedAt) throw new Error("exceeded-login-attempts");

      if (account?.provider === "google" || account?.provider === "github") {
        const userExists = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, name: true, image: true },
        });
        if (!userExists || !profile) return true;

        const profilePic = profile[account.provider === "google" ? "picture" : "avatar_url"];
        let newAvatar: string | null = null;
        if ((!userExists.image || !isStored(userExists.image)) && profilePic) {
          const { url } = await storage.upload({
            key: `avatars/${userExists.id}`,
            body: profilePic,
          });
          newAvatar = url;
        }
        await prisma.user.update({
          where: { email: user.email },
          data: {
            // @ts-expect-error
            ...(!userExists.name && { name: profile.name || profile.login }),
            ...(newAvatar && { image: newAvatar }),
          },
        });
      }
      return true;
    },
    jwt: async ({
      token,
      user,
      trigger,
    }: {
      token: JWT;
      user: User | AdapterUser | UserProps;
      trigger?: "signIn" | "update" | "signUp";
    }) => {
      if (user) token.user = user;

      if (trigger === "update") {
        const refreshedUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isMachine: true,
            defaultWorkspace: true,
          },
        });
        if (refreshedUser) token.user = refreshedUser;
        else return {};
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user = {
        id: token.sub,
        // @ts-ignore
        ...(token || session).user,
      };
      return session;
    },
  },
};