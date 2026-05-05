"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Package, ShoppingBag, TrendingUp, Clock, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function VendorDashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
    fetch(`${base}/vendors/me/analytics`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setAnalytics(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const stats = analytics ? [
    { label: "Orders Today", value: analytics.ordersToday, icon: Package, color: "text-blue-500" },
    { label: "Orders This Week", value: analytics.ordersThisWeek, icon: ShoppingBag, color: "text-purple-500" },
    { label: "GMV This Month", value: `₹${(analytics.gmvThisMonth ?? 0).toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-green-500" },
    { label: "Acceptance Rate", value: `${analytics.acceptanceRate ?? 0}%`, icon: Clock, color: "text-amber-500" },
  ] : []

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/vendor/listings"><Button variant="outline" size="sm">Manage Listings</Button></Link>
          <Link href="/vendor/orders"><Button size="sm">Order Inbox</Button></Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <Card key={s.label} className="glass-card">
              <CardContent className="p-4 space-y-2">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/vendor/listings/new" className="block"><Button variant="outline" className="w-full justify-start gap-2"><Package className="w-4 h-4" /> Add New Listing</Button></Link>
              <Link href="/vendor/orders" className="block"><Button variant="outline" className="w-full justify-start gap-2"><ShoppingBag className="w-4 h-4" /> View Pending Orders</Button></Link>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">SLA Reminder</h3>
            <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">24-Hour Acceptance SLA</p>
                <p className="text-xs text-muted-foreground mt-1">You must accept or decline all orders within 24 hours. 3 SLA breaches in 30 days will result in account suspension.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
