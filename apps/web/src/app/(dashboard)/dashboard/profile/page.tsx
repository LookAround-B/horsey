"use client"

import { useState, useEffect } from "react"
import { User, Save, Loader2, Plus, MapPin, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMe, useUpdateProfile } from "@/lib/api/hooks"
import apiClient from "@/lib/api/client"
import { toast } from "sonner"

const RIDING_DISCIPLINES = [
  "Dressage", "Show Jumping", "Cross Country", "Western",
  "Endurance", "Polo", "Tent Pegging", "Trail", "Racing", "Other",
]

export default function ProfilePage() {
  const { data: profile, isLoading } = useMe()
  const updateProfile = useUpdateProfile()

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [ridingDiscipline, setRidingDiscipline] = useState("")
  const [stableAddress, setStableAddress] = useState("")

  const [addresses, setAddresses] = useState<any[]>([])
  const [addingAddress, setAddingAddress] = useState(false)
  const [newAddr, setNewAddr] = useState({ label: "", line1: "", city: "", state: "", pincode: "" })
  const [savingAddress, setSavingAddress] = useState(false)

  useEffect(() => {
    if (profile) {
      setName(profile.name || "")
      setPhone(profile.phone || "")
      setRidingDiscipline(profile.ridingDiscipline || "")
      setStableAddress(profile.stableAddress || "")
    }
  }, [profile])

  useEffect(() => {
    apiClient.get("/users/me/addresses")
      .then((r) => {
        const raw = r.data?.data  // TransformInterceptor: res.data.data = array
        setAddresses(Array.isArray(raw) ? raw : [])
      })
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        name,
        phone: phone || undefined,
        ridingDiscipline: ridingDiscipline || undefined,
        stableAddress: stableAddress || undefined,
      })
      toast.success("Profile updated!")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile")
    }
  }

  const handleAddAddress = async () => {
    if (!newAddr.line1 || !newAddr.city || !newAddr.state || !newAddr.pincode) {
      toast.error("Street, city, state, and pincode are required")
      return
    }
    setSavingAddress(true)
    try {
      const res = await apiClient.post("/users/me/addresses", newAddr)
      const data = res.data?.data ?? res.data
      setAddresses((prev) => [...prev, data])
      setNewAddr({ label: "", line1: "", city: "", state: "", pincode: "" })
      setAddingAddress(false)
      toast.success("Address saved!")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add address")
    } finally {
      setSavingAddress(false)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    await apiClient.delete(`/users/me/addresses/${id}`)
    setAddresses((prev) => prev.filter((a) => a.id !== id))
    toast.success("Address removed")
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-72" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">
          My <span className="gradient-text">Profile</span>
        </h1>
        <p className="text-muted-foreground">Manage your personal information and shipping addresses</p>
      </div>

      {/* Personal Information */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-2xl font-bold">
              {name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-semibold text-lg">{name}</p>
              <Badge variant="secondary">{profile?.role}</Badge>
            </div>
          </div>

          <Separator />

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
            </div>
            <div className="space-y-2">
              <Label>Phone (contact)</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={profile?.email || ""} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Riding Discipline</Label>
              <Select value={ridingDiscipline} onValueChange={setRidingDiscipline}>
                <SelectTrigger>
                  <SelectValue placeholder="Select discipline" />
                </SelectTrigger>
                <SelectContent>
                  {RIDING_DISCIPLINES.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Stable Address (optional)</Label>
              <Input
                value={stableAddress}
                onChange={(e) => setStableAddress(e.target.value)}
                placeholder="Name or location of your stable"
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={updateProfile.isPending} className="w-full sm:w-auto">
            {updateProfile.isPending
              ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Shipping Addresses */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Shipping Addresses
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddingAddress(!addingAddress)}
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Address
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {addresses.length === 0 && !addingAddress && (
            <p className="text-sm text-muted-foreground">
              No saved addresses yet. Add one to speed up checkout.
            </p>
          )}

          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="flex items-start justify-between p-3 rounded-lg border border-border/50 gap-3"
            >
              <div>
                {addr.label && <p className="text-sm font-medium">{addr.label}</p>}
                <p className="text-sm text-muted-foreground">
                  {addr.line1}, {addr.city}, {addr.state} — {addr.pincode}
                </p>
                {addr.isDefault && (
                  <Badge variant="secondary" className="text-[10px] mt-1">Default</Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive shrink-0"
                onClick={() => handleDeleteAddress(addr.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}

          {addingAddress && (
            <div className="space-y-3 pt-3 border-t border-border/40">
              <p className="text-sm font-medium">New Address</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Label (optional)</Label>
                  <Input
                    value={newAddr.label}
                    onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                    placeholder="e.g. Home, Stable"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Street Address *</Label>
                  <Input
                    value={newAddr.line1}
                    onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })}
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">City *</Label>
                  <Input
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    placeholder="Mumbai"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">State *</Label>
                  <Input
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    placeholder="Maharashtra"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Pincode *</Label>
                  <Input
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    placeholder="400001"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddAddress} disabled={savingAddress} className="gap-1.5">
                  {savingAddress ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Address"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setAddingAddress(false)
                    setNewAddr({ label: "", line1: "", city: "", state: "", pincode: "" })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
