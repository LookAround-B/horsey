"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingBag, Store, Bell, User, ArrowRight, Package, Clock, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/stores"
import { useMe } from "@/lib/api/hooks"
import { API_BASE } from "@/lib/api"

const STATUS_ICON: Record<string, any> = {
  PENDING_ACCEPTANCE: Clock,
  ACCEPTED: CheckCircle,
  DECLINED: XCircle,
  AUTO_CANCELLED: XCircle,
  SHIPPED: Package,
  DELIVERED: CheckCircle,
}

const STATUS_COLOR: Record<string, string> = {
  PENDING_ACCEPTANCE: "text-amber-500",
  ACCEPTED: "text-green-500",
  DECLINED: "text-red-500",
  AUTO_CANCELLED: "text-red-500",
  SHIPPED: "text-blue-500",
  DELIVERED: "text-green-600",
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: profile, isLoading: profileLoading } = useMe()
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const base = API_BASE
  const token = () => localStorage.getItem("horsey_access_token")

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token()}` }
    Promise.all([
      fetch(`${base}/orders?pageSize=5`, { headers }).then((r) => r.json()).catch(() => ({})),
      fetch(`${base}/notifications?unreadOnly=false`, { headers }).then((r) => r.json()).catch(() => []),
      fetch(`${base}/notifications/unread-count`, { headers }).then((r) => r.json()).catch(() => 0),
    ]).then(([orders, notifs, count]) => {
      setRecentOrders(orders?.data?.slice(0, 5) ?? [])
      setNotifications(Array.isArray(notifs) ? notifs.slice(0, 4) : [])
      setUnreadCount(typeof count === "number" ? count : 0)
      setLoadingOrders(false)
    })
  }, [])

  const quickActions = [
    { href: "/marketplace", label: "Browse Marketplace", icon: Store, color: "from-orange-500 to-amber-500" },
    { href: "/orders", label: "My Orders", icon: ShoppingBag, color: "from-blue-500 to-indigo-500" },
    { href: "/cart", label: "Cart", icon: Package, color: "from-green-500 to-emerald-500" },
    { href: "/dashboard/profile", label: "Edit Profile", icon: User, color: "from-violet-500 to-purple-500" },
  ]

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, <span className="gradient-text">{user?.name || "Rider"}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Your equestrian marketplace hub — orders, listings, and notifications.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="glass-card group hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full">
              <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Recent Orders
            </CardTitle>
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                All orders <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingOrders ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-6">
                <Package className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No orders yet</p>
                <Link href="/marketplace">
                  <Button size="sm" variant="outline" className="mt-3 gap-1">
                    <Store className="w-3 h-3" /> Browse marketplace
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order: any) => {
                  const firstSubOrder = order.subOrders?.[0]
                  const StatusIcon = firstSubOrder ? (STATUS_ICON[firstSubOrder.status] ?? Package) : Package
                  const statusColor = firstSubOrder ? (STATUS_COLOR[firstSubOrder.status] ?? "text-muted-foreground") : "text-muted-foreground"
                  return (
                    <div key={order.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <StatusIcon className={`w-4 h-4 shrink-0 ${statusColor}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {firstSubOrder?.items?.[0]?.product?.title ?? "Order"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {firstSubOrder?.status?.replace(/_/g, " ") ?? "—"}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">{unreadCount}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-6">
                <Bell className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((n: any) => (
                  <div key={n.id} className={`p-3 rounded-lg text-sm ${n.isRead ? "opacity-60" : "bg-primary/5"}`}>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
