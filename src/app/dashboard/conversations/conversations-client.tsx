"use client";

import { useState } from "react";
import { Globe, MessageCircle, X, Activity } from "lucide-react";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface ConvEvent {
  id: string;
  type: string;
  detail: string | null;
  createdAt: string;
}

interface Conversation {
  id: string;
  source: string;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  summary: string | null;
  sentiment: string | null;
  tags: string[];
  language: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  events: ConvEvent[];
}

const SENTIMENT_EMOJI: Record<string, string> = {
  POSITIVE: "😊",
  NEUTRAL: "😐",
  NEGATIVE: "😞",
};

export function ConversationsClient({ conversations }: { conversations: Conversation[] }) {
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [filterSource, setFilterSource] = useState("ALL");
  const [tab, setTab] = useState<"messages" | "events">("messages");

  const filtered = conversations.filter((c) => {
    if (filterSource !== "ALL" && c.source !== filterSource) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#dc2626]"
        >
          <option value="ALL">Toutes les sources</option>
          <option value="WEB">Web</option>
          <option value="WHATSAPP">WhatsApp</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Résumé</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Sentiment</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Messages</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tags</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((conv) => (
              <tr
                key={conv.id}
                onClick={() => { setSelected(conv); setTab("messages"); }}
                className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  {conv.source === "WHATSAPP" ? (
                    <MessageCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Globe className="w-5 h-5 text-blue-500" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{conv.contactName || "Anonyme"}</p>
                  <p className="text-xs text-gray-400">{conv.contactPhone || conv.contactEmail || "—"}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                  {conv.summary || "—"}
                </td>
                <td className="px-4 py-3 text-lg">
                  {conv.sentiment ? SENTIMENT_EMOJI[conv.sentiment] || "—" : "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{conv.messageCount}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {conv.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {new Date(conv.updatedAt).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">
                  Aucune conversation trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selected.contactName || "Conversation"}</h2>
                  <p className="text-sm text-gray-400">
                    {selected.source} · {selected.messageCount} messages
                    {selected.sentiment ? ` · ${SENTIMENT_EMOJI[selected.sentiment]}` : ""}
                  </p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selected.summary && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500 font-medium mb-1">Résumé IA</p>
                  <p className="text-sm text-gray-700">{selected.summary}</p>
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-4 border-b border-gray-200 mb-4">
                <button
                  onClick={() => setTab("messages")}
                  className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                    tab === "messages" ? "border-[#dc2626] text-[#dc2626]" : "border-transparent text-gray-400"
                  }`}
                >
                  Messages
                </button>
                <button
                  onClick={() => setTab("events")}
                  className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                    tab === "events" ? "border-[#dc2626] text-[#dc2626]" : "border-transparent text-gray-400"
                  }`}
                >
                  Événements ({selected.events.length})
                </button>
              </div>

              {tab === "messages" ? (
                <div className="space-y-3">
                  {selected.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg text-sm ${
                        msg.role === "user"
                          ? "bg-[#dc2626]/10 text-gray-900 ml-8"
                          : "bg-gray-100 text-gray-700 mr-8"
                      }`}
                    >
                      <p className="text-[10px] text-gray-400 mb-1 uppercase font-medium">
                        {msg.role === "user" ? "Client" : "Neo Motors"}
                      </p>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {selected.events.length === 0 ? (
                    <p className="text-gray-400 text-sm">Aucun événement</p>
                  ) : (
                    selected.events.map((event) => (
                      <div key={event.id} className="flex items-start gap-3 py-2 border-b border-gray-50">
                        <Activity className="w-4 h-4 text-orange-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{event.type.replace(/_/g, " ")}</p>
                          {event.detail && <p className="text-xs text-gray-500">{event.detail}</p>}
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(event.createdAt).toLocaleString("fr-FR")}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
