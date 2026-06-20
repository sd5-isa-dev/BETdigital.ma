import { DubApiError } from "@/lib/api/errors";
import { withSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/workspaces/[idOrSlug]/invites/accept
export const POST = withSession(async ({ session, params }) => {
  const { idOrSlug: slug } = params;

  const invite = await prisma.projectInvite.findFirst({
    where: { email: session.user.email, project: { slug } },
  });

  if (!invite) {
    throw new DubApiError({ code: "not_found", message: "This invite is not found." });
  }

  if (invite.expires < new Date()) {
    throw new DubApiError({ code: "invite_expired", message: "This invite has expired." });
  }

  const workspace = await prisma.$transaction(async (tx) => {
    const existingMembership = await tx.projectUsers.findFirst({
      where: { userId: session.user.id, projectId: invite.projectId },
    });

    if (existingMembership) {
      throw new DubApiError({
        code: "conflict",
        message: "You are already a member of this workspace.",
      });
    }

    const workspace = await tx.project.findUniqueOrThrow({
      where: { id: invite.projectId },
      select: { id: true, slug: true },
    });

    await tx.projectUsers.create({
      data: {
        userId: session.user.id,
        role: invite.role,
        projectId: workspace.id,
      },
    });

    await tx.projectInvite.delete({
      where: { email_projectId: { email: session.user.email, projectId: workspace.id } },
    });

    return workspace;
  });

  if (!session.user.defaultWorkspace) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { defaultWorkspace: workspace.slug },
    });
  }

  return NextResponse.json({ message: "Invite accepted." });
});