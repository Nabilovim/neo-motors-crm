"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Flame, Calendar, Clock, Info } from "lucide-react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const TYPE_CONFIG: Record<string, { icon: typeof Bell; color: string }> = {
  HOT_LEAD: { icon: Flame, color: "text-orange-500" },
  NEW_APPOINTMENT: { icon: Calendar, color: "text-blue-500" },
  LEAD_INACTIVE: { icon: Clock, color: "text-yellow-500" },
  SYSTEM: { icon: Info, color: "text-gray-400" },
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (ids: string[]) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n))
    );
  };

  const handleClick = (notif: Notification) => {
    if (!notif.isRead) markAsRead([notif.id]);
    if (notif.link) {
      router.push(notif.link);
      setOpen(false);
    }
  };

  const markAllRead = () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length > 0) markAsRead(unreadIds);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#dc2626] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-[#dc2626] hover:underline">
                Tout marquer lu
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">Aucune notification</p>
            ) : (
              notifications.map((notif) => {
                const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.SYSTEM;
                const Icon = config.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-white/5 ${
                      !notif.isRead ? "bg-white/[0.02]" : ""
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate ${notif.isRead ? "text-gray-400" : "text-white font-medium"}`}>
                          {notif.title}
                        </p>
                        {!notif.isRead && <span className="w-2 h-2 bg-[#dc2626] rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                      <p className="text-[10px] text-gray-600 mt-1">
                        {new Date(notif.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
