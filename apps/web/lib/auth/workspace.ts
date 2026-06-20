import { DubApiError, handleAndReturnErrorResponse } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import { WorkspaceWithUsers } from "@/lib/types";
import { getSearchParams } from "@dub/utils";
import { WorkspaceRole } from "@prisma/client";
import {
  PermissionAction,
  getPermissionsByRole,
} from "../api/rbac/permissions";
import { throwIfNoAccess } from "../api/tokens/throw-if-no-access";
import { Session, getSession } from "./utils";

interface WithWorkspaceHandler {
  ({
    req,
    params,
    searchParams,
    headers,
    session,
    workspace,
    permissions,
  }: {
    req: Request;
    params: Record<string, string>;
    searchParams: Record<string, string>;
    headers?: Headers;
    session: Session;
    permissions: PermissionAction[];
    workspace: WorkspaceWithUsers;
  }): Promise<Response>;
}

export const withWorkspace = (
  handler: WithWorkspaceHandler,
  {
    requiredPermissions = [],
    requiredRoles = [],
  }: {
    requiredPermissions?: PermissionAction[];
    requiredRoles?: WorkspaceRole[];
  } = {},
) => {
  return async (
    req: Request,
    { params: initialParams }: { params: Promise<Record<string, string>> },
  ) => {
    const params = (await initialParams) || {};
    const searchParams = getSearchParams(req.url);
    let responseHeaders = new Headers();

    try {
      const session = await getSession();
      if (!session?.user?.id) {
        throw new DubApiError({
          code: "unauthorized",
          message: "Unauthorized: Login required.",
        });
      }

      const idOrSlug =
        params?.idOrSlug || searchParams.workspaceId || params?.slug;

      let workspaceId: string | undefined;
      let workspaceSlug: string | undefined;
      if (idOrSlug) {
        if (idOrSlug.startsWith("ws_")) {
          workspaceId = idOrSlug.replace("ws_", "");
        } else {
          workspaceSlug = idOrSlug;
        }
      }

      const workspace = (await prisma.project.findUnique({
        where: {
          id: workspaceId || undefined,
          slug: workspaceSlug || undefined,
        },
        include: {
          users: {
            where: { userId: session.user.id },
            select: { role: true },
          },
        },
      })) as WorkspaceWithUsers;

      if (!workspace || !workspace.users) {
        throw new DubApiError({ code: "not_found", message: "Workspace not found." });
      }

      if (workspace.users.length === 0) {
        const pendingInvite = await prisma.projectInvite.findUnique({
          where: {
            email_projectId: { email: session.user.email, projectId: workspace.id },
          },
          select: { expires: true },
        });

        if (!pendingInvite) {
          throw new DubApiError({ code: "not_found", message: "Workspace not found." });
        } else if (pendingInvite.expires < new Date()) {
          throw new DubApiError({ code: "invite_expired", message: "Workspace invite expired." });
        } else {
          throw new DubApiError({ code: "invite_pending", message: "Workspace invite pending." });
        }
      }

      const permissions = getPermissionsByRole(workspace.users[0].role);

      if (requiredPermissions.length > 0) {
        throwIfNoAccess({
          permissions,
          requiredPermissions,
          workspaceId: workspace.id,
          externalRequest: false,
        });
      }

      if (
        requiredRoles.length > 0 &&
        !requiredRoles.includes(workspace.users[0].role)
      ) {
        throw new DubApiError({
          code: "forbidden",
          message: `You don't have the required role to access this endpoint. Required role(s): ${requiredRoles.join(", ")}.`,
        });
      }

      return await handler({
        req,
        params,
        searchParams,
        headers: responseHeaders,
        session,
        workspace,
        permissions,
      });
    } catch (error) {
      return handleAndReturnErrorResponse(error, responseHeaders);
    }
  };
};