"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ShoppingBag, Store, Bell, User, ArrowRight, Package, Clock,
  CheckCircle, XCircle, BarChart3, TrendingUp, Shield, Users,
  FolderTree, MessageSquare,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/stores"
import { useMe } from "@/lib/api/hooks"
import apiClient from "@/lib/api/client"

/* ─── Shared status helpers ─────────────────────────────────────────────── */
const STATUS_ICON: Record<string, any> = {
  PENDING_ACCEPTANCE: Clock, ACCEPTED: CheckCircle, DECLINED: XCircle,
  AUTO_CANCELLED: XCircle, SHIPPED: Package, DELIVERED: CheckCircle,
}
const STATUS_COLOR: Record<string, string> = {
  PENDING_ACCEPTANCE: "text-amber-500", ACCEPTED: "text-green-500",
  DECLINED: "text-red-500", AUTO_CANCELLED: "text-red-500",
  SHIPPED: "text-blue-500", DELIVERED: "text-green-600",
}

/* ─── Buyer dashboard ────────────────────────────────────────────────────── */
function BuyerDashboard({ name }: { name: string }) {
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiClient.get("/orders?pageSize=5").catch(() => null),
      apiClient.get("/notifications?unreadOnly=false").catch(() => null),
      apiClient.get("/notifications/unread-count").catch(() => null),
    ]).then(([ordersRes, notifsRes, countRes]) => {
      // res.data = TransformInterceptor envelope: { success, data: <service result> }
      const ordersBody = ordersRes?.data?.data  // { data: [...], total }
      const ordersArr = ordersBody?.data ?? ordersBody ?? []
      const notifsBody = notifsRes?.data?.data  // array or { data: [] }
      const notifsArr = Array.isArray(notifsBody) ? notifsBody : (notifsBody?.data ?? [])
      const countBody = countRes?.data?.data
      const unread = typeof countBody === "number" ? countBody : 0
      setRecentOrders(Array.isArray(ordersArr) ? ordersArr.slice(0, 5) : [])
      setNotifications(Array.isArray(notifsArr) ? notifsArr.slice(0, 4) : [])
      setUnreadCount(unread)
      setLoading(false)
    })
  }, [])

  const quickActions = [
    { href: "/marketplace",       label: "Browse",       icon: Store,      color: "from-orange-500 to-amber-500" },
    { href: "/orders",            label: "My Orders",    icon: ShoppingBag, color: "from-blue-500 to-indigo-500" },
    { href: "/cart",              label: "Cart",         icon: Package,    color: "from-green-500 to-emerald-500" },
    { href: "/dashboard/profile", label: "Profile",      icon: User,       color: "from-violet-500 to-purple-500" },
  ]

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickActions.map((a) => (
          <Link key={a.href} href={a.href}>
            <Card className="glass-card group hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full">
              <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <a.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium">{a.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingBag className="w-5 h-5 text-primary" /> Recent Orders
            </CardTitle>
            <Link href="/orders"><Button variant="ghost" size="sm" className="gap-1 text-xs">All <ArrowRight className="w-3 h-3" /></Button></Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-6">
                <Package className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No orders yet</p>
                <Link href="/marketplace"><Button size="sm" variant="outline" className="mt-3 gap-1"><Store className="w-3 h-3" /> Browse</Button></Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order: any) => {
                  const sub = order.subOrders?.[0]
                  const Icon = STATUS_ICON[sub?.status] ?? Package
                  return (
                    <div key={order.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <Icon className={`w-4 h-4 shrink-0 ${STATUS_COLOR[sub?.status] ?? "text-muted-foreground"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{sub?.items?.[0]?.product?.title ?? "Order"}</p>
                        <p className="text-xs text-muted-foreground">₹{Number(order.totalAmount).toLocaleString("en-IN")}</p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">{sub?.status?.replace(/_/g, " ") ?? "—"}</Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5 text-primary" /> Notifications
              {unreadCount > 0 && <Badge variant="destructive" className="text-xs">{unreadCount}</Badge>}
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
    </>
  )
}

/* ─── Vendor dashboard ───────────────────────────────────────────────────── */
function VendorDashboard({ name }: { name: string }) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get("/vendors/me/analytics")
      .then(r => { setAnalytics(r.data?.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const stats = analytics ? [
    { label: "Orders Today",    value: analytics.ordersToday ?? 0,                                              icon: Package,    color: "text-blue-500",   bg: "bg-blue-500/10" },
    { label: "This Week",       value: analytics.ordersThisWeek ?? 0,                                           icon: ShoppingBag,color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "GMV This Month",  value: `₹${(analytics.gmvThisMonth ?? 0).toLocaleString("en-IN")}`,            icon: TrendingUp, color: "text-green-500",  bg: "bg-green-500/10" },
    { label: "Acceptance Rate", value: `${analytics.acceptanceRate ?? 0}%`,                                     icon: BarChart3,  color: "text-amber-500",  bg: "bg-amber-500/10" },
  ] : []

  const quickActions = [
    { href: "/vendor/orders",       label: "Order Inbox",  icon: Package   },
    { href: "/vendor/listings",     label: "My Listings",  icon: Store     },
    { href: "/vendor/payouts",      label: "Payouts",      icon: TrendingUp },
    { href: "/vendor/listings/new", label: "New Listing",  icon: BarChart3 },
  ]

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {loading ? [1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />) :
          stats.map(s => (
            <Card key={s.label} className="glass-card">
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))
        }
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map(a => (
          <Link key={a.href} href={a.href}>
            <Card className="glass-card group hover:scale-[1.02] transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <a.icon className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">{a.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  )
}

/* ─── Admin dashboard ────────────────────────────────────────────────────── */
function AdminDashboard({ name }: { name: string }) {
  const sections = [
    { href: "/admin/vendors",    label: "Vendor Applications", icon: Shield,       desc: "Review & approve vendors",    color: "text-purple-500", bg: "bg-purple-500/10" },
    { href: "/admin/orders",     label: "Order Oversight",     icon: Package,      desc: "Monitor SLA & force actions", color: "text-blue-500",   bg: "bg-blue-500/10"   },
    { href: "/admin/users",      label: "User Management",     icon: Users,        desc: "Search & suspend accounts",   color: "text-green-500",  bg: "bg-green-500/10"  },
    { href: "/admin/categories", label: "Categories",          icon: FolderTree,   desc: "Manage product taxonomy",     color: "text-amber-500",  bg: "bg-amber-500/10"  },
    { href: "/admin/disputes",   label: "Disputes",            icon: MessageSquare,desc: "Resolve buyer-vendor cases",  color: "text-red-500",    bg: "bg-red-500/10"    },
    { href: "/admin/settings",   label: "Platform Settings",   icon: BarChart3,    desc: "Fees, SLA, payout terms",     color: "text-cyan-500",   bg: "bg-cyan-500/10"   },
  ]
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sections.map(s => (
        <Link key={s.href} href={s.href}>
          <Card className="glass-card group hover:scale-[1.02] transition-all cursor-pointer h-full">
            <CardContent className="p-5 space-y-3">
              <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="font-semibold text-sm">{s.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
              <div className="flex items-center text-xs text-primary font-medium gap-1 group-hover:gap-2 transition-all">
                Open <ArrowRight className="w-3 h-3" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

/* ─── Root dashboard page ────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useAuthStore()

  const greeting = `Welcome back, ${user?.name?.split(" ")[0] || "there"}`
  const sub = user?.role === "VENDOR"
    ? "Your vendor analytics and store management."
    : user?.role === "ADMIN"
    ? "Platform oversight and administration."
    : "Your equestrian marketplace hub."

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {greeting.split(",")[0]},&nbsp;
          <span className="gradient-text">{user?.name?.split(" ")[0] || "there"}</span>
        </h1>
        <p className="text-muted-foreground mt-1">{sub}</p>
      </div>

      {user?.role === "VENDOR" && <VendorDashboard name={user.name} />}
      {user?.role === "ADMIN"  && <AdminDashboard  name={user.name} />}
      {(!user?.role || user?.role === "BUYER") && <BuyerDashboard name={user?.name ?? ""} />}
    </div>
  )
}
