"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import apiClient from "@/lib/api/client"

const HORSE_ATTRS = ["lineage", "registry", "breed", "trainingLevel", "age"]
const FEED_ATTRS = ["brand", "weight", "ingredients"]
const TACK_ATTRS = ["size", "color", "discipline"]

export default function NewListingPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [price, setPrice] = useState("")
  const [inventory, setInventory] = useState("1")
  const [lowStockAlert, setLowStockAlert] = useState("5")
  const [status, setStatus] = useState("DRAFT")
  const [freightRequired, setFreightRequired] = useState(false)
  const [attributes, setAttributes] = useState<Record<string, string>>({})
  const [mediaUrls, setMediaUrls] = useState<{ url: string; type: string }[]>([])
  const [newMediaUrl, setNewMediaUrl] = useState("")
  const [newMediaType, setNewMediaType] = useState("IMAGE")

  useEffect(() => {
    apiClient.get("/products/categories")
      .then((r) => {
        const list = r.data?.data  // TransformInterceptor: res.data.data = array
        setCategories(Array.isArray(list) ? list : [])
      })
      .catch(() => {})
  }, [])

  const selectedCategory = categories.find((c) => c.id === categoryId)
  const attrKeys =
    selectedCategory?.slug === "horses"
      ? HORSE_ATTRS
      : selectedCategory?.slug === "feed-supplements"
        ? FEED_ATTRS
        : selectedCategory?.slug === "tack-accessories"
          ? TACK_ATTRS
          : []

  const addMedia = () => {
    if (!newMediaUrl.trim()) return
    setMediaUrls((prev) => [...prev, { url: newMediaUrl.trim(), type: newMediaType }])
    setNewMediaUrl("")
  }

  const removeMedia = (i: number) => {
    setMediaUrls((prev) => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await apiClient.post("/products", {
        title,
        description,
        categoryId,
        price: parseFloat(price),
        inventory: parseInt(inventory),
        lowStockAlert: parseInt(lowStockAlert),
        status,
        freightRequired,
        attributes,
      })
      const product = res.data?.data  // TransformInterceptor: res.data.data = created product

      // Upload media URLs
      if (mediaUrls.length > 0) {
        await Promise.all(
          mediaUrls.map((m) =>
            apiClient.post(`/products/${product.id}/media`, { url: m.url, type: m.type })
          )
        )
      }

      router.push("/vendor/listings")
    } catch (err: any) {
      setError(err.response?.data?.data?.message || err.response?.data?.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Link href="/vendor/listings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Listings
      </Link>

      <h1 className="text-2xl font-bold mb-6">New Listing</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Premium Hay Bale 40kg" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder="Describe your product in detail…"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setAttributes({}) }} required>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Save as Draft</SelectItem>
                    <SelectItem value="ACTIVE">Publish Now</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Inventory */}
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Pricing &amp; Inventory</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input id="price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inventory">Stock Qty *</Label>
                <Input id="inventory" type="number" min="0" value={inventory} onChange={(e) => setInventory(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lowStock">Low Stock Alert</Label>
                <Input id="lowStock" type="number" min="0" value={lowStockAlert} onChange={(e) => setLowStockAlert(e.target.value)} />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={freightRequired}
                onChange={(e) => setFreightRequired(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm">Freight shipping required (large/heavy items)</span>
            </label>
          </CardContent>
        </Card>

        {/* Category-specific attributes */}
        {attrKeys.length > 0 && (
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">{selectedCategory?.name} Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {attrKeys.map((key) => (
                <div key={key} className="space-y-1.5">
                  <Label className="capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
                  <Input
                    value={attributes[key] ?? ""}
                    onChange={(e) => setAttributes((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={key}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Media */}
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Media</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Image or video URL"
                value={newMediaUrl}
                onChange={(e) => setNewMediaUrl(e.target.value)}
                className="flex-1"
              />
              <Select value={newMediaType} onValueChange={setNewMediaType}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IMAGE">Image</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" onClick={addMedia} className="gap-1">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>

            {mediaUrls.length > 0 && (
              <div className="space-y-2">
                {mediaUrls.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <Badge variant="outline" className="text-xs shrink-0">{m.type}</Badge>
                    <span className="text-xs text-muted-foreground flex-1 truncate">{m.url}</span>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeMedia(i)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Add URLs for product images. For horse listings, add multiple high-resolution images and optionally a video.</p>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3">
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white gap-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : status === "ACTIVE" ? "Publish Listing" : "Save Draft"}
          </Button>
          <Link href="/vendor/listings">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
