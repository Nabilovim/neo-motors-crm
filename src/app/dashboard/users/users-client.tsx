"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Shield, UserCheck, UserX } from "lucide-react";

interface CrmUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SALES";
  isActive: boolean;
  monthlyGoal: number;
  createdAt: string;
  _count: { assignedLeads: number };
}

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  SALES: "bg-blue-100 text-blue-700",
};

export function UsersClient({ users: initialUsers }: { users: CrmUser[] }) {
  const [users] = useState(initialUsers);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CrmUser | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "SALES", monthlyGoal: "10" });
  const [deleting, setDeleting] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", role: "SALES", monthlyGoal: "10" });
    setEditing(null);
    setShowModal(false);
  };

  const openEdit = (user: CrmUser) => {
    setEditing(user);
    setForm({ name: user.name, email: user.email, password: "", role: user.role, monthlyGoal: String(user.monthlyGoal) });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editing) {
        const res = await fetch(`/api/users/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, role: form.role, monthlyGoal: form.monthlyGoal }),
        });
        if (res.ok) window.location.reload();
      } else {
        if (!form.password) { setLoading(false); return; }
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (user: CrmUser) => {
    await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    setDeleting(null);
    window.location.reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Rôle</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Objectif mensuel</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Leads assignés</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_STYLES[user.role]}`}>
                    <Shield className="w-3 h-3 inline mr-1" />
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.isActive ? (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <UserCheck className="w-3.5 h-3.5" /> Actif
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <UserX className="w-3.5 h-3.5" /> Inactif
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.monthlyGoal}</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-600">{user._count.assignedLeads}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(user)} className="text-gray-400 hover:text-[#dc2626] transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleActive(user)} className="text-gray-400 hover:text-yellow-500 transition-colors" title={user.isActive ? "Désactiver" : "Activer"}>
                      {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setDeleting(user.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">
                  Aucun utilisateur
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={resetForm}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#dc2626]"
                  placeholder="Nom complet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#dc2626]"
                  placeholder="email@example.com"
                />
              </div>
              {!editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#dc2626]"
                    placeholder="Mot de passe"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#dc2626]"
                >
                  <option value="SALES">Commercial (SALES)</option>
                  <option value="ADMIN">Administrateur (ADMIN)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objectif mensuel</label>
                <input
                  type="number"
                  value={form.monthlyGoal}
                  onChange={(e) => setForm({ ...form, monthlyGoal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#dc2626]"
                  min="0"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-2.5 bg-[#dc2626] text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "..." : editing ? "Enregistrer" : "Créer l'utilisateur"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleting && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setDeleting(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Supprimer l&apos;utilisateur ?</h3>
            <p className="text-sm text-gray-500 mb-4">Cette action est irréversible. Les leads assignés seront désassignés.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleting(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Annuler
              </button>
              <button onClick={() => handleDelete(deleting)} className="flex-1 py-2 bg-[#dc2626] text-white rounded-lg text-sm font-medium hover:bg-red-700">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
