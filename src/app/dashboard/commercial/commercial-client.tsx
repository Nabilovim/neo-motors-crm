"use client";

import { useState, useEffect } from "react";
import { Users, TrendingUp, Calendar, AlertCircle } from "lucide-react";

interface Salesperson {
  id: string;
  name: string;
  role: string;
  monthlyGoal: number;
  totalLeads: number;
  hotLeads: number;
  convertedThisMonth: number;
  totalConverted: number;
  appointmentsThisMonth: number;
  completedAppointments: number;
  conversionRate: number;
  goalProgress: number;
}

interface CommercialData {
  salespeople: Salesperson[];
  teamStats: {
    totalLeads: number;
    totalConverted: number;
    convertedThisMonth: number;
    appointmentsThisMonth: number;
  };
  unassignedLeads: number;
}

export function CommercialClient() {
  const [data, setData] = useState<CommercialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/commercial")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;
  if (!data) return <div className="p-8 text-red-500">Erreur de chargement</div>;

  const { salespeople, teamStats, unassignedLeads } = data;
  const month = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau Commercial</h1>
          <p className="text-sm text-gray-500 mt-1">Performance de l&apos;équipe — {month}</p>
        </div>
      </div>

      {/* Team summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Leads assignés" value={teamStats.totalLeads} color="bg-blue-600" />
        <StatCard icon={TrendingUp} label="Convertis ce mois" value={teamStats.convertedThisMonth} color="bg-green-600" />
        <StatCard icon={Calendar} label="RDV ce mois" value={teamStats.appointmentsThisMonth} color="bg-purple-600" />
        <StatCard icon={AlertCircle} label="Leads non-assignés" value={unassignedLeads} color={unassignedLeads > 0 ? "bg-red-600" : "bg-gray-400"} />
      </div>

      {/* Salesperson cards */}
      {salespeople.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
          Aucun utilisateur. Ajoutez des commerciaux dans la page Utilisateurs
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {salespeople.map((sp) => (
            <div key={sp.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{sp.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase">{sp.role}</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{sp.convertedThisMonth}/{sp.monthlyGoal}</p>
                  <p className="text-xs text-gray-400">objectif mensuel</p>
                </div>
              </div>

              {/* Goal progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">Progression objectif</span>
                  <span className={`font-medium ${sp.goalProgress >= 100 ? "text-green-600" : sp.goalProgress >= 50 ? "text-orange-600" : "text-red-600"}`}>
                    {sp.goalProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${sp.goalProgress >= 100 ? "bg-green-500" : sp.goalProgress >= 50 ? "bg-orange-500" : "bg-red-500"}`}
                    style={{ width: `${Math.min(sp.goalProgress, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">Leads total</p>
                  <p className="text-lg font-semibold text-gray-900">{sp.totalLeads}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">HOT leads</p>
                  <p className="text-lg font-semibold text-red-600">{sp.hotLeads}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Taux conv.</p>
                  <p className="text-lg font-semibold text-gray-900">{sp.conversionRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">RDV ce mois</p>
                  <p className="text-lg font-semibold text-gray-900">{sp.appointmentsThisMonth}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">RDV complétés</p>
                  <p className="text-lg font-semibold text-green-600">{sp.completedAppointments}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total convertis</p>
                  <p className="text-lg font-semibold text-gray-900">{sp.totalConverted}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} mb-2`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
