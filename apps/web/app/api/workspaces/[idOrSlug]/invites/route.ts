import { DubApiError } from "@/lib/api/errors";
import { inviteUser } from "@/lib/api/users";
import { withWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inviteTeammatesSchema } from "@/lib/zod/schemas/invites";
import {
  getWorkspaceUsersQuerySchema,
  workspaceUserSchema,
} from "@/lib/zod/schemas/workspaces";
import { pluralize } from "@dub/utils";
import { WorkspaceRole } from "@prisma/client";
import { NextResponse } from "next/server";
import * as z from "zod/v4";

// GET /api/workspaces/[idOrSlug]/invites
export const GET = withWorkspace(
  async ({ workspace, searchParams }) => {
    const { search, role } = getWorkspaceUsersQuerySchema.parse(searchParams);

    const invites = await prisma.projectInvite.findMany({
      where: {
        projectId: workspace.id,
        role,
        ...(search && { email: { contains: search } }),
      },
    });

    const parsedInvites = invites.map((invite) =>
      workspaceUserSchema.parse({
        ...invite,
        id: `${workspace.id}-${invite.email}`,
        name: invite.email,
      }),
    );

    return NextResponse.json(parsedInvites);
  },
  { requiredPermissions: ["workspaces.read"] },
);

// POST /api/workspaces/[idOrSlug]/invites
export const POST = withWorkspace(
  async ({ req, workspace, session }) => {
    const { teammates } = inviteTeammatesSchema.parse(await req.json());

    if (teammates.length > 10) {
      throw new DubApiError({
        code: "bad_request",
        message: "You can only invite up to 10 teammates at a time.",
      });
    }

    const alreadyInWorkspace = await prisma.projectUsers.findMany({
      where: {
        projectId: workspace.id,
        user: { email: { in: teammates.map(({ email }) => email) } },
      },
      select: { user: { select: { email: true } } },
    });

    if (alreadyInWorkspace.length > 0) {
      const emailsInWorkspace = alreadyInWorkspace.map((u) => u.user.email);
      throw new DubApiError({
        code: "bad_request",
        message: `${pluralize("User", emailsInWorkspace.length)} ${emailsInWorkspace.join(", ")} already exists in this workspace.`,
      });
    }

    const results = await Promise.allSettled(
      teammates.map(({ email, role }) =>
        inviteUser({ email, role, workspace, session }),
      ),
    );

    if (results.some((r) => r.status === "rejected")) {
      const failed = results.filter(
        (r): r is PromiseRejectedResult => r.status === "rejected",
      );
      throw new DubApiError({
        code: "bad_request",
        message: `Failed to send ${pluralize("invitation", failed.length)}: ${failed.map((r) => r.reason.message).join(", ")}`,
      });
    }

    return NextResponse.json({ message: "Invite(s) sent" });
  },
  { requiredPermissions: ["workspaces.write"] },
);

const updateInviteRoleSchema = z.object({
  email: z.email(),
  role: z.enum(WorkspaceRole),
});

// PATCH /api/workspaces/[idOrSlug]/invites
export const PATCH = withWorkspace(
  async ({ req, workspace }) => {
    const { email, role } = updateInviteRoleSchema.parse(await req.json());

    const invite = await prisma.projectInvite.findUnique({
      where: { email_projectId: { email, projectId: workspace.id } },
    });

    if (!invite) {
      throw new DubApiError({
        code: "not_found",
        message: "The invitation you're trying to update was not found.",
      });
    }

    const response = await prisma.projectInvite.update({
      where: { email_projectId: { email, projectId: workspace.id } },
      data: { role },
    });

    return NextResponse.json(response);
  },
  { requiredPermissions: ["workspaces.write"] },
);

// DELETE /api/workspaces/[idOrSlug]/invites
export const DELETE = withWorkspace(
  async ({ searchParams, workspace }) => {
    const { email } = z.object({ email: z.email() }).parse(searchParams);

    const response = await prisma.projectInvite.delete({
      where: { email_projectId: { email, projectId: workspace.id } },
    });

    return NextResponse.json(response);
  },
  { requiredPermissions: ["workspaces.write"] },
);