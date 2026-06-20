import { DubApiError } from "@/lib/api/errors";
import { createWorkspaceId } from "@/lib/api/workspaces/create-workspace-id";
import { prefixWorkspaceId } from "@/lib/api/workspaces/workspace-id";
import { withSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";
import {
  createWorkspaceSchema,
  WorkspaceSchema,
} from "@/lib/zod/schemas/workspaces";
import { nanoid, R2_URL } from "@dub/utils";
import { Prisma } from "@prisma/client";
import { waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";

// GET /api/workspaces — get all workspaces for the current user
export const GET = withSession(async ({ session }) => {
  const workspaces = await prisma.project.findMany({
    where: {
      users: { some: { userId: session.user.id } },
    },
    include: {
      users: {
        where: { userId: session.user.id },
        select: { role: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    workspaces.map((project) =>
      WorkspaceSchema.parse({
        ...project,
        id: prefixWorkspaceId(project.id),
      }),
    ),
  );
});

// POST /api/workspaces — create a new workspace
export const POST = withSession(async ({ req, session }) => {
  const { name, slug, logo } = await createWorkspaceSchema.parseAsync(
    await req.json(),
  );

  try {
    let uploadedImageUrl: string | undefined;
    const workspaceId = createWorkspaceId();
    uploadedImageUrl = logo
      ? `${R2_URL}/workspaces/${workspaceId}/logo_${nanoid(7)}`
      : undefined;

    const workspace = await prisma.project.create({
      data: {
        id: workspaceId,
        name,
        slug,
        logo: uploadedImageUrl,
        users: {
          create: { userId: session.user.id, role: "owner" },
        },
      },
      include: {
        users: {
          where: { userId: session.user.id },
          select: { role: true },
        },
      },
    });

    waitUntil(
      Promise.allSettled([
        session.user["defaultWorkspace"] === null &&
          prisma.user.update({
            where: { id: session.user.id },
            data: { defaultWorkspace: workspace.slug },
          }),
        logo &&
          uploadedImageUrl &&
          storage.upload({
            key: uploadedImageUrl.replace(`${R2_URL}/`, ""),
            body: logo,
          }),
      ]),
    );

    return NextResponse.json(
      WorkspaceSchema.parse({
        ...workspace,
        id: prefixWorkspaceId(workspace.id),
      }),
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new DubApiError({
        code: "conflict",
        message: `The slug "${slug}" is already in use.`,
      });
    }
    if (error instanceof DubApiError) throw error;
    throw new DubApiError({
      code: "internal_server_error",
      message: "Error creating workspace. Please try again later.",
    });
  }
});