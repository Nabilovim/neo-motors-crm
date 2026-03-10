"use client";

import { useState } from "react";
import { Search, X, Globe, MessageCircle } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  vehicleInterest: string | null;
  source: string;
  status: string;
  leadScore: number;
  qualificationLevel: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string | null;
  city: string | null;
  tradeInVehicle: string | null;
  purchaseType: string | null;
  financingInterest: boolean;
  createdAt: string;
}

const LEVEL_STYLES: Record<string, string> = {
  HOT: "bg-red-100 text-red-700",
  WARM: "bg-orange-100 text-orange-700",
  COLD: "bg-blue-100 text-blue-700",
};

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-gray-100 text-gray-600",
  CONTACTED: "bg-blue-100 text-blue-700",
  QUALIFIED: "bg-green-100 text-green-700",
  CONVERTED: "bg-emerald-100 text-emerald-700",
  LOST: "bg-red-100 text-red-700",
};

export function LeadsClient({ leads }: { leads: Lead[] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [selected, setSelected] = useState<Lead | null>(null);

  const filtered = leads.filter((l) => {
    if (filterStatus !== "ALL" && l.status !== filterStatus) return false;
    if (filterLevel !== "ALL" && l.qualificationLevel !== filterLevel) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        (l.phone && l.phone.includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    window.location.reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <span className="text-sm text-gray-400">{filtered.length} résultat(s)</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#dc2626]"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#dc2626]"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="CONVERTED">Converted</option>
          <option value="LOST">Lost</option>
        </select>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#dc2626]"
        >
          <option value="ALL">Tous les niveaux</option>
          <option value="HOT">HOT</option>
          <option value="WARM">WARM</option>
          <option value="COLD">COLD</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Téléphone</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Véhicule</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Score</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Niveau</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => setSelected(lead)}
                className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{lead.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{lead.phone || "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{lead.vehicleInterest || "—"}</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-600">{lead.leadScore}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${LEVEL_STYLES[lead.qualificationLevel || ""] || "bg-gray-100 text-gray-500"}`}>
                    {lead.qualificationLevel || "NEW"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[lead.status] || "bg-gray-100 text-gray-500"}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {lead.source === "WHATSAPP" ? (
                    <MessageCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Globe className="w-4 h-4 text-blue-500" />
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {new Date(lead.createdAt).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">
                  Aucun lead trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${LEVEL_STYLES[selected.qualificationLevel || ""] || "bg-gray-100 text-gray-500"}`}>
                    {selected.qualificationLevel || "NEW"}
                  </span>
                  <span className="text-2xl font-bold text-gray-900">{selected.leadScore}/100</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <Detail label="Téléphone" value={selected.phone} />
                  <Detail label="Email" value={selected.email} />
                  <Detail label="Véhicule" value={selected.vehicleInterest} />
                  <Detail label="Source" value={selected.source} />
                  <Detail label="Ville" value={selected.city} />
                  <Detail label="Type" value={selected.purchaseType} />
                  <Detail label="Budget Min" value={selected.budgetMin ? `${selected.budgetMin.toLocaleString()} MAD` : null} />
                  <Detail label="Budget Max" value={selected.budgetMax ? `${selected.budgetMax.toLocaleString()} MAD` : null} />
                  <Detail label="Délai" value={selected.timeline} />
                  <Detail label="Reprise" value={selected.tradeInVehicle} />
                  <Detail label="Financement" value={selected.financingInterest ? "Oui" : "Non"} />
                  <Detail label="Date" value={new Date(selected.createdAt).toLocaleDateString("fr-FR")} />
                </div>

                {/* Status Update */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-500 mb-2">Changer le statut</p>
                  <div className="flex flex-wrap gap-2">
                    {["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(selected.id, s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selected.status === s
                            ? "bg-[#dc2626] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm text-gray-900">{value || "—"}</p>
    </div>
  );
}
