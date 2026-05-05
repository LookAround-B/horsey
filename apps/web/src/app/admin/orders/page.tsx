"use client"

import { useState, useEffect } from "react"
import { Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminOrdersPage() {
  const [sla, setSla] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const token = () => localStorage.getItem("accessToken")
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

  const fetchData = async () => {
    setLoading(true)
    const params = new URLSearchParams({ pageSize: "50" })
    if (statusFilter !== "all") params.set("status", statusFilter)
    const [slaRes, ordersRes] = await Promise.all([
      fetch(`${base}/admin/sla-dashboard`, { headers: { Authorization: `Bearer ${token()}` } }),
      fetch(`${base}/admin/orders?${params}`, { headers: { Authorization: `Bearer ${token()}` } }),
    ])
    setSla(await slaRes.json())
    const oData = await ordersRes.json()
    setOrders(oData.data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [statusFilter])

  const forceAction = async (id: string, action: "force-accept" | "force-cancel") => {
    setActionLoading(id)
    await fetch(`${base}/admin/sub-orders/${id}/${action}`, { method: "PATCH", headers: { Authorization: `Bearer ${token()}` } })
    await fetchData()
    setActionLoading(null)
  }

  return (
    <div className="container py-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Order Oversight</h1>

      {/* SLA Dashboard */}
      {sla && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{sla.pending}</p>
              <p className="text-xs text-muted-foreground mt-1">Pending Acceptance</p>
            </CardContent>
          </Card>
          <Card className={`glass-card ${sla.nearingBreach > 0 ? "border-amber-500/50" : ""}`}>
            <CardContent className="p-4 text-center">
              <p className={`text-3xl font-bold ${sla.nearingBreach > 0 ? "text-amber-500" : ""}`}>{sla.nearingBreach}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                {sla.nearingBreach > 0 && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                Nearing Breach (&lt;1h)
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-500">{sla.recentBreaches}</p>
              <p className="text-xs text-muted-foreground mt-1">Auto-Cancelled (24h)</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING_ACCEPTANCE">Pending</SelectItem>
            <SelectItem value="ACCEPTED">Accepted</SelectItem>
            <SelectItem value="DECLINED">Declined</SelectItem>
            <SelectItem value="AUTO_CANCELLED">Auto-Cancelled</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchData}>Refresh</Button>
      </div>

      {/* Order Feed */}
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => {
            const isPending = order.status === "PENDING_ACCEPTANCE"
            const remainingMs = isPending ? Math.max(0, new Date(order.acceptanceDeadline).getTime() - Date.now()) : 0
            const isNearingBreach = isPending && remainingMs < 60 * 60 * 1000

            return (
              <Card key={order.id} className={`glass-card ${isNearingBreach ? "border-amber-500/50" : ""}`}>
                <CardContent className="p-3 flex items-center gap-4">
                  <Badge variant="outline" className="shrink-0 text-xs">{order.status.replace(/_/g, " ")}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{order.vendor?.businessName}</p>
                    <p className="text-xs text-muted-foreground truncate">{order.order?.buyer?.name} · {order.items?.[0]?.product?.title}</p>
                  </div>
                  {isPending && (
                    <div className="shrink-0 flex items-center gap-1 text-xs font-mono font-bold text-amber-500">
                      <Clock className="w-3 h-3" />
                      {new Date(order.acceptanceDeadline).toLocaleTimeString()}
                    </div>
                  )}
                  <div className="shrink-0 flex gap-1">
                    {isPending && (
                      <>
                        <Button size="sm" variant="ghost" className="h-7 text-green-600 text-xs" onClick={() => forceAction(order.id, "force-accept")} disabled={actionLoading === order.id}>Force Accept</Button>
                        <Button size="sm" variant="ghost" className="h-7 text-red-600 text-xs" onClick={() => forceAction(order.id, "force-cancel")} disabled={actionLoading === order.id}>Force Cancel</Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
