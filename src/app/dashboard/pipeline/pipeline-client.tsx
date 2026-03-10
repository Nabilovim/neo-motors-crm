"use client";

import { useState } from "react";
import { Search, Phone, Car } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string | null;
  vehicleInterest: string | null;
  status: string;
  leadScore: number;
  qualificationLevel: string | null;
  source: string;
  createdAt: string;
}

const COLUMNS = [
  { status: "NEW", label: "Nouveau", color: "#6b7280", bg: "bg-gray-500/10", border: "border-gray-600" },
  { status: "CONTACTED", label: "Contact\u00e9", color: "#3b82f6", bg: "bg-blue-500/10", border: "border-blue-600" },
  { status: "QUALIFIED", label: "Qualifi\u00e9", color: "#eab308", bg: "bg-yellow-500/10", border: "border-yellow-600" },
  { status: "CONVERTED", label: "Converti", color: "#22c55e", bg: "bg-green-500/10", border: "border-green-600" },
  { status: "LOST", label: "Perdu", color: "#ef4444", bg: "bg-red-500/10", border: "border-red-600" },
];

const LEVEL_COLORS: Record<string, string> = {
  HOT: "bg-red-600 text-white",
  WARM: "bg-orange-500 text-white",
  COLD: "bg-blue-500 text-white",
};

export function PipelineClient({ leads: initialLeads }: { leads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const filtered = leads.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      (l.phone && l.phone.includes(q)) ||
      (l.vehicleInterest && l.vehicleInterest.toLowerCase().includes(q))
    );
  });

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDragging(id);
  };

  const onDragEnd = () => {
    setDragging(null);
    setDragOver(null);
  };

  const onDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData("text/plain");
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.status === newStatus) return;

    // Optimistic update
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));

    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
        <span className="text-sm text-gray-400">{filtered.length} lead(s)</span>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un lead..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#dc2626]"
        />
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colLeads = filtered.filter((l) => l.status === col.status);
          const isOver = dragOver === col.status;

          return (
            <div
              key={col.status}
              className={`flex-shrink-0 w-64 rounded-xl border transition-colors ${
                isOver ? "border-[#dc2626] bg-red-50/5" : "border-gray-200 bg-gray-50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(col.status);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => onDrop(e, col.status)}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: col.color }} />
                  <span className="text-sm font-semibold text-gray-800">{col.label}</span>
                </div>
                <span className="text-xs font-mono bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  {colLeads.length}
                </span>
              </div>

              {/* Cards */}
              <div className="p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-280px)] overflow-y-auto">
                {colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, lead.id)}
                    onDragEnd={onDragEnd}
                    className={`bg-white rounded-lg border border-gray-100 p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all ${
                      dragging === lead.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900 leading-tight">{lead.name}</p>
                      <span className="text-xs font-mono font-bold text-[#dc2626] ml-2 flex-shrink-0">
                        {lead.leadScore}
                      </span>
                    </div>

                    {lead.phone && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{lead.phone}</span>
                      </div>
                    )}

                    {lead.vehicleInterest && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <Car className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{lead.vehicleInterest}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      {lead.qualificationLevel && (
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            LEVEL_COLORS[lead.qualificationLevel] || "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {lead.qualificationLevel}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400">
                        {new Date(lead.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                ))}

                {colLeads.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-xs text-gray-400">Aucun lead</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
