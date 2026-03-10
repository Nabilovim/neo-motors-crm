import { prisma } from "@/lib/prisma";
import { PipelineClient } from "./pipeline-client";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { conversation: true },
  });

  return <PipelineClient leads={JSON.parse(JSON.stringify(leads))} />;
}
