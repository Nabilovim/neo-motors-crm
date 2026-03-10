"use client";

import { useState } from "react";
import { Download, Users, Calendar, MessageSquare, Car, Loader2 } from "lucide-react";

const EXPORT_TYPES = [
  { key: "leads", label: "Leads", description: "Tous les prospects avec scores, statuts et informations de contact", icon: Users, color: "bg-red-600" },
  { key: "appointments", label: "Rendez-vous", description: "Tous les rendez-vous avec dates, véhicules et statuts", icon: Calendar, color: "bg-blue-600" },
  { key: "conversations", label: "Conversations", description: "Toutes les conversations avec résumés et sentiments", icon: MessageSquare, color: "bg-green-600" },
  { key: "vehicles", label: "Véhicules", description: "Stock complet avec modèles, variantes, prix et disponibilité", icon: Car, color: "bg-purple-600" },
];

export function ExportsClient() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (type: string) => {
    setLoading(type);
    try {
      const res = await fetch(`/api/export?type=${type}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `neo-motors-${type}-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Erreur lors de l'export");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Exports CSV</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {EXPORT_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <div key={type.key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${type.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{type.label}</h3>
                  <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                  <button
                    onClick={() => handleExport(type.key)}
                    disabled={loading === type.key}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50"
                  >
                    {loading === type.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {loading === type.key ? "Export en cours..." : "Télécharger CSV"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
