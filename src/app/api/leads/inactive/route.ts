import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const days = parseInt(req.nextUrl.searchParams.get("days") || "7");
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const inactiveLeads = await prisma.lead.findMany({
      where: {
        status: { in: ["NEW", "CONTACTED"] },
        lastContactedAt: { lt: cutoff },
      },
      include: {
        conversation: { select: { id: true, messageCount: true, updatedAt: true } },
        assignedTo: { select: { name: true } },
      },
      orderBy: { lastContactedAt: "asc" },
    });

    // Also get leads that were never contacted
    const neverContacted = await prisma.lead.findMany({
      where: {
        status: "NEW",
        lastContactedAt: null,
        createdAt: { lt: cutoff },
      },
      include: {
        conversation: { select: { id: true, messageCount: true, updatedAt: true } },
        assignedTo: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const all = [...inactiveLeads, ...neverContacted];
    // Deduplicate by id
    const seen = new Set<string>();
    const unique = all.filter((l) => {
      if (seen.has(l.id)) return false;
      seen.add(l.id);
      return true;
    });

    return NextResponse.json(unique);
  } catch (error) {
    console.error("Inactive leads error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
