"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Shield, Clock, Star, Package, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
    fetch(`${base}/products/${id}`)
      .then((r) => r.json())
      .then((data) => { setProduct(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    setAddingToCart(true)
    try {
      const token = localStorage.getItem("accessToken")
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
      await fetch(`${base}/cart/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: id, variantId: selectedVariant, quantity }),
      })
      router.push("/cart")
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Product not found</p>
        <Link href="/marketplace"><Button className="mt-4">Back to Marketplace</Button></Link>
      </div>
    )
  }

  const images = product.media?.filter((m: any) => m.type === "IMAGE") ?? []
  const videos = product.media?.filter((m: any) => m.type === "VIDEO") ?? []
  const isHorse = product.category?.slug === "horses"
  const avgRating = product.reviews?.length
    ? (product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length).toFixed(1)
    : null

  return (
    <div className="container py-8 max-w-6xl">
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Media */}
        <div className="space-y-3">
          <div className="aspect-square rounded-xl overflow-hidden bg-muted/50">
            {images[selectedImage] ? (
              <img src={images[selectedImage].url} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                {isHorse ? "🐴" : "📦"}
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === i ? "border-primary" : "border-transparent"}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {videos[0] && (
            <video src={videos[0].url} controls className="w-full rounded-xl" />
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{product.category?.name}</Badge>
              {product.isFeatured && <Badge>Featured</Badge>}
            </div>
            <h1 className="text-2xl font-bold">{product.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-3xl font-bold">₹{Number(product.price).toLocaleString("en-IN")}</span>
              {avgRating && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {avgRating} ({product._count?.reviews} reviews)
                </span>
              )}
            </div>
          </div>

          {/* Vendor Card */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
              {product.vendor?.businessName?.[0]}
            </div>
            <div>
              <p className="text-sm font-medium">{product.vendor?.businessName}</p>
              <p className="text-xs text-muted-foreground">Verified Vendor</p>
            </div>
          </div>

          {/* Freight Warning */}
          {product.freightRequired && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-700 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Freight shipping required for this item. Coordinate directly with vendor.
            </div>
          )}

          {/* Horse-specific fields */}
          {isHorse && product.attributes && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Horse Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(product.attributes as Record<string, any>).map(([k, v]) => (
                  v ? (
                    <div key={k}>
                      <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}: </span>
                      <span className="font-medium">{String(v)}</span>
                    </div>
                  ) : null
                ))}
              </div>
            </div>
          )}

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Options</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${selectedVariant === v.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                  >
                    {v.label}
                    {v.price && ` — ₹${Number(v.price).toLocaleString("en-IN")}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Qty:</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button variant="outline" size="sm" onClick={() => setQuantity((q) => q + 1)}>+</Button>
            </div>
          </div>

          {/* 24h SLA badge */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-green-500" />
            <span>Vendor has {isHorse ? "72" : "24"} hours to accept or your payment is auto-refunded</span>
          </div>

          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg gap-2"
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            <ShoppingCart className="w-5 h-5" />
            {addingToCart ? "Adding…" : "Add to Cart"}
          </Button>

          {/* Description */}
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews?.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">Reviews ({product._count?.reviews})</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {product.reviews.map((review: any) => (
              <Card key={review.id} className="glass-card">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{review.buyer?.name}</span>
                  </div>
                  {review.body && <p className="text-sm text-muted-foreground">{review.body}</p>}
                  {review.response && (
                    <div className="pl-3 border-l-2 border-primary/30 mt-2">
                      <p className="text-xs font-medium text-primary">Vendor response</p>
                      <p className="text-xs text-muted-foreground">{review.response.body}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
