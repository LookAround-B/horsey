"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const token = () => localStorage.getItem("accessToken")
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

  const fetchVendors = async () => {
    const res = await fetch(`${base}/vendors/applications`, { headers: { Authorization: `Bearer ${token()}` } })
    const data = await res.json()
    setVendors(data.data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchVendors() }, [])

  const review = async (id: string, action: string) => {
    setActionLoading(id)
    await fetch(`${base}/vendors/${id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ action }),
    })
    await fetchVendors()
    setActionLoading(null)
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Vendor Applications</h1>
        <Badge variant="secondary">{vendors.length} pending</Badge>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No pending applications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="glass-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{vendor.businessName}</p>
                    <p className="text-sm text-muted-foreground">{vendor.user?.name} · {vendor.user?.email}</p>
                    <div className="flex gap-2 mt-1">
                      {vendor.gstNumber && <Badge variant="outline" className="text-xs">GST: {vendor.gstNumber}</Badge>}
                      {vendor.panNumber && <Badge variant="outline" className="text-xs">PAN: {vendor.panNumber}</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(vendor.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {vendor.kycDocuments?.length > 0 && (
                  <div className="flex gap-2">
                    {vendor.kycDocuments.map((doc: any) => (
                      <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer">
                        <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-primary/10">
                          <Eye className="w-3 h-3" /> {doc.type}
                        </Badge>
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5" onClick={() => review(vendor.id, "APPROVED")} disabled={actionLoading === vendor.id}>
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => review(vendor.id, "REJECTED")} disabled={actionLoading === vendor.id}>
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => review(vendor.id, "MORE_INFO_REQUESTED")} disabled={actionLoading === vendor.id}>
                    Request Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
