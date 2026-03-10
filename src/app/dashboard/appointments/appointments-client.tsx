"use client";

import { useState } from "react";
import { Check, X as XIcon, Clock, CheckCircle } from "lucide-react";

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

export function AppointmentsClient({ appointments }: { appointments: Appointment[] }) {
  const [filterStatus, setFilterStatus] = useState("ALL");

  const filtered = appointments.filter((a) => {
    if (filterStatus !== "ALL" && a.status !== filterStatus) return false;
    return true;
  });

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    window.location.reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rendez-vous</h1>
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
