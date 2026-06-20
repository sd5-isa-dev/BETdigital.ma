import { RESERVED_SLUGS, DEFAULT_REDIRECTS, validSlugRegex } from "@dub/utils";
import { WorkspaceRole } from "@prisma/client";
import slugify from "@sindresorhus/slugify";
import * as z from "zod/v4";
import { uploadedImageSchema, googleUserContentUrlSchema } from "./images";
import { roleSchema } from "./misc";

export const workspaceIdSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required."),
});

export const WorkspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().nullable().default(null),
  inviteCode: z.string().nullable(),
  createdAt: z.date(),
  users: z.array(z.object({ role: roleSchema })),
});

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(32),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(48, "Slug must be less than 48 characters")
    .transform((v) => slugify(v))
    .refine((v) => validSlugRegex.test(v), { message: "Invalid slug format" })
    .refine((v) => !(RESERVED_SLUGS.includes(v) || DEFAULT_REDIRECTS[v]), {
      message: "Cannot use reserved slugs",
    }),
  logo: z
    .union([uploadedImageSchema, googleUserContentUrlSchema])
    .transform((v) => v || null)
    .nullish(),
});

export const getWorkspaceUsersQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(WorkspaceRole).optional(),
});

export const workspaceUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullish(),
  image: z.string().nullish(),
  role: z.enum(WorkspaceRole),
  isMachine: z.boolean().default(false),
  createdAt: z.date(),
});