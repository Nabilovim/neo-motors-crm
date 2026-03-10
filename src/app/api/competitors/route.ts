import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // All competitor mentions with conversation details
    const mentions = await prisma.conversationEvent.findMany({
      where: { type: "COMPETITOR_MENTION" },
      include: {
        conversation: {
          select: {
            id: true,
            contactName: true,
            contactPhone: true,
            source: true,
            createdAt: true,
            leads: { select: { vehicleInterest: true, status: true, qualificationLevel: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by competitor name
    const competitorMap: Record<string, { count: number; conversions: number; vehicles: Record<string, number>; recent: typeof mentions }> = {};
    for (const m of mentions) {
      const name = (m.detail || "Inconnu").trim();
      if (!competitorMap[name]) competitorMap[name] = { count: 0, conversions: 0, vehicles: {}, recent: [] };
      competitorMap[name].count++;
      const lead = m.conversation?.leads?.[0];
      if (lead?.status === "CONVERTED") competitorMap[name].conversions++;
      if (lead?.vehicleInterest) {
        competitorMap[name].vehicles[lead.vehicleInterest] = (competitorMap[name].vehicles[lead.vehicleInterest] || 0) + 1;
      }
      if (competitorMap[name].recent.length < 5) competitorMap[name].recent.push(m);
    }

    const competitors = Object.entries(competitorMap)
      .map(([name, data]) => ({
        name,
        count: data.count,
        conversions: data.conversions,
        conversionRate: data.count > 0 ? Math.round((data.conversions / data.count) * 100) : 0,
        topVehicles: Object.entries(data.vehicles).sort((a, b) => b[1] - a[1]).slice(0, 3),
        recentMentions: data.recent.map((r) => ({
          id: r.id,
          detail: r.detail,
          createdAt: r.createdAt,
          contact: r.conversation?.contactName || r.conversation?.contactPhone || "Anonyme",
          conversationId: r.conversationId,
        })),
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      totalMentions: mentions.length,
      competitors,
    });
  } catch (error) {
    console.error("Competitors API error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
