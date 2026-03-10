"use client";

import { BarChart3, Users, CalendarCheck, Target, TrendingUp } from "lucide-react";

interface AnalyticsData {
  totalLeads: number;
  conversionRate: number;
  totalAppointments: number;
  avgLeadScore: number;
  leadsByStatus: { status: string; count: number }[];
  leadsBySource: { source: string; count: number }[];
  leadsByQualification: { level: string; count: number }[];
  popularVehicles: { vehicleInterest: string; count: number }[];
  leadsOverTime: { date: string; count: number }[];
  appointmentsOverTime: { date: string; count: number }[];
  competitorMentions: { competitor: string; count: number }[];
  eventsByType: { type: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "#6b7280",
  CONTACTED: "#3b82f6",
  QUALIFIED: "#eab308",
  CONVERTED: "#22c55e",
  LOST: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nouveau",
  CONTACTED: "Contact\u00e9",
  QUALIFIED: "Qualifi\u00e9",
  CONVERTED: "Converti",
  LOST: "Perdu",
};

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-5 bg-gray-800 rounded-full overflow-hidden flex-1">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const maxStatus = Math.max(...data.leadsByStatus.map((s) => s.count), 1);
  const maxSource = Math.max(...data.leadsBySource.map((s) => s.count), 1);
  const maxVehicle = Math.max(...(data.popularVehicles?.map((v) => v.count) || [1]), 1);
  const maxDailyLeads = Math.max(...(data.leadsOverTime?.map((d) => d.count) || [1]), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Rapports</h1>
        <BarChart3 className="w-6 h-6 text-gray-400" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Total Leads" value={data.totalLeads} />
        <KpiCard icon={Target} label="Taux de conversion" value={`${data.conversionRate}%`} />
        <KpiCard icon={CalendarCheck} label="Rendez-vous" value={data.totalAppointments} />
        <KpiCard icon={TrendingUp} label="Score moyen" value={`${data.avgLeadScore}/100`} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Leads by Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Leads par statut</h2>
          <div className="space-y-3">
            {data.leadsByStatus.map((s) => (
              <div key={s.status} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-20">{STATUS_LABELS[s.status] || s.status}</span>
                <Bar value={s.count} max={maxStatus} color={STATUS_COLORS[s.status] || "#6b7280"} />
                <span className="text-xs font-mono text-gray-600 w-8 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Leads by Source */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Leads par source</h2>
          <div className="space-y-3">
            {data.leadsBySource.map((s) => (
              <div key={s.source} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-20">{s.source === "WHATSAPP" ? "WhatsApp" : "Web"}</span>
                <Bar value={s.count} max={maxSource} color={s.source === "WHATSAPP" ? "#22c55e" : "#3b82f6"} />
                <span className="text-xs font-mono text-gray-600 w-8 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Vehicles */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">V\u00e9hicules populaires</h2>
          <div className="space-y-3">
            {(data.popularVehicles || []).map((v) => (
              <div key={v.vehicleInterest} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-32 truncate">{v.vehicleInterest}</span>
                <Bar value={v.count} max={maxVehicle} color="#dc2626" />
                <span className="text-xs font-mono text-gray-600 w-8 text-right">{v.count}</span>
              </div>
            ))}
            {(!data.popularVehicles || data.popularVehicles.length === 0) && (
              <p className="text-xs text-gray-400">Aucune donn\u00e9e</p>
            )}
          </div>
        </div>

        {/* Leads Over Time */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Leads (30 derniers jours)</h2>
          <div className="flex items-end gap-[2px] h-32">
            {(data.leadsOverTime || []).map((d) => {
              const pct = maxDailyLeads > 0 ? (d.count / maxDailyLeads) * 100 : 0;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <div
                    className="w-full bg-[#dc2626] rounded-t-sm min-h-[2px] transition-all hover:bg-red-500"
                    style={{ height: `${pct}%` }}
                  />
                  <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap">
                    {d.date}: {d.count}
                  </div>
                </div>
              );
            })}
            {(!data.leadsOverTime || data.leadsOverTime.length === 0) && (
              <p className="text-xs text-gray-400 m-auto">Aucune donn\u00e9e</p>
            )}
          </div>
        </div>

        {/* Competitor Mentions */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Mentions concurrents</h2>
          {data.competitorMentions && data.competitorMentions.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 pb-2">Concurrent</th>
                  <th className="text-right text-xs font-medium text-gray-500 pb-2">Mentions</th>
                </tr>
              </thead>
              <tbody>
                {data.competitorMentions.map((c) => (
                  <tr key={c.competitor} className="border-b border-gray-50">
                    <td className="py-2 text-sm text-gray-700">{c.competitor}</td>
                    <td className="py-2 text-sm text-gray-600 text-right font-mono">{c.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-gray-400">Aucune mention</p>
          )}
        </div>

        {/* Events Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">\u00c9v\u00e9nements par type</h2>
          {data.eventsByType && data.eventsByType.length > 0 ? (
            <div className="space-y-2">
              {data.eventsByType.map((e) => (
                <div key={e.type} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{e.type}</span>
                  <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{e.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Aucun \u00e9v\u00e9nement</p>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#dc2626]" />
        </div>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
