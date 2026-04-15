"use client"

import { useState, useEffect } from "react"
import { User, Save, Loader2, Shield, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMe, useUpdateProfile, useMerRecords } from "@/lib/api/hooks"
import { EFI_ZONES } from "shared"
import { toast } from "sonner"
import { format } from "date-fns"

export default function ProfilePage() {
  const { data: profile, isLoading } = useMe()
  const updateProfile = useUpdateProfile()
  const { data: merRecords } = useMerRecords()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [efiLicenseNo, setEfiLicenseNo] = useState("")
  const [feiId, setFeiId] = useState("")
  const [regionalZone, setRegionalZone] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")

  useEffect(() => {
    if (profile) {
      setName(profile.name || "")
      setEmail(profile.email || "")
      setBio(profile.bio || "")
      setEfiLicenseNo(profile.efiLicenseNo || "")
      setFeiId(profile.feiId || "")
      setRegionalZone(profile.regionalZone || "")
      setDateOfBirth(profile.dateOfBirth ? format(new Date(profile.dateOfBirth), "yyyy-MM-dd") : "")
    }
  }, [profile])

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        name, email: email || undefined, bio: bio || undefined,
        efiLicenseNo: efiLicenseNo || undefined, feiId: feiId || undefined,
        regionalZone: regionalZone || undefined,
        dateOfBirth: dateOfBirth || undefined,
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
        <p className="text-muted-foreground">Manage your personal information and credentials</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="gap-2"><User className="w-4 h-4" /> Profile</TabsTrigger>
          <TabsTrigger value="mer" className="gap-2"><Shield className="w-4 h-4" /> MER Records</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
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
                <Label>Date of Birth</Label>
                <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." />
              </div>

              <Separator />

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>EFI License No.</Label>
                  <Input value={efiLicenseNo} onChange={(e) => setEfiLicenseNo(e.target.value)} placeholder="EFI-XXXX-XXXX" />
                </div>
                <div className="space-y-2">
                  <Label>FEI ID</Label>
                  <Input value={feiId} onChange={(e) => setFeiId(e.target.value)} placeholder="10XXXXXX" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Regional Zone</Label>
                <Select value={regionalZone} onValueChange={setRegionalZone}>
                  <SelectTrigger>
                    <MapPin className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Select your zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(EFI_ZONES).map((zone) => (
                      <SelectItem key={zone} value={zone}>
                        {zone.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white gap-2"
              >
                {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mer">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                MER Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {merRecords && merRecords.length > 0 ? (
                <div className="space-y-3">
                  {merRecords.map((record: any) => (
                    <div key={record.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                      <div>
                        <p className="font-medium text-sm">{record.competition?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {record.competition?.event?.name} · {record.horse?.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {record.merDate ? format(new Date(record.merDate), "MMM d, yyyy") : "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="text-xs">{record.discipline}</Badge>
                        <p className="text-sm font-semibold mt-1">{record.score?.toFixed(2)}%</p>
                        <Badge variant={record.achieved ? "success" : "destructive"} className="text-xs mt-1">
                          {record.achieved ? "MER Achieved" : "Below MER"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <Shield className="w-10 h-10 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">No MER records yet</p>
                  <p className="text-xs text-muted-foreground">
                    Compete in sanctioned events to build your MER history
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
