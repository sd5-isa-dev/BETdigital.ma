import { prisma } from "@/lib/prisma";

export async function deleteWorkspace(
  workspace: { id: string; slug: string },
) {
  await prisma.projectUsers.deleteMany({
    where: { projectId: workspace.id },
  });

  await prisma.user.updateMany({
    where: { defaultWorkspace: workspace.slug },
    data: { defaultWorkspace: null },
  });

  await prisma.project.delete({
    where: { slug: workspace.slug },
  });
}