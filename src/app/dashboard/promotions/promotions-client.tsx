"use client";

import { useState, useMemo } from "react";
import { Search, X, Plus, Trash2, Tag, Pencil, ToggleLeft, ToggleRight } from "lucide-react";

interface Promotion {
  id: string;
  title: string;
  description: string;
  vehicleModel: string | null;
  discountType: string | null;
  discountValue: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const EMPTY_FORM = {
  title: "",
  description: "",
  vehicleModel: "",
  discountType: "",
  discountValue: "",
  startDate: "",
  endDate: "",
  isActive: true,
};

const DISCOUNT_TYPES = [
  { value: "", label: "Aucun" },
  { value: "PERCENTAGE", label: "Pourcentage (%)" },
  { value: "FIXED", label: "Montant fixe (MAD)" },
  { value: "GIFT", label: "Cadeau" },
];

function getStatus(promo: Promotion): "active" | "expired" | "upcoming" | "inactive" {
  if (!promo.isActive) return "inactive";
  const now = new Date();
  const start = new Date(promo.startDate);
  const end = new Date(promo.endDate);
  if (now < start) return "upcoming";
  if (now > end) return "expired";
  return "active";
}

const STATUS_CONFIG = {
  active: { label: "Active", style: "bg-green-900/50 text-green-400 border border-green-800" },
  expired: { label: "Expirée", style: "bg-red-900/50 text-red-400 border border-red-800" },
  upcoming: { label: "A venir", style: "bg-blue-900/50 text-blue-400 border border-blue-800" },
  inactive: { label: "Inactive", style: "bg-gray-800 text-gray-400 border border-gray-700" },
};

function formatDiscount(type: string | null, value: number | null): string {
  if (!type || value == null) return "—";
  if (type === "PERCENTAGE") return `${value}%`;
  if (type === "FIXED") return `${value.toLocaleString("fr-FR")} MAD`;
  if (type === "GIFT") return "Cadeau";
  return "—";
}

export function PromotionsClient({
  promotions,
  vehicleModels,
}: {
  promotions: Promotion[];
  vehicleModels: string[];
}) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return promotions;
    const q = search.toLowerCase();
    return promotions.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.vehicleModel && p.vehicleModel.toLowerCase().includes(q))
    );
  }, [promotions, search]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (p: Promotion) => {
    setForm({
      title: p.title,
      description: p.description,
      vehicleModel: p.vehicleModel || "",
      discountType: p.discountType || "",
      discountValue: p.discountValue != null ? String(p.discountValue) : "",
      startDate: p.startDate.slice(0, 10),
      endDate: p.endDate.slice(0, 10),
      isActive: p.isActive,
    });
    setEditId(p.id);
    setShowModal(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.startDate || !form.endDate) return;
    setSaving(true);
    const url = editId ? `/api/promotions/${editId}` : "/api/promotions";
    const method = editId ? "PATCH" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        discountValue: form.discountValue || null,
      }),
    });
    setSaving(false);
    setShowModal(false);
    setEditId(null);
    window.location.reload();
  };

  const toggleActive = async (p: Promotion) => {
    await fetch(`/api/promotions/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    window.location.reload();
  };

  const deletePromotion = async (id: string) => {
    if (!window.confirm("Supprimer cette promotion ?")) return;
    await fetch(`/api/promotions/${id}`, { method: "DELETE" });
    window.location.reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Promotions & Offres</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {filtered.length} promotion(s)
          </span>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par titre, description ou modèle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#dc2626]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Titre</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Modèle</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Remise</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Début</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Fin</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const status = getStatus(p);
              const cfg = STATUS_CONFIG[status];
              return (
                <tr
                  key={p.id}
                  className="border-t border-gray-800/50 hover:bg-white/5 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-white">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{p.vehicleModel || "Tous"}</td>
                  <td className="px-4 py-3 text-sm text-gray-300 font-medium">
                    {formatDiscount(p.discountType, p.discountValue)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(p.startDate).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(p.endDate).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.style}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleActive(p)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        title={p.isActive ? "Désactiver" : "Activer"}
                      >
                        {p.isActive ? (
                          <ToggleRight className="w-4 h-4 text-green-400" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePromotion(p.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500 text-sm">
                  Aucune promotion trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => { setShowModal(false); setEditId(null); }}
        >
          <div
            className="bg-[#1a1a1a] rounded-xl shadow-xl w-full max-w-lg mx-4 border border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h2 className="text-lg font-bold text-white">
                {editId ? "Modifier la promotion" : "Nouvelle promotion"}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditId(null); }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <FormField
                label="Titre *"
                value={form.title}
                onChange={(v) => setForm({ ...form, title: v })}
                placeholder="Ex: Offre de lancement Neo 4C"
              />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Détails de la promotion..."
                  rows={3}
                  className="w-full px-3 py-2 bg-[#0d0d0d] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#dc2626]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Modèle de véhicule</label>
                <select
                  value={form.vehicleModel}
                  onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0d0d0d] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-[#dc2626]"
                >
                  <option value="">Tous les modèles</option>
                  {vehicleModels.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type de remise</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0d0d0d] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-[#dc2626]"
                  >
                    {DISCOUNT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <FormField
                  label="Valeur"
                  value={form.discountValue}
                  onChange={(v) => setForm({ ...form, discountValue: v })}
                  placeholder="Ex: 10"
                  type="number"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Date de début *"
                  value={form.startDate}
                  onChange={(v) => setForm({ ...form, startDate: v })}
                  type="date"
                />
                <FormField
                  label="Date de fin *"
                  value={form.endDate}
                  onChange={(v) => setForm({ ...form, endDate: v })}
                  type="date"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-300">Active</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {form.isActive ? (
                    <ToggleRight className="w-6 h-6 text-green-400" />
                  ) : (
                    <ToggleLeft className="w-6 h-6" />
                  )}
                </button>
                <span className="text-sm text-gray-400">{form.isActive ? "Oui" : "Non"}</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-800">
              <button
                onClick={() => { setShowModal(false); setEditId(null); }}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={save}
                disabled={!form.title.trim() || !form.description.trim() || !form.startDate || !form.endDate || saving}
                className="px-4 py-2 bg-[#dc2626] text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Sauvegarde..." : editId ? "Sauvegarder" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-[#0d0d0d] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#dc2626]"
      />
    </div>
  );
}