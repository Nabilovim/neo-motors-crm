"use client";

import { useState, useEffect } from "react";
import { Clock, Phone, Mail, AlertTriangle, RefreshCw } from "lucide-react";

interface InactiveLead {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  vehicleInterest: string | null;
  leadScore: number;
  qualificationLevel: string | null;
  status: string;
  lastContactedAt: string | null;
  createdAt: string;
  assignedTo: { name: string } | null;
  conversation: { id: string; messageCount: number; updatedAt: string } | null;
}

export function RelanceClient() {
  const [leads, setLeads] = useState<InactiveLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  const fetchInactive = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/inactive?days=${days}`);
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInactive(); }, [days]); // eslint-disable-line react-hooks/exhaustive-deps

  const daysSince = (date: string | null) => {
    if (!date) return "—";
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    return `${diff}j`;
  };

  const levelColor: Record<string, string> = {
    HOT: "bg-red-100 text-red-700",
    WARM: "bg-orange-100 text-orange-700",
    COLD: "bg-blue-100 text-blue-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relance Automatique</h1>
          <p className="text-sm text-gray-500 mt-1">Leads inactifs nécessitant un suivi</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value={3}>Inactifs +3 jours</option>
            <option value={7}>Inactifs +7 jours</option>
            <option value={14}>Inactifs +14 jours</option>
            <option value={30}>Inactifs +30 jours</option>
          </select>
          <button onClick={fetchInactive} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">HOT inactifs</span>
          </div>
          <p className="text-2xl font-bold">{leads.filter(l => l.qualificationLevel === "HOT").length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-orange-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">WARM inactifs</span>
          </div>
          <p className="text-2xl font-bold">{leads.filter(l => l.qualificationLevel === "WARM").length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Total à relancer</span>
          </div>
          <p className="text-2xl font-bold">{leads.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Aucun lead inactif pour cette période</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Prospect</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Véhicule</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Niveau</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Score</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Inactif depuis</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Assigné</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-gray-500">
                      {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>}
                      {lead.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>}
                      {!lead.phone && !lead.email && "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{lead.vehicleInterest || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelColor[lead.qualificationLevel || ""] || "bg-gray-100 text-gray-500"}`}>
                      {lead.qualificationLevel || "NEW"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-600">{lead.leadScore}/100</td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {daysSince(lead.lastContactedAt || lead.createdAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{lead.assignedTo?.name || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
