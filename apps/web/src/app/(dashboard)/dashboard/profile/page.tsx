"use client"

import { useState, useEffect } from "react"
import { User, Save, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useMe, useUpdateProfile } from "@/lib/api/hooks"
import { toast } from "sonner"

export default function ProfilePage() {
  const { data: profile, isLoading } = useMe()
  const updateProfile = useUpdateProfile()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")

  useEffect(() => {
    if (profile) {
      setName(profile.name || "")
      setEmail(profile.email || "")
      setBio(profile.bio || "")
    }
  }, [profile])

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        name,
        email: email || undefined,
        bio: bio || undefined,
      })
      toast.success("Profile updated!")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile")
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8 max-w-3xl space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-12 max-w-3xl">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">
          My <span className="gradient-text">Profile</span>
        </h1>
        <p className="text-muted-foreground">Manage your personal information</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." />
          </div>

          <Button onClick={handleSave} disabled={updateProfile.isPending} className="w-full sm:w-auto">
            {updateProfile.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
