"use client"

import { useState, useEffect } from "react"
import { Clock, CheckCircle, XCircle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCountdown, getRemainingMs, getSlaZone } from "shared"

const DECLINE_REASONS = ["Out of stock", "Cannot fulfil in time", "Buyer did not meet requirements", "Other"]

function LiveTimer({ deadline }: { deadline: string }) {
  const [remaining, setRemaining] = useState(getRemainingMs(new Date(deadline)))

  useEffect(() => {
    const interval = setInterval(() => setRemaining(getRemainingMs(new Date(deadline))), 1000)
    return () => clearInterval(interval)
  }, [deadline])

  const zone = getSlaZone(remaining)
  const colors = { safe: "text-green-500", warning: "text-amber-500", critical: "text-red-500 animate-pulse", breached: "text-red-600" }

  return (
    <div className={`flex items-center gap-1.5 font-mono text-base font-bold ${colors[zone]}`}>
      <Clock className="w-4 h-4" />
      {remaining <= 0 ? "EXPIRED" : formatCountdown(remaining)}
    </div>
  )
}

export default function VendorOrdersPage() {
  const [subOrders, setSubOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [declineReason, setDeclineReason] = useState<Record<string, string>>({})

  const token = () => localStorage.getItem("accessToken")
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

  const fetchOrders = async () => {
    const res = await fetch(`${base}/vendor/orders?pageSize=50`, { headers: { Authorization: `Bearer ${token()}` } })
    const data = await res.json()
    setSubOrders(data.data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  const accept = async (id: string) => {
    setActionLoading(id)
    await fetch(`${base}/sub-orders/${id}/accept`, { method: "PATCH", headers: { Authorization: `Bearer ${token()}` } })
    await fetchOrders()
    setActionLoading(null)
  }

  const decline = async (id: string) => {
    const reason = declineReason[id]
    if (!reason) { alert("Please select a decline reason"); return }
    setActionLoading(id)
    await fetch(`${base}/sub-orders/${id}/decline`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ reason }),
    })
    await fetchOrders()
    setActionLoading(null)
  }

  const pending = subOrders.filter((o) => o.status === "PENDING_ACCEPTANCE")
  const others = subOrders.filter((o) => o.status !== "PENDING_ACCEPTANCE")

  if (loading) {
    return (
      <div className="container py-8 max-w-4xl">
        <Skeleton className="h-8 w-40 mb-6" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full mb-4 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Order Inbox</h1>
        {pending.length > 0 && (
          <Badge variant="destructive" className="text-sm px-3 py-1">{pending.length} pending</Badge>
        )}
      </div>

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Requires Action</h2>
          <div className="space-y-4">
            {pending.map((order) => {
              const zone = getSlaZone(getRemainingMs(new Date(order.acceptanceDeadline)))
              return (
                <Card key={order.id} className={`glass-card border-2 ${zone === "critical" ? "border-red-500/50" : zone === "warning" ? "border-amber-500/30" : "border-primary/20"}`}>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{order.order?.buyer?.name}</p>
                        <p className="text-xs text-muted-foreground">{order.order?.buyer?.email}</p>
                      </div>
                      <LiveTimer deadline={order.acceptanceDeadline} />
                    </div>

                    <div className="space-y-1">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{item.quantity}×</span>
                          <span className="flex-1">{item.product?.title}</span>
                          <span className="font-medium">₹{(Number(item.unitPrice) * item.quantity).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <p className="text-xs text-muted-foreground italic">Note: {order.notes}</p>
                    )}

                    <div className="flex gap-3 items-center pt-1">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                        onClick={() => accept(order.id)}
                        disabled={actionLoading === order.id}
                      >
                        <CheckCircle className="w-4 h-4" /> Accept
                      </Button>

                      <Select value={declineReason[order.id] ?? ""} onValueChange={(v) => setDeclineReason((prev) => ({ ...prev, [order.id]: v }))}>
                        <SelectTrigger className="w-52 h-9">
                          <SelectValue placeholder="Decline reason…" />
                        </SelectTrigger>
                        <SelectContent>
                          {DECLINE_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => decline(order.id)}
                        disabled={actionLoading === order.id || !declineReason[order.id]}
                      >
                        <XCircle className="w-4 h-4 mr-1" /> Decline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Recent Orders</h2>
          <div className="space-y-2">
            {others.map((order) => (
              <Card key={order.id} className="glass-card">
                <CardContent className="p-3 flex items-center gap-3">
                  <Badge variant="outline" className="text-xs shrink-0">{order.status.replace(/_/g, " ")}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{order.items?.[0]?.product?.title}</p>
                    <p className="text-xs text-muted-foreground">{order.order?.buyer?.name}</p>
                  </div>
                  <p className="text-sm font-bold shrink-0">
                    ₹{order.items?.reduce((s: number, i: any) => s + Number(i.unitPrice) * i.quantity, 0).toLocaleString("en-IN")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!pending.length && !others.length && (
        <div className="text-center py-20 text-muted-foreground">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No orders yet. Your orders will appear here.</p>
        </div>
      )}
    </div>
  )
}
