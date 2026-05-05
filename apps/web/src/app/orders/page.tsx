"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Clock, CheckCircle, XCircle, Package, Truck, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCountdown, getRemainingMs, getSlaZone } from "shared"

function CountdownTimer({ deadline }: { deadline: string }) {
  const [remaining, setRemaining] = useState(getRemainingMs(new Date(deadline)))

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getRemainingMs(new Date(deadline)))
    }, 1000)
    return () => clearInterval(interval)
  }, [deadline])

  const zone = getSlaZone(remaining)
  const color = zone === "critical" ? "text-red-500" : zone === "warning" ? "text-amber-500" : "text-green-500"

  if (remaining <= 0) return <span className="text-red-500 font-mono text-sm font-bold">Expired</span>
  return <span className={`font-mono text-sm font-bold ${color}`}>{formatCountdown(remaining)}</span>
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  PENDING_ACCEPTANCE: { label: "Pending Acceptance", icon: Clock, color: "bg-amber-500/10 text-amber-700" },
  ACCEPTED: { label: "Accepted", icon: CheckCircle, color: "bg-green-500/10 text-green-700" },
  DECLINED: { label: "Declined", icon: XCircle, color: "bg-red-500/10 text-red-700" },
  AUTO_CANCELLED: { label: "Auto-Cancelled", icon: XCircle, color: "bg-red-500/10 text-red-700" },
  SHIPPED: { label: "Shipped", icon: Truck, color: "bg-blue-500/10 text-blue-700" },
  DELIVERED: { label: "Delivered", icon: Package, color: "bg-green-500/10 text-green-700" },
  REFUNDED: { label: "Refunded", icon: CheckCircle, color: "bg-muted text-muted-foreground" },
}

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
    fetch(`${base}/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setOrders(data.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="container py-8 max-w-3xl">
        <Skeleton className="h-8 w-32 mb-6" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full mb-4 rounded-xl" />)}
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="container py-20 text-center max-w-md mx-auto">
        <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-40" />
        <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
        <p className="text-muted-foreground mb-6">Your orders will appear here once you make a purchase.</p>
        <Link href="/marketplace">
          <button className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Browse Marketplace</button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.flatMap((order: any) =>
          order.subOrders.map((subOrder: any) => {
            const cfg = STATUS_CONFIG[subOrder.status] ?? STATUS_CONFIG.PENDING_ACCEPTANCE
            const Icon = cfg.icon
            const isPending = subOrder.status === "PENDING_ACCEPTANCE"

            return (
              <Card key={subOrder.id} className="glass-card">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{subOrder.vendor?.businessName}</p>
                      <p className="text-xs text-muted-foreground">Order #{order.id.slice(-8)}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-1">
                    {subOrder.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">{item.quantity}×</span>
                        <span className="truncate">{item.product?.title}</span>
                        <span className="ml-auto font-medium">₹{(Number(item.unitPrice) * item.quantity).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>

                  {/* SLA countdown for pending orders */}
                  {isPending && subOrder.acceptanceDeadline && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-xs text-muted-foreground">Vendor responds in:</span>
                      <CountdownTimer deadline={subOrder.acceptanceDeadline} />
                    </div>
                  )}

                  {/* Tracking */}
                  {subOrder.trackingNumber && (
                    <p className="text-xs text-muted-foreground">
                      Tracking: <span className="font-mono font-medium">{subOrder.trackingNumber}</span>
                    </p>
                  )}

                  {/* Cancelled reason */}
                  {(subOrder.status === "DECLINED" || subOrder.status === "AUTO_CANCELLED") && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                      {subOrder.status === "AUTO_CANCELLED"
                        ? "Order auto-cancelled — vendor did not respond. Full refund will be processed."
                        : `Declined: ${subOrder.declineReason}`}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
