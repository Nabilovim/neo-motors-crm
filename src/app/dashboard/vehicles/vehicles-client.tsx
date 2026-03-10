"use client";

import { useState } from "react";
import { Search, X, Plus, Minus, Trash2 } from "lucide-react";

interface Vehicle {
  id: string;
  model: string;
  variant: string | null;
  color: string | null;
  status: string;
  price: number | null;
  stockCount: number;
  description: string | null;
  specs: Record<string, string> | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  RESERVED: "bg-orange-100 text-orange-700",
  SOLD: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Réservé",
  SOLD: "Vendu",
};

const EMPTY_FORM = {
  model: "",
  variant: "",
  color: "",
  price: "",
  stockCount: "1",
  description: "",
  imageUrl: "",
};

export function VehiclesClient({ vehicles }: { vehicles: Vehicle[] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = vehicles.filter((v) => {
    if (filterStatus !== "ALL" && v.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        v.model.toLowerCase().includes(q) ||
        (v.variant && v.variant.toLowerCase().includes(q)) ||
        (v.color && v.color.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const addVehicle = async () => {
    if (!form.model.trim()) return;
    setSaving(true);
    await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setShowAdd(false);
    setForm(EMPTY_FORM);
    window.location.reload();
  };

  const updateVehicle = async (id: string, data: Record<string, unknown>) => {
    await fetch(`/api/vehicles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    window.location.reload();
  };

  const deleteVehicle = async (id: string) => {
    if (!window.confirm("Supprimer ce véhicule ?")) return;
    await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    window.location.reload();
  };

  const openEdit = (v: Vehicle) => {
    setForm({
      model: v.model,
      variant: v.variant || "",
      color: v.color || "",
      price: v.price ? String(v.price) : "",
      stockCount: String(v.stockCount),
      description: v.description || "",
      imageUrl: v.imageUrl || "",
    });
    setEditMode(true);
  };

  const saveEdit = async () => {
    if (!selected) return;
    setSaving(true);
    await fetch(`/api/vehicles/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setEditMode(false);
    window.location.reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Véhicules</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{filtered.length} véhicule(s)</span>
          <button
            onClick={() => { setShowAdd(true); setForm(EMPTY_FORM); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par modèle, variante ou couleur..."
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
          <option value="AVAILABLE">Disponible</option>
          <option value="RESERVED">Réservé</option>
          <option value="SOLD">Vendu</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Modèle</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Variante</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Couleur</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Prix</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Mis à jour</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr
                key={v.id}
                onClick={() => { setSelected(v); setEditMode(false); }}
                className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{v.model}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{v.variant || "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{v.color || "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {v.price ? `${v.price.toLocaleString("fr-FR")} MAD` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-mono ${v.stockCount <= 2 ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                    {v.stockCount}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[v.status] || "bg-gray-100 text-gray-500"}`}>
                    {STATUS_LABELS[v.status] || v.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {new Date(v.updatedAt).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">
                  Aucun véhicule trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Vehicle Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Nouveau véhicule</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <FormField label="Modèle *" value={form.model} onChange={(v) => setForm({ ...form, model: v })} placeholder="Ex: Dial-E, G-Neo, Neo 4-Cylindres" />
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Variante" value={form.variant} onChange={(v) => setForm({ ...form, variant: v })} placeholder="Ex: DC, AC, Lithium" />
                <FormField label="Couleur" value={form.color} onChange={(v) => setForm({ ...form, color: v })} placeholder="Ex: Rouge, Blanc" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Prix (MAD)" value={form.price} onChange={(v) => setForm({ ...form, price: v })} placeholder="Ex: 180000" type="number" />
                <FormField label="Stock" value={form.stockCount} onChange={(v) => setForm({ ...form, stockCount: v })} type="number" />
              </div>
              <FormField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Description optionnelle" />
              <FormField label="Image URL" value={form.imageUrl} onChange={(v) => setForm({ ...form, imageUrl: v })} placeholder="https://..." />
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                Annuler
              </button>
              <button
                onClick={addVehicle}
                disabled={!form.model.trim() || saving}
                className="px-4 py-2 bg-[#dc2626] text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Ajout..." : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">{selected.model}</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!editMode ? (
                <div className="space-y-4">
                  {/* Status + Stock */}
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_STYLES[selected.status]}`}>
                      {STATUS_LABELS[selected.status]}
                    </span>
                    <span className="text-lg font-bold text-gray-900">Stock: {selected.stockCount}</span>
                  </div>

                  {/* Quick Stock Update */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => updateVehicle(selected.id, { stockCount: Math.max(0, selected.stockCount - 1) })}
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-mono w-12 text-center">{selected.stockCount}</span>
                    <button
                      onClick={() => updateVehicle(selected.id, { stockCount: selected.stockCount + 1 })}
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <Detail label="Modèle" value={selected.model} />
                    <Detail label="Variante" value={selected.variant} />
                    <Detail label="Couleur" value={selected.color} />
                    <Detail label="Prix" value={selected.price ? `${selected.price.toLocaleString("fr-FR")} MAD` : null} />
                    <Detail label="Description" value={selected.description} />
                    <Detail label="Image" value={selected.imageUrl} />
                    <Detail label="Créé le" value={new Date(selected.createdAt).toLocaleDateString("fr-FR")} />
                    <Detail label="Mis à jour" value={new Date(selected.updatedAt).toLocaleDateString("fr-FR")} />
                  </div>

                  {/* Status Update */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-500 mb-2">Changer le statut</p>
                    <div className="flex gap-2">
                      {(["AVAILABLE", "RESERVED", "SOLD"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateVehicle(selected.id, { status: s })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            selected.status === s
                              ? "bg-[#dc2626] text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openEdit(selected)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => deleteVehicle(selected.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <div className="space-y-4">
                  <FormField label="Modèle" value={form.model} onChange={(v) => setForm({ ...form, model: v })} />
                  <FormField label="Variante" value={form.variant} onChange={(v) => setForm({ ...form, variant: v })} />
                  <FormField label="Couleur" value={form.color} onChange={(v) => setForm({ ...form, color: v })} />
                  <FormField label="Prix (MAD)" value={form.price} onChange={(v) => setForm({ ...form, price: v })} type="number" />
                  <FormField label="Stock" value={form.stockCount} onChange={(v) => setForm({ ...form, stockCount: v })} type="number" />
                  <FormField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
                  <FormField label="Image URL" value={form.imageUrl} onChange={(v) => setForm({ ...form, imageUrl: v })} />
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-[#dc2626] text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {saving ? "Sauvegarde..." : "Sauvegarder"}
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
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

function FormField({ label, value, onChange, placeholder, type = "text" }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#dc2626]"
      />
    </div>
  );
}