"use client";

import { useState, useMemo } from "react";
import { Check, X as XIcon, Clock, CheckCircle, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface Appointment {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  vehicle: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  location: string | null;
  appointmentType: string | null;
  status: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-green-100 text-green-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const STATUS_DOT: Record<string, string> = {
  PENDING: "bg-yellow-400",
  CONFIRMED: "bg-green-500",
  COMPLETED: "bg-blue-500",
  CANCELLED: "bg-red-400",
};

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

function getWeekDays(baseDate: Date): Date[] {
  const day = baseDate.getDay();
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatWeekRange(days: Date[]): string {
  const first = days[0];
  const last = days[6];
  if (first.getMonth() === last.getMonth()) {
    return `${first.getDate()} – ${last.getDate()} ${MONTHS_FR[first.getMonth()]} ${first.getFullYear()}`;
  }
  return `${first.getDate()} ${MONTHS_FR[first.getMonth()].slice(0, 3)} – ${last.getDate()} ${MONTHS_FR[last.getMonth()].slice(0, 3)} ${last.getFullYear()}`;
}

export function AppointmentsClient({ appointments }: { appointments: Appointment[] }) {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [weekOffset, setWeekOffset] = useState(0);
  const [viewMode, setViewMode] = useState<"table" | "calendar">("calendar");

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const currentWeekBase = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [today, weekOffset]);

  const weekDays = useMemo(() => getWeekDays(currentWeekBase), [currentWeekBase]);

  const filtered = appointments.filter((a) => {
    if (filterStatus !== "ALL" && a.status !== filterStatus) return false;
    return true;
  });

  // Group appointments by day for calendar view
  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const apt of filtered) {
      if (!apt.preferredDate) continue;
      const d = new Date(apt.preferredDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(apt);
    }
    return map;
  }, [filtered]);

  const getAppointmentsForDay = (day: Date): Appointment[] => {
    const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
    return (appointmentsByDay.get(key) || []).sort((a, b) => {
      if (!a.preferredTime) return 1;
      if (!b.preferredTime) return -1;
      return a.preferredTime.localeCompare(b.preferredTime);
    });
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    window.location.reload();
  };

  const isToday = (day: Date) => isSameDay(day, today);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rendez-vous</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === "calendar" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Calendar className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              Calendrier
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === "table" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Tableau
            </button>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#dc2626]"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="CONFIRMED">Confirmé</option>
            <option value="COMPLETED">Terminé</option>
            <option value="CANCELLED">Annulé</option>
          </select>
        </div>
      </div>

      {/* Weekly Calendar View */}
      {viewMode === "calendar" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <button
              onClick={() => setWeekOffset((o) => o - 1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-800">
                {formatWeekRange(weekDays)}
              </span>
              {weekOffset !== 0 && (
                <button
                  onClick={() => setWeekOffset(0)}
                  className="text-xs text-[#dc2626] hover:text-red-700 font-medium"
                >
                  Aujourd&apos;hui
                </button>
              )}
            </div>
            <button
              onClick={() => setWeekOffset((o) => o + 1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day Columns */}
          <div className="grid grid-cols-7 divide-x divide-gray-100">
            {weekDays.map((day, i) => {
              const dayAppts = getAppointmentsForDay(day);
              const todayClass = isToday(day);
              return (
                <div key={i} className={`min-h-[160px] ${todayClass ? "bg-red-50/30" : ""}`}>
                  {/* Day Header */}
                  <div className={`px-2 py-2 text-center border-b border-gray-100 ${todayClass ? "bg-red-50" : "bg-gray-50/50"}`}>
                    <div className={`text-xs font-medium ${todayClass ? "text-[#dc2626]" : "text-gray-400"}`}>
                      {DAYS_FR[i]}
                    </div>
                    <div className={`text-lg font-bold mt-0.5 ${todayClass ? "text-[#dc2626] bg-[#dc2626] text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto" : "text-gray-700"}`}>
                      {day.getDate()}
                    </div>
                  </div>
                  {/* Appointments */}
                  <div className="p-1.5 space-y-1.5">
                    {dayAppts.map((apt) => (
                      <div
                        key={apt.id}
                        className="rounded-lg px-2 py-1.5 text-xs border border-gray-100 bg-white shadow-sm hover:shadow transition-shadow cursor-default"
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[apt.status] || "bg-gray-300"}`} />
                          <span className="font-semibold text-gray-800 truncate">{apt.name}</span>
                        </div>
                        {apt.preferredTime && (
                          <div className="text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {apt.preferredTime}
                          </div>
                        )}
                        {apt.vehicle && (
                          <div className="text-gray-500 truncate mt-0.5">{apt.vehicle}</div>
                        )}
                        {apt.location && (
                          <div className="text-gray-400 truncate mt-0.5">{apt.location}</div>
                        )}
                      </div>
                    ))}
                    {dayAppts.length === 0 && (
                      <div className="text-center text-gray-300 text-xs py-4">—</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Téléphone</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Véhicule</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Heure</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Lieu</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((apt) => (
              <tr key={apt.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{apt.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{apt.phone || "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{apt.vehicle || "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {apt.preferredDate ? new Date(apt.preferredDate).toLocaleDateString("fr-FR") : "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{apt.preferredTime || "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{apt.location || "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{apt.appointmentType || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[apt.status] || "bg-gray-100 text-gray-500"}`}>
                    {apt.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {apt.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => updateStatus(apt.id, "CONFIRMED")}
                          className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          title="Confirmer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateStatus(apt.id, "CANCELLED")}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Annuler"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {apt.status === "CONFIRMED" && (
                      <button
                        onClick={() => updateStatus(apt.id, "COMPLETED")}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Terminé"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {(apt.status === "COMPLETED" || apt.status === "CANCELLED") && (
                      <Clock className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400 text-sm">
                  Aucun rendez-vous trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
