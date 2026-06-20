import { DubApiError } from "@/lib/api/errors";
import { parseRequestBody } from "@/lib/api/utils";
import { deleteWorkspace } from "@/lib/api/workspaces/delete-workspace";
import { prefixWorkspaceId } from "@/lib/api/workspaces/workspace-id";
import { withWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkspaceSchema, createWorkspaceSchema } from "@/lib/zod/schemas/workspaces";
import { nanoid, R2_URL } from "@dub/utils";
import { storage } from "@/lib/storage";
import { NextResponse } from "next/server";

const updateWorkspaceSchema = createWorkspaceSchema.partial();

// GET /api/workspaces/[idOrSlug]
export const GET = withWorkspace(
  async ({ workspace, headers }) => {
    return NextResponse.json(
      WorkspaceSchema.parse({
        ...workspace,
        id: prefixWorkspaceId(workspace.id),
      }),
      { headers },
    );
  },
  { requiredPermissions: ["workspaces.read"] },
);

// PATCH /api/workspaces/[idOrSlug]
export const PATCH = withWorkspace(
  async ({ req, workspace }) => {
    const { name, slug, logo } = await updateWorkspaceSchema.parseAsync(
      await parseRequestBody(req),
    );

    const logoUploaded = logo
      ? await storage.upload({
          key: `workspaces/${prefixWorkspaceId(workspace.id)}/logo_${nanoid(7)}`,
          body: logo,
        })
      : null;

    try {
      const updatedWorkspace = await prisma.project.update({
        where: { slug: workspace.slug },
        data: {
          ...(name && { name }),
          ...(slug && { slug }),
          ...(logoUploaded && { logo: logoUploaded.url }),
        },
      });

      if (updatedWorkspace.slug !== workspace.slug) {
        await prisma.user.updateMany({
          where: { defaultWorkspace: workspace.slug },
          data: { defaultWorkspace: updatedWorkspace.slug },
        });
      }

      if (logoUploaded && workspace.logo) {
        await storage.delete({ key: workspace.logo.replace(`${R2_URL}/`, "") });
      }

      return NextResponse.json(
        WorkspaceSchema.parse({
          ...updatedWorkspace,
          id: prefixWorkspaceId(updatedWorkspace.id),
        }),
      );
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new DubApiError({
          code: "conflict",
          message: `The slug "${slug}" is already in use.`,
        });
      }
      throw new DubApiError({ code: "internal_server_error", message: error.message });
    }
  },
  { requiredPermissions: ["workspaces.write"] },
);

export const PUT = PATCH;

// DELETE /api/workspaces/[idOrSlug]
export const DELETE = withWorkspace(
  async ({ workspace }) => {
    await deleteWorkspace(workspace);
    return NextResponse.json(workspace);
  },
  { requiredPermissions: ["workspaces.write"] },
);