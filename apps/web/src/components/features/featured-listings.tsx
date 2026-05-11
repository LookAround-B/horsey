"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Star, ChevronRight, ShoppingCart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { API_BASE } from "@/lib/api"

export function FeaturedListings() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const base = API_BASE
    fetch(`${base}/products/featured`)
      .then((r) => r.json())
      .then((json) => {
        const list = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : []
        setProducts(list)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="outline" className="mb-2">Featured</Badge>
          <h2 className="text-2xl md:text-3xl font-bold">New Horses & Top Listings</h2>
          <p className="text-muted-foreground mt-1">Hand-picked by our team</p>
        </div>
        <Link href="/marketplace?featured=true" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {products.slice(0, 8).map((product) => {
          const coverImage = product.media?.[0]?.url
          const isHorse = product.category?.slug === "horses"

          return (
            <Link key={product.id} href={`/marketplace/${product.id}`}>
              <Card className="glass-card group hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full overflow-hidden">
                <div className="aspect-[4/3] bg-muted/50 overflow-hidden relative">
                  {coverImage ? (
                    <img src={coverImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      {isHorse ? "🐴" : "📦"}
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2 bg-orange-500/90 text-white text-[10px]">Featured</Badge>
                </div>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{product.vendor?.businessName}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-lg font-bold">₹{Number(product.price).toLocaleString("en-IN")}</span>
                    <span className="text-xs text-muted-foreground">{product.category?.name}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
