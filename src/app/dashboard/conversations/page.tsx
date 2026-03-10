import { prisma } from "@/lib/prisma";
import { ConversationsClient } from "./conversations-client";

export const dynamic = "force-dynamic";

export default async function ConversationsPage() {
  const conversations = await prisma.conversation.findMany({
    where: { messageCount: { gt: 0 } },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      events: { orderBy: { createdAt: "desc" } },
    },
  });

  return <ConversationsClient conversations={JSON.parse(JSON.stringify(conversations))} />;
}
