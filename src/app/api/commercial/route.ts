import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const users = await prisma.crmUser.findMany({
      where: { isActive: true },
      select: { id: true, name: true, role: true, monthlyGoal: true },
    });

    const salespeople = await Promise.all(
      users.map(async (user) => {
        const [
          totalLeads,
          hotLeads,
          convertedThisMonth,
          totalConverted,
          appointmentsThisMonth,
          completedAppointments,
        ] = await Promise.all([
          prisma.lead.count({ where: { assignedToId: user.id } }),
          prisma.lead.count({ where: { assignedToId: user.id, qualificationLevel: "HOT" } }),
          prisma.lead.count({ where: { assignedToId: user.id, status: "CONVERTED", updatedAt: { gte: startOfMonth } } }),
          prisma.lead.count({ where: { assignedToId: user.id, status: "CONVERTED" } }),
          prisma.appointment.count({ where: { assignedToId: user.id, createdAt: { gte: startOfMonth } } }),
          prisma.appointment.count({ where: { assignedToId: user.id, status: "COMPLETED" } }),
        ]);

        const conversionRate = totalLeads > 0 ? Math.round((totalConverted / totalLeads) * 100) : 0;
        const goalProgress = user.monthlyGoal > 0 ? Math.round((convertedThisMonth / user.monthlyGoal) * 100) : 0;

        return {
          ...user,
          totalLeads,
          hotLeads,
          convertedThisMonth,
          totalConverted,
          appointmentsThisMonth,
          completedAppointments,
          conversionRate,
          goalProgress,
        };
      })
    );

    // Team totals
    const teamStats = {
      totalLeads: salespeople.reduce((s, p) => s + p.totalLeads, 0),
      totalConverted: salespeople.reduce((s, p) => s + p.totalConverted, 0),
      convertedThisMonth: salespeople.reduce((s, p) => s + p.convertedThisMonth, 0),
      appointmentsThisMonth: salespeople.reduce((s, p) => s + p.appointmentsThisMonth, 0),
    };

    // Unassigned leads
    const unassignedLeads = await prisma.lead.count({ where: { assignedToId: null } });

    return NextResponse.json({ salespeople, teamStats, unassignedLeads });
  } catch (error) {
    console.error("Commercial API error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
