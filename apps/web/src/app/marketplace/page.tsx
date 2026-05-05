"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search, ShoppingCart, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

const CATEGORIES = [
  { slug: "all", name: "All Categories" },
  { slug: "horses", name: "🐴 Horses" },
  { slug: "feed-supplements", name: "🌾 Feed & Supplements" },
  { slug: "tack-accessories", name: "🏇 Tack & Accessories" },
  { slug: "grooming-health", name: "✨ Grooming & Health" },
  { slug: "stable-equipment", name: "🏠 Stable Equipment" },
]

function ProductCard({ product }: { product: any }) {
  const coverImage = product.media?.[0]?.url

  return (
    <Card className="glass-card group hover:scale-[1.01] transition-all duration-200 overflow-hidden">
      <Link href={`/marketplace/${product.id}`}>
        <div className="aspect-[4/3] bg-muted/50 overflow-hidden">
          {coverImage ? (
            <img src={coverImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              {product.category?.slug === "horses" ? "🐴" : "📦"}
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/marketplace/${product.id}`}>
            <h3 className="font-medium text-sm leading-tight hover:text-primary transition-colors line-clamp-2">{product.title}</h3>
          </Link>
          {product.isFeatured && <Badge variant="secondary" className="shrink-0 text-xs">Featured</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">{product.vendor?.businessName}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-bold">₹{Number(product.price).toLocaleString("en-IN")}</span>
          <Link href={`/marketplace/${product.id}`}>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
              <ShoppingCart className="w-3 h-3" /> View
            </Button>
          </Link>
        </div>
        {product.freightRequired && <p className="text-xs text-amber-600">Freight required</p>}
      </CardContent>
    </Card>
  )
}

export default function MarketplacePage() {
  const [q, setQ] = useState("")
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState("newest")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [products, setProducts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set("q", q)
      if (category && category !== "all") params.set("categorySlug", category)
      if (sort) params.set("sort", sort)
      if (minPrice) params.set("minPrice", minPrice)
      if (maxPrice) params.set("maxPrice", maxPrice)
      params.set("page", String(page))
      params.set("pageSize", "24")

      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
      const res = await fetch(`${base}/products/search?${params}`)
      const data = await res.json()
      setProducts(data.data ?? [])
      setTotal(data.total ?? 0)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [category, sort, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchProducts()
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Marketplace</h1>
            <p className="text-muted-foreground text-sm">{total.toLocaleString()} products</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder='Search "hay", "saddle", "gelding"…' className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1) }}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1) }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low → High</SelectItem>
              <SelectItem value="price_desc">Price: High → Low</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2 items-center">
            <Input placeholder="Min ₹" className="w-24" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} type="number" />
            <span className="text-muted-foreground text-sm">–</span>
            <Input placeholder="Max ₹" className="w-24" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} type="number" />
            <Button variant="outline" size="sm" onClick={() => { setPage(1); fetchProducts() }}>Apply</Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No products found</p>
            <p className="text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">Page {page}</span>
              <Button variant="outline" disabled={products.length < 24} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
