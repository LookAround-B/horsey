"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Trophy, Check, Loader2, ArrowLeft, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useEvent, useCompetitions, useMyHorses, useCreateEntry } from "@/lib/api/hooks"
import { DISCIPLINE_LABELS } from "shared"
import { toast } from "sonner"
import Link from "next/link"

function RegisterContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const eventId = searchParams.get("eventId") || ""
  const competitionId = searchParams.get("competitionId") || ""

  const { data: event, isLoading: eventLoading } = useEvent(eventId)
  const { data: competitions } = useCompetitions(eventId)
  const { data: horses, isLoading: horsesLoading } = useMyHorses()
  const createEntry = useCreateEntry(competitionId)

  const [selectedCompetition, setSelectedCompetition] = useState(competitionId)
  const [selectedHorse, setSelectedHorse] = useState("")

  const selectedComp = competitions?.find((c: any) => c.id === selectedCompetition)

  const handleRegister = async () => {
    if (!selectedCompetition || !selectedHorse) {
      toast.error("Please select a competition and horse")
      return
    }

    try {
      await createEntry.mutateAsync({ horseId: selectedHorse })
      toast.success("Entry registered! Proceed to payment.")
      router.push(`/events/${eventId}`)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to register entry")
    }
  }

  if (eventLoading) {
    return (
      <div className="container py-8 max-w-2xl space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container py-8 max-w-2xl text-center space-y-4">
        <AlertTriangle className="w-10 h-10 mx-auto text-destructive" />
        <h2 className="text-xl font-bold">Event not found</h2>
        <Link href="/events"><Button variant="outline">Browse Events</Button></Link>
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-12 max-w-2xl">
      <Link href={`/events/${eventId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to {event.name}
      </Link>

      <div className="mb-8 space-y-2">
        <Badge variant="outline">Competition Entry</Badge>
        <h1 className="text-3xl font-bold">
          Register for <span className="gradient-text">{event.name}</span>
        </h1>
        <p className="text-muted-foreground">{event.venue} · {event.city}</p>
      </div>

      {/* Select Competition */}
      <Card className="glass-card mb-6">
        <CardHeader>
          <CardTitle className="text-lg">1. Select Competition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {competitions?.map((comp: any) => (
            <button
              key={comp.id}
              onClick={() => setSelectedCompetition(comp.id)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                selectedCompetition === comp.id
                  ? "border-primary bg-primary/5"
                  : "border-border/50 hover:border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{comp.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(DISCIPLINE_LABELS as any)[comp.discipline] || comp.discipline}
                    {comp.ageCategory && ` · ${comp.ageCategory.replace(/_/g, " ")}`}
                    {comp.level && ` · ${comp.level.replace(/_/g, " ")}`}
                  </p>
                </div>
                {selectedCompetition === comp.id && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Select Horse */}
      <Card className="glass-card mb-6">
        <CardHeader>
          <CardTitle className="text-lg">2. Select Your Horse</CardTitle>
        </CardHeader>
        <CardContent>
          {horsesLoading ? (
            <Skeleton className="h-10" />
          ) : horses && horses.length > 0 ? (
            <Select value={selectedHorse} onValueChange={setSelectedHorse}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a horse..." />
              </SelectTrigger>
              <SelectContent>
                {horses.map((horse: any) => (
                  <SelectItem key={horse.id} value={horse.id}>
                    {horse.name} — {horse.breed} ({horse.age} yrs)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-center py-6 space-y-2">
              <p className="text-muted-foreground text-sm">No horses registered</p>
              <Link href="/dashboard/horses">
                <Button variant="outline" size="sm">Register a Horse First</Button>
              </Link>
            </div>
          )}

          {selectedComp?.discipline === "DRESSAGE" && (
            <p className="text-xs text-amber-500 mt-2">
              ⚠️ Bitting: Snaffle only for all categories (EFI REL 2026)
              {selectedComp?.ageCategory === "YOUNG_RIDER" &&
                ". Horse must be 7+ years old for Young Rider test."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="glass-card mb-8">
        <CardHeader>
          <CardTitle className="text-lg">3. Entry Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Event</span>
            <span className="font-medium">{event.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Competition</span>
            <span className="font-medium">{selectedComp?.name || "—"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Horse</span>
            <span className="font-medium">
              {horses?.find((h: any) => h.id === selectedHorse)?.name || "—"}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Entry Fee</span>
            <span className="font-bold text-primary">
              ₹{event.entryFee ? (event.entryFee / 100).toLocaleString() : "Free"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            As per EFI REL 2026: Indian passport holders only. MER requirements apply.
            One horse can participate once in each category.
            Daily limit: 2 Dressage + 1 Jumping OR 2 Jumping + 1 Dressage per horse.
          </p>
        </CardContent>
      </Card>

      <Button
        onClick={handleRegister}
        disabled={!selectedCompetition || !selectedHorse || createEntry.isPending}
        className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-lg gap-2"
      >
        {createEntry.isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Trophy className="w-5 h-5" />
            Register Entry
          </>
        )}
      </Button>
    </div>
  )
}

export default function EventRegisterPage() {
  return (
    <Suspense fallback={
      <div className="container py-8 max-w-2xl space-y-6">
        <Skeleton className="h-10 w-2/3" /><Skeleton className="h-64" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}
