import { prisma } from "@/lib/prisma";
import { LeadsClient } from "./leads-client";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return <LeadsClient leads={JSON.parse(JSON.stringify(leads))} />;
}
