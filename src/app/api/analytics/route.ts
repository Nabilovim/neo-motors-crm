import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalLeads,
      leadsByStatus,
      leadsByQualification,
      convertedCount,
      totalAppointments,
      appointmentsByStatus,
      leadsBySource,
      avgScore,
      leadsOverTime,
      appointmentsOverTime,
      competitorMentions,
      eventsByType,
      vehicleInterests,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.groupBy({ by: ["status"], _count: true }),
      prisma.lead.groupBy({ by: ["qualificationLevel"], _count: true }),
      prisma.lead.count({ where: { status: "CONVERTED" } }),
      prisma.appointment.count(),
      prisma.appointment.groupBy({ by: ["status"], _count: true }),
      prisma.lead.groupBy({ by: ["source"], _count: true }),
      prisma.lead.aggregate({ _avg: { leadScore: true } }),
      prisma.$queryRaw`
        SELECT DATE(\"createdAt\") as date, COUNT(*)::int as count
        FROM "Lead"
        WHERE "createdAt" >= ${thirtyDaysAgo}
        GROUP BY DATE("createdAt")
        ORDER BY date
      ` as Promise<{ date: string; count: number }[]>,
      prisma.$queryRaw`
        SELECT DATE(\"createdAt\") as date, COUNT(*)::int as count
        FROM "Appointment"
        WHERE "createdAt" >= ${thirtyDaysAgo}
        GROUP BY DATE("createdAt")
        ORDER BY date
      ` as Promise<{ date: string; count: number }[]>,
      prisma.conversationEvent.groupBy({
        by: ["detail"],
        where: { type: "COMPETITOR_MENTION" },
        _count: true,
        orderBy: { _count: { detail: "desc" } },
      }),
      prisma.conversationEvent.groupBy({
        by: ["type"],
        _count: true,
        orderBy: { _count: { type: "desc" } },
      }),
      prisma.$queryRaw`
        SELECT "vehicleInterest", COUNT(*)::int as count
        FROM "Lead"
        WHERE "vehicleInterest" IS NOT NULL AND "vehicleInterest" != ''
        GROUP BY "vehicleInterest"
        ORDER BY count DESC
        LIMIT 10
      ` as Promise<{ vehicleInterest: string; count: number }[]>,
    ]);

    const conversionRate = totalLeads > 0 ? (convertedCount / totalLeads) * 100 : 0;

    return NextResponse.json({
      totalLeads,
      leadsByStatus: leadsByStatus.map((s) => ({ status: s.status, count: s._count })),
      leadsByQualification: leadsByQualification.map((q) => ({
        level: q.qualificationLevel || "NON_DEFINI",
        count: q._count,
      })),
      conversionRate: Math.round(conversionRate * 100) / 100,
      totalAppointments,
      appointmentsByStatus: appointmentsByStatus.map((a) => ({ status: a.status, count: a._count })),
      leadsBySource: leadsBySource.map((s) => ({ source: s.source, count: s._count })),
      avgLeadScore: Math.round(avgScore._avg.leadScore || 0),
      leadsOverTime: leadsOverTime.map((d) => ({
        date: new Date(d.date).toISOString().split("T")[0],
        count: d.count,
      })),
      appointmentsOverTime: appointmentsOverTime.map((d) => ({
        date: new Date(d.date).toISOString().split("T")[0],
        count: d.count,
      })),
      competitorMentions: competitorMentions.map((c) => ({
        competitor: c.detail || "Inconnu",
        count: c._count,
      })),
      eventsByType: eventsByType.map((e) => ({ type: e.type, count: e._count })),
      popularVehicles: vehicleInterests,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}