import { prisma } from "@/lib/prisma";
import { FAQClient } from "./faq-client";

export const dynamic = "force-dynamic";

export default async function FAQPage() {
  const faqs = await prisma.fAQ.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return <FAQClient faqs={JSON.parse(JSON.stringify(faqs))} />;
}