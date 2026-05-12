"use client"

import { useState, useEffect } from "react"
import { DollarSign, Clock, CheckCircle, AlertCircle, Download, ArrowUpDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import apiClient from "@/lib/api/client"

export default function VendorPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiClient.get("/vendors/me/payouts").catch(() => null),
      apiClient.get("/vendors/me/analytics").catch(() => null),
    ])
      .then(([payoutsRes, statsRes]) => {
        // strip TransformInterceptor envelope
        const payBody = payoutsRes?.data?.data  // { data: [...], total }
        const raw = payBody?.data ?? payBody ?? []
        setPayouts(Array.isArray(raw) ? raw : [])
        setStats(statsRes?.data?.data ?? null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const pendingTotal = payouts
    .filter((p) => p.status === "PENDING" || p.status === "SCHEDULED")
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const paidTotal = payouts
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amount), 0)

  if (loading) {
    return (
      <div className="max-w-4xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 mb-3 rounded-lg" />)}
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Payouts</h1>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="glass-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Paid</p>
                <p className="text-xl font-bold">₹{paidTotal.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending / Scheduled</p>
                <p className="text-xl font-bold">₹{pendingTotal.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">GMV (This Month)</p>
                <p className="text-xl font-bold">₹{(stats?.gmvThisMonth ?? 0).toLocaleString("en-IN")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout List */}
      {payouts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No payouts yet. Complete delivered orders to start earning.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-5 gap-4 text-xs text-muted-foreground font-medium px-4 py-2">
            <span>Date</span>
            <span>Sub-Order</span>
            <span>Amount</span>
            <span>Scheduled</span>
            <span>Status</span>
          </div>
          {payouts.map((payout) => {
            const statusColor =
              payout.status === "PAID"
                ? "bg-green-500/10 text-green-700"
                : payout.status === "FAILED"
                  ? "bg-red-500/10 text-red-700"
                  : "bg-amber-500/10 text-amber-700"

            return (
              <Card key={payout.id} className="glass-card">
                <CardContent className="p-4 grid grid-cols-5 gap-4 items-center text-sm">
                  <span className="text-muted-foreground text-xs">
                    {new Date(payout.createdAt).toLocaleDateString("en-IN")}
                  </span>
                  <span className="text-xs font-mono truncate">
                    {payout.subOrderId?.slice(-8) ?? "—"}
                  </span>
                  <span className="font-semibold">
                    ₹{Number(payout.amount).toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {payout.scheduledAt ? new Date(payout.scheduledAt).toLocaleDateString("en-IN") : "—"}
                  </span>
                  <Badge variant="outline" className={`text-[10px] w-fit ${statusColor}`}>
                    {payout.status}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
