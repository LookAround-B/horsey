"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Check, CheckCheck, Clock, Package, XCircle, Truck, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/stores"
import apiClient from "@/lib/api/client"

const TYPE_ICONS: Record<string, any> = {
  ORDER_PLACED: Package,
  ORDER_ACCEPTED: Check,
  ORDER_DECLINED: XCircle,
  ORDER_AUTO_CANCELLED: AlertTriangle,
  ORDER_SHIPPED: Truck,
  ORDER_DELIVERED: Package,
  SLA_REMINDER_T_12H: Clock,
  SLA_REMINDER_T_4H: Clock,
  SLA_REMINDER_T_1H: AlertTriangle,
  SLA_BREACH_STRIKE: AlertTriangle,
}

export function NotificationBell() {
  const { isAuthenticated } = useAuthStore()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const [notifRes, countRes] = await Promise.all([
        apiClient.get("/notifications"),
        apiClient.get("/notifications/unread-count"),
      ])
      // TransformInterceptor wraps: res.data.data = service result
      const notifs = notifRes.data?.data
      const count = countRes.data?.data
      setNotifications(Array.isArray(notifs) ? notifs : [])
      setUnreadCount(typeof count === "number" ? count : count?.count ?? 0)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // poll every 30s
    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const markAllRead = async () => {
    await apiClient.patch("/notifications/mark-all-read").catch(() => {})
    setUnreadCount(0)
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const markRead = async (ids: string[]) => {
    await apiClient.patch("/notifications/mark-read", { ids }).catch(() => {})
    setUnreadCount((c) => Math.max(0, c - ids.length))
    setNotifications((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n)))
  }

  if (!isAuthenticated) return null

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => { setOpen(!open); if (!open) fetchNotifications() }}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[28rem] rounded-xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-xl overflow-hidden z-50 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary hover:underline flex items-center gap-1">
                <CheckCheck className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-[22rem]">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = TYPE_ICONS[n.type] || Bell
                return (
                  <button
                    key={n.id}
                    onClick={() => !n.isRead && markRead([n.id])}
                    className={`w-full text-left px-4 py-3 border-b border-border/20 transition-colors hover:bg-muted/50 ${!n.isRead ? "bg-primary/5" : ""}`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!n.isRead ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-tight ${!n.isRead ? "font-medium" : ""}`}>{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
