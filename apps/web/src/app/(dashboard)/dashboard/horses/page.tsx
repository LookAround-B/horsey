"use client"

import { useState } from "react"
import {
  Trophy, Plus, Loader2, Pencil,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMyHorses, useCreateHorse } from "@/lib/api/hooks"
import { DISCIPLINE_LABELS } from "shared"
import { toast } from "sonner"

export default function HorsesPage() {
  const { data: horses, isLoading } = useMyHorses()
  const createHorse = useCreateHorse()

  const [name, setName] = useState("")
  const [breed, setBreed] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [color, setColor] = useState("")
  const [height, setHeight] = useState("")
  const [passportNo, setPassportNo] = useState("")
  const [disciplines, setDisciplines] = useState<string[]>([])
  const [forSale, setForSale] = useState(false)
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const resetForm = () => {
    setName(""); setBreed(""); setAge(""); setGender(""); setColor("");
    setHeight(""); setPassportNo(""); setDisciplines([]); setForSale(false);
    setPrice(""); setDescription(""); setLocation("");
  }

  const handleCreate = async () => {
    if (!name || !breed || !age) {
      toast.error("Name, breed, and age are required")
      return
    }

    try {
      await createHorse.mutateAsync({
        name, breed, age: parseInt(age), gender, color,
        height: height ? parseFloat(height) : undefined,
        passportNo: passportNo || undefined,
        disciplines,
        forSale,
        price: price ? parseInt(price) * 100 : undefined,
        description: description || undefined,
        location: location || undefined,
      })
      toast.success("Horse registered!")
      resetForm()
      setDialogOpen(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to register horse")
    }
  }

  const toggleDiscipline = (d: string) => {
    setDisciplines((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    )
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            My <span className="gradient-text">Horses</span>
          </h1>
          <p className="text-muted-foreground mt-1">Manage your horses and list them for sale</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white gap-2">
              <Plus className="w-4 h-4" /> Register Horse
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register a New Horse</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Horse name" />
                </div>
                <div className="space-y-2">
                  <Label>Breed *</Label>
                  <Select value={breed} onValueChange={setBreed}>
                    <SelectTrigger><SelectValue placeholder="Select breed" /></SelectTrigger>
                    <SelectContent>
                      {["Thoroughbred", "Marwari", "Kathiawari", "Arabian", "Warmblood", "Hanoverian", "Other"].map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Age *</Label>
                  <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Years" />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Stallion">Stallion</SelectItem>
                      <SelectItem value="Mare">Mare</SelectItem>
                      <SelectItem value="Gelding">Gelding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Height (hh)</Label>
                  <Input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="16.2" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Bay, Chestnut..." />
                </div>
                <div className="space-y-2">
                  <Label>Passport No.</Label>
                  <Input value={passportNo} onChange={(e) => setPassportNo(e.target.value)} placeholder="EFI passport number" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Disciplines</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(DISCIPLINE_LABELS).map(([key, label]) => (
                    <Badge
                      key={key}
                      variant={disciplines.includes(key) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleDiscipline(key)}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." />
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg border border-border/50">
                <div className="flex-1">
                  <p className="text-sm font-medium">List for Sale?</p>
                  <p className="text-xs text-muted-foreground">Show on the marketplace</p>
                </div>
                <Button size="sm" variant={forSale ? "default" : "outline"} onClick={() => setForSale(!forSale)}>
                  {forSale ? "Yes" : "No"}
                </Button>
              </div>

              {forSale && (
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 500000" />
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleCreate} disabled={createHorse.isPending} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white gap-2">
                {createHorse.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Register</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Horse List */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="glass-card"><CardContent className="p-5 space-y-3"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></CardContent></Card>
          ))}
        </div>
      ) : !horses || horses.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold">No horses registered</h3>
          <p className="text-muted-foreground">Register your first horse to start competing</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {horses.map((horse: any) => (
            <Card key={horse.id} className="glass-card group hover:border-primary/30 transition-all">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{horse.name}</h3>
                    <p className="text-sm text-muted-foreground">{horse.breed} · {horse.age} yrs{horse.gender ? ` · ${horse.gender}` : ""}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="w-8 h-8"><Pencil className="w-3.5 h-3.5" /></Button>
                </div>

                {horse.disciplines?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {horse.disciplines.map((d: string) => (
                      <Badge key={d} variant="outline" className="text-xs">{(DISCIPLINE_LABELS as any)[d] || d}</Badge>
                    ))}
                  </div>
                )}

                {horse.color && <p className="text-xs text-muted-foreground">Color: {horse.color}</p>}
                {horse.passportNo && <p className="text-xs text-muted-foreground">Passport: {horse.passportNo}</p>}

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  {horse.forSale ? (
                    <Badge variant="success">For Sale — ₹{(horse.price / 100).toLocaleString()}</Badge>
                  ) : (
                    <Badge variant="secondary">Not for sale</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
