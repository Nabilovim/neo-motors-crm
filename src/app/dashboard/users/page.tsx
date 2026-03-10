import { prisma } from "@/lib/prisma";
import { UsersClient } from "./users-client";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await prisma.crmUser.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      monthlyGoal: true,
      createdAt: true,
      _count: { select: { assignedLeads: true } },
    },
  });

  return <UsersClient users={JSON.parse(JSON.stringify(users))} />;
}