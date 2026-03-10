import { prisma } from "@/lib/prisma";
import { Users, Calendar, MessageSquare, TrendingUp, Flame, AlertCircle, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  const [
    totalLeads,
    hotLeads,
    warmLeads,
    coldLeads,
    totalAppointments,
    pendingAppointments,
    totalConversations,
    todayConversations,
    avgScoreResult,
    recentLeads,
    upcomingAppointments,
    recentEvents,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { qualificationLevel: "HOT" } }),
    prisma.lead.count({ where: { qualificationLevel: "WARM" } }),
    prisma.lead.count({ where: { qualificationLevel: "COLD" } }),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.conversation.count(),
    prisma.conversation.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    prisma.lead.aggregate({ _avg: { leadScore: true } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.appointment.findMany({
      where: { status: "PENDING", preferredDate: { gte: new Date() } },
      orderBy: { preferredDate: "asc" },
      take: 10,
    }),
    prisma.conversationEvent.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return {
    totalLeads, hotLeads, warmLeads, coldLeads,
    totalAppointments, pendingAppointments,
    totalConversations, todayConversations,
    avgScore: Math.round(avgScoreResult._avg.leadScore || 0),
    recentLeads, upcomingAppointments, recentEvents,
  };
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function LevelBadge({ level }: { level: string | null }) {
  const styles: Record<string, string> = {
    HOT: "bg-red-100 text-red-700",
    WARM: "bg-orange-100 text-orange-700",
    COLD: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[level || ""] || "bg-gray-100 text-gray-500"}`}>
      {level || "NEW"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-green-100 text-green-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

function EventIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    OBJECTION: "text-red-500",
    BUYING_SIGNAL: "text-green-500",
    COMPETITOR_MENTION: "text-orange-500",
    PRICE_REQUEST: "text-blue-500",
    FINANCING_ASK: "text-purple-500",
    TRADE_IN_MENTION: "text-teal-500",
    URGENCY_DETECTED: "text-yellow-500",
  };
  return <Activity className={`w-4 h-4 ${icons[type] || "text-gray-400"}`} />;
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users} label="Total Leads" value={stats.totalLeads} color="bg-[#dc2626]"
          sub={`${stats.hotLeads} HOT, ${stats.warmLeads} WARM, ${stats.coldLeads} COLD`}
        />
        <StatCard
          icon={Calendar} label="Rendez-vous" value={stats.totalAppointments} color="bg-blue-600"
          sub={`${stats.pendingAppointments} en attente`}
        />
        <StatCard
          icon={MessageSquare} label="Conversations" value={stats.totalConversations} color="bg-green-600"
          sub={`${stats.todayConversations} aujourd'hui`}
        />
        <StatCard
          icon={TrendingUp} label="Score Moyen" value={stats.avgScore} color="bg-purple-600"
          sub="sur 100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-[#dc2626]" />
            <h2 className="text-lg font-semibold text-gray-900">Leads Récents</h2>
          </div>
          <div className="space-y-3">
            {stats.recentLeads.length === 0 ? (
              <p className="text-gray-400 text-sm">Aucun lead pour le moment</p>
            ) : (
              stats.recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                    <p className="text-xs text-gray-400">{lead.phone || lead.email || "—"} {lead.vehicleInterest ? `· ${lead.vehicleInterest}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500">{lead.leadScore}/100</span>
                    <LevelBadge level={lead.qualificationLevel} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Rendez-vous à Venir</h2>
          </div>
          <div className="space-y-3">
            {stats.upcomingAppointments.length === 0 ? (
              <p className="text-gray-400 text-sm">Aucun rendez-vous à venir</p>
            ) : (
              stats.upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{apt.name}</p>
                    <p className="text-xs text-gray-400">
                      {apt.vehicle || "—"} · {apt.location || "—"}
                      {apt.preferredDate ? ` · ${new Date(apt.preferredDate).toLocaleDateString("fr-FR")}` : ""}
                      {apt.preferredTime ? ` à ${apt.preferredTime}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">Événements Récents</h2>
          </div>
          <div className="space-y-3">
            {stats.recentEvents.length === 0 ? (
              <p className="text-gray-400 text-sm">Aucun événement enregistré</p>
            ) : (
              stats.recentEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <EventIcon type={event.type} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{event.type.replace(/_/g, " ")}</span>
                      {event.detail ? ` — ${event.detail}` : ""}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(event.createdAt).toLocaleString("fr-FR")}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
