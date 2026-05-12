"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Loader2, FolderTree } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import apiClient from "@/lib/api/client"

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: "", slug: "", slaHours: "24" })
  const [saving, setSaving] = useState(false)

  const fetchCategories = async () => {
    const res = await apiClient.get("/products/categories")
    const body = res.data?.data  // strip envelope; categories endpoint returns array directly
    setCategories(Array.isArray(body) ? body : [])
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])

  const seedDefaults = async () => {
    setSaving(true)
    await apiClient.post("/products/admin/seed-categories")
    await fetchCategories()
    setSaving(false)
  }

  const startCreate = () => {
    setEditing(null)
    setForm({ name: "", slug: "", slaHours: "24" })
    setCreating(true)
  }

  const startEdit = (cat: any) => {
    setCreating(false)
    setEditing(cat)
    setForm({ name: cat.name, slug: cat.slug, slaHours: String(cat.slaHours ?? 24) })
  }

  const handleSave = async () => {
    setSaving(true)
    const body = { name: form.name, slug: form.slug, slaHours: parseInt(form.slaHours) }
    if (editing) {
      await apiClient.patch(`/admin/categories/${editing.id}`, body)
    } else {
      await apiClient.post("/admin/categories", body)
    }
    await fetchCategories()
    setEditing(null)
    setCreating(false)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="max-w-4xl">
        <Skeleton className="h-8 w-48 mb-6" />
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 mb-3 rounded-lg" />)}
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <div className="flex gap-2">
          {categories.length === 0 && (
            <Button variant="outline" size="sm" onClick={seedDefaults} disabled={saving} className="gap-1.5">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderTree className="w-3.5 h-3.5" />}
              Seed Defaults
            </Button>
          )}
          <Button size="sm" onClick={startCreate} className="gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
            <Plus className="w-3.5 h-3.5" /> Add Category
          </Button>
        </div>
      </div>

      {/* Create / Edit Form */}
      {(creating || editing) && (
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-base">{editing ? "Edit Category" : "New Category"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Horses" />
              </div>
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. horses" />
              </div>
              <div className="space-y-1.5">
                <Label>SLA (hours)</Label>
                <Input type="number" value={form.slaHours} onChange={(e) => setForm({ ...form, slaHours: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setEditing(null); setCreating(false) }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <div className="space-y-2">
        {categories.map((cat) => (
          <Card key={cat.id} className="glass-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FolderTree className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{cat.name}</p>
                <p className="text-xs text-muted-foreground font-mono">/{cat.slug}</p>
              </div>
              <Badge variant="outline" className="text-xs">{cat.slaHours ?? 24}h SLA</Badge>
              {cat.children?.length > 0 && (
                <Badge variant="secondary" className="text-xs">{cat.children.length} sub</Badge>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(cat)}>
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
