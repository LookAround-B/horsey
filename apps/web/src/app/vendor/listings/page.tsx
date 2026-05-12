"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Package, Edit, Archive, Eye, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import apiClient from "@/lib/api/client"

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-600 border-green-500/20",
  DRAFT: "bg-muted text-muted-foreground",
  ARCHIVED: "bg-red-500/10 text-red-600 border-red-500/20",
  SCHEDULED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  SOLD: "bg-amber-500/10 text-amber-600 border-amber-500/20",
}

export default function VendorListingsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchListings = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get(`/products/vendor/my-listings?page=${page}&pageSize=20`)
      const body = res.data?.data  // { data: [...], total }
      const raw = body?.data ?? body ?? []
      setProducts(Array.isArray(raw) ? raw : [])
      setTotal(body?.total ?? 0)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchListings() }, [page])

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id)
    await apiClient.patch(`/products/${id}`, { status })
    await fetchListings()
    setUpdatingId(null)
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-sm text-muted-foreground">{total} products</p>
        </div>
        <Link href="/vendor/listings/new">
          <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white gap-2">
            <Plus className="w-4 h-4" />
            New Listing
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No listings yet</p>
          <p className="text-sm mt-1 mb-6">Create your first product listing to start selling.</p>
          <Link href="/vendor/listings/new">
            <Button className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              <Plus className="w-4 h-4" /> Create Listing
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => {
            const cover = product.media?.[0]?.url
            const isLowStock = product.inventory <= product.lowStockAlert && product.inventory > 0
            const outOfStock = product.inventory === 0

            return (
              <Card key={product.id} className="glass-card">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-muted/50 overflow-hidden shrink-0">
                    {cover ? (
                      <img src={cover} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        {product.category?.slug === "horses" ? "🐴" : "📦"}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{product.title}</p>
                      {isLowStock && (
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <AlertTriangle className="w-3 h-3" /> Low stock
                        </span>
                      )}
                      {outOfStock && (
                        <span className="text-xs text-red-600 font-medium">Out of stock</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span>{product.category?.name}</span>
                      <span>₹{Number(product.price).toLocaleString("en-IN")}</span>
                      <span>Stock: {product.inventory}</span>
                      <span>{product._count?.orderItems ?? 0} orders</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-xs ${STATUS_COLORS[product.status] ?? ""}`}
                    >
                      {product.status}
                    </Badge>

                    <Select
                      value={product.status}
                      onValueChange={(v) => updateStatus(product.id, v)}
                      disabled={updatingId === product.id}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>

                    <Link href={`/marketplace/${product.id}`} target="_blank">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {total > 20 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">Page {page}</span>
              <Button variant="outline" disabled={products.length < 20} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
