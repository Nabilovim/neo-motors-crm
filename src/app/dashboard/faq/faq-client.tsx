"use client";

import { useState, useMemo } from "react";
import {
  Search,
  X,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Edit3,
  Eye,
  EyeOff,
  HelpCircle,
  GripVertical,
  MessageSquare,
} from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  "Véhicules",
  "Service",
  "Financement",
  "Garantie",
  "Livraison",
  "Général",
];

const EMPTY_FORM = {
  question: "",
  answer: "",
  category: "",
  customCategory: "",
  sortOrder: "0",
};

export function FAQClient({ faqs: initialFaqs }: { faqs: FAQ[] }) {
  const [faqs] = useState(initialFaqs);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [previewFaq, setPreviewFaq] = useState<FAQ | null>(null);

  const filtered = useMemo(() => {
    return faqs.filter((f) => {
      if (filterCategory !== "ALL" && (f.category || "Général") !== filterCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q) ||
          (f.category && f.category.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [faqs, search, filterCategory]);

  const grouped = useMemo(() => {
    const map = new Map<string, FAQ[]>();
    for (const f of filtered) {
      const cat = f.category || "Général";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(f);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    faqs.forEach((f) => cats.add(f.category || "Général"));
    return Array.from(cats).sort();
  }, [faqs]);

  const toggleCollapse = (cat: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const openAdd = () => {
    setEditingFaq(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (faq: FAQ) => {
    const isCustom = faq.category && !CATEGORIES.includes(faq.category);
    setEditingFaq(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: isCustom ? "__custom__" : (faq.category || ""),
      customCategory: isCustom ? faq.category! : "",
      sortOrder: String(faq.sortOrder),
    });
    setShowModal(true);
  };

  const resolveCategory = () => {
    if (form.category === "__custom__") return form.customCategory.trim() || null;
    return form.category.trim() || null;
  };

  const saveFaq = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);

    const payload = {
      question: form.question,
      answer: form.answer,
      category: resolveCategory(),
      sortOrder: parseInt(form.sortOrder) || 0,
    };

    if (editingFaq) {
      await fetch(`/api/faq/${editingFaq.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setSaving(false);
    setShowModal(false);
    setEditingFaq(null);
    setForm(EMPTY_FORM);
    window.location.reload();
  };

  const toggleActive = async (faq: FAQ) => {
    await fetch(`/api/faq/${faq.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !faq.isActive }),
    });
    window.location.reload();
  };

  const deleteFaq = async (id: string) => {
    if (!window.confirm("Supprimer cette question FAQ ?")) return;
    await fetch(`/api/faq/${id}`, { method: "DELETE" });
    window.location.reload();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">FAQ / Base de connaissances</h1>
          <p className="text-sm text-gray-400 mt-1">
            {faqs.length} question(s) — {faqs.filter((f) => f.isActive).length} active(s)
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter une FAQ
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher une question ou réponse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#dc2626]"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#dc2626]"
        >
          <option value="ALL">Toutes les catégories</option>
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Grouped FAQs */}
      <div className="space-y-4">
        {grouped.map(([category, items]) => {
          const isCollapsed = collapsed.has(category);
          return (
            <div key={category} className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
              {/* Category Header */}
              <div
                onClick={() => toggleCollapse(category)}
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#222] transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isCollapsed ? (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                  <h2 className="text-lg font-bold text-white">{category}</h2>
                  <span className="text-sm text-gray-500">
                    {items.length} question(s)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full">
                    {items.filter((f) => f.isActive).length} active(s)
                  </span>
                </div>
              </div>

              {/* FAQ Items */}
              {!isCollapsed && (
                <div className="border-t border-gray-800">
                  {items.map((faq) => (
                    <div
                      key={faq.id}
                      className={`flex items-start gap-4 px-5 py-4 border-b border-gray-800/50 last:border-b-0 hover:bg-[#222] transition-colors ${
                        !faq.isActive ? "opacity-50" : ""
                      }`}
                    >
                      {/* Sort Order */}
                      <div className="flex items-center gap-1 pt-0.5 text-gray-600 shrink-0">
                        <GripVertical className="w-4 h-4" />
                        <span className="text-xs font-mono w-6 text-center">{faq.sortOrder}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <HelpCircle className="w-4 h-4 text-[#dc2626] mt-0.5 shrink-0" />
                          <p className="text-sm font-medium text-white leading-snug">{faq.question}</p>
                        </div>
                        <p className="text-sm text-gray-400 mt-1.5 ml-6 line-clamp-2">{faq.answer}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setPreviewFaq(faq)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                          title="Aperçu"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleActive(faq)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                          title={faq.isActive ? "Désactiver" : "Activer"}
                        >
                          {faq.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEdit(faq)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteFaq(faq.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-gray-800 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {grouped.length === 0 && (
          <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 px-4 py-12 text-center text-gray-500 text-sm">
            Aucune FAQ trouvée
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => { setShowModal(false); setEditingFaq(null); }}>
          <div className="bg-[#1a1a1a] rounded-xl shadow-xl w-full max-w-lg mx-4 border border-gray-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h2 className="text-lg font-bold text-white">
                {editingFaq ? "Modifier la FAQ" : "Nouvelle FAQ"}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingFaq(null); }} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Question *</label>
                <textarea
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  placeholder="Ex: Quels sont les délais de livraison ?"
                  rows={2}
                  className="w-full px-3 py-2 bg-[#0d0d0d] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#dc2626] resize-none"
                />
              </div>

              {/* Answer */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Réponse *</label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  placeholder="La réponse détaillée à la question..."
                  rows={4}
                  className="w-full px-3 py-2 bg-[#0d0d0d] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#dc2626] resize-none"
                />
              </div>

              {/* Category + Sort Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Catégorie</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0d0d0d] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-[#dc2626]"
                  >
                    <option value="">Aucune</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__custom__">Autre (personnalisée)...</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Ordre</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0d0d0d] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-[#dc2626]"
                  />
                </div>
              </div>

              {/* Custom Category */}
              {form.category === "__custom__" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Catégorie personnalisée</label>
                  <input
                    type="text"
                    value={form.customCategory}
                    onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
                    placeholder="Nom de la catégorie..."
                    className="w-full px-3 py-2 bg-[#0d0d0d] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#dc2626]"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-800">
              <button
                onClick={() => { setShowModal(false); setEditingFaq(null); }}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={saveFaq}
                disabled={!form.question.trim() || !form.answer.trim() || saving}
                className="px-4 py-2 bg-[#dc2626] text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Sauvegarde..." : editingFaq ? "Sauvegarder" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFaq && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setPreviewFaq(null)}>
          <div className="bg-[#1a1a1a] rounded-xl shadow-xl w-full max-w-md mx-4 border border-gray-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h2 className="text-lg font-bold text-white">Aperçu FAQ</h2>
              <button onClick={() => setPreviewFaq(null)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              {/* Preview card simulating how it looks to end users */}
              <div className="bg-[#0d0d0d] rounded-lg border border-gray-800 p-4">
                <div className="flex items-start gap-2 mb-3">
                  <HelpCircle className="w-5 h-5 text-[#dc2626] mt-0.5 shrink-0" />
                  <p className="text-white font-medium">{previewFaq.question}</p>
                </div>
                <div className="ml-7 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {previewFaq.answer}
                </div>
                {previewFaq.category && (
                  <div className="mt-3 ml-7">
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                      {previewFaq.category}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
                <span>Ordre: {previewFaq.sortOrder}</span>
                <span>{previewFaq.isActive ? "Active" : "Inactive"}</span>
                <span>Mis à jour: {new Date(previewFaq.updatedAt).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}