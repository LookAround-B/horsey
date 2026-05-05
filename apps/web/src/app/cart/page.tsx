"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export default function CartPage() {
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchCart = async () => {
    const token = localStorage.getItem("accessToken")
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
    const res = await fetch(`${base}/cart`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setCart(data)
    setLoading(false)
  }

  const removeItem = async (itemId: string) => {
    const token = localStorage.getItem("accessToken")
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
    await fetch(`${base}/cart/items/${itemId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
    fetchCart()
  }

  useEffect(() => { fetchCart() }, [])

  const total = cart?.items?.reduce((sum: number, item: any) => {
    const price = item.variant?.price ?? item.product?.price ?? 0
    return sum + Number(price) * item.quantity
  }, 0) ?? 0

  const vendorGroups = cart?.items?.reduce((groups: Record<string, any[]>, item: any) => {
    const vid = item.product?.vendor?.id ?? "unknown"
    if (!groups[vid]) groups[vid] = []
    groups[vid].push(item)
    return groups
  }, {} as Record<string, any[]>) ?? {}

  if (loading) {
    return (
      <div className="container py-8 max-w-3xl">
        <Skeleton className="h-8 w-32 mb-6" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full mb-3" />)}
      </div>
    )
  }

  if (!cart?.items?.length) {
    return (
      <div className="container py-20 text-center max-w-md mx-auto">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-40" />
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add items from the marketplace to get started.</p>
        <Link href="/marketplace"><Button>Browse Marketplace</Button></Link>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Cart ({cart.items.length} items)</h1>

      <div className="space-y-6">
        {Object.entries(vendorGroups).map(([vendorId, items]: [string, any]) => (
          <Card key={vendorId} className="glass-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wide">
                {items[0]?.product?.vendor?.businessName ?? "Vendor"}
              </p>
              <div className="space-y-3">
                {items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-muted/50 overflow-hidden shrink-0">
                      {item.product?.media?.[0]?.url ? (
                        <img src={item.product.media[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product?.title}</p>
                      {item.variant && <p className="text-xs text-muted-foreground">{item.variant.label}</p>}
                      <p className="text-sm font-bold">
                        ₹{Number(item.variant?.price ?? item.product?.price ?? 0).toLocaleString("en-IN")} × {item.quantity}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeItem(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Total</p>
            <p className="text-2xl font-bold">₹{total.toLocaleString("en-IN")}</p>
          </div>
          <Link href="/checkout">
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white gap-2">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
