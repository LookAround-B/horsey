"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Timer, Send, Loader2, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSubmitShowJumpingScore } from "@/lib/api/hooks"
import { toast } from "sonner"

function ShowJumpingScoringContent() {
  const searchParams = useSearchParams()
  const competitionId = searchParams.get("competitionId") || ""
  const entryId = searchParams.get("entryId") || ""

  const submitScore = useSubmitShowJumpingScore()

  const [faults, setFaults] = useState(0)
  const [refusals, setRefusals] = useState(0)
  const [roundTime, setRoundTime] = useState("")
  const [timeAllowed, setTimeAllowed] = useState("84")
  const [jumpOffFaults, setJumpOffFaults] = useState("")
  const [jumpOffTime, setJumpOffTime] = useState("")

  const timeFaults = roundTime && timeAllowed ? Math.max(0, Math.ceil(parseFloat(roundTime) - parseFloat(timeAllowed))) : 0
  const totalFaults = faults + (refusals >= 1 ? 4 : 0) + (refusals >= 2 ? 8 : 0) + timeFaults
  const isEliminated = refusals >= 3 || (roundTime && timeAllowed ? parseFloat(roundTime) > parseFloat(timeAllowed) * 2 : false)

  const handleSubmit = async () => {
    if (!competitionId || !entryId) { toast.error("Missing competitionId or entryId"); return }
    try {
      await submitScore.mutateAsync({
        entryId, competitionId, faults, refusals,
        roundTime: parseFloat(roundTime), timeAllowed: parseFloat(timeAllowed),
        jumpOffFaults: jumpOffFaults ? parseInt(jumpOffFaults) : undefined,
        jumpOffTime: jumpOffTime ? parseFloat(jumpOffTime) : undefined,
      })
      toast.success("Score submitted!")
    } catch (err: any) { toast.error(err.response?.data?.message || "Failed to submit") }
  }

  return (
    <div className="container py-8 max-w-2xl">
      <div className="mb-8 space-y-2">
        <Badge variant="outline">Judge Interface</Badge>
        <h1 className="text-3xl font-bold"><span className="gradient-text">Show Jumping</span> Scorer</h1>
      </div>

      <Card className={`glass-card mb-6 ${isEliminated ? "border-destructive/50" : ""}`}>
        <CardContent className="p-6 text-center">
          {isEliminated ? (
            <div className="flex items-center justify-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /><span className="text-2xl font-bold">ELIMINATED</span>
            </div>
          ) : (
            <div><p className="text-sm text-muted-foreground mb-1">Total Faults</p><p className="text-5xl font-bold gradient-text">{totalFaults}</p></div>
          )}
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Card className="glass-card">
          <CardContent className="p-4 space-y-3">
            <Label>Knockdown Faults</Label>
            <Select value={faults.toString()} onValueChange={(v) => setFaults(parseInt(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{[0, 4, 8, 12, 16, 20, 24, 28, 32].map((v) => (<SelectItem key={v} value={v.toString()}>{v} faults</SelectItem>))}</SelectContent>
            </Select>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 space-y-3">
            <Label>Refusals</Label>
            <Select value={refusals.toString()} onValueChange={(v) => setRefusals(parseInt(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 refusals</SelectItem><SelectItem value="1">1 refusal (4 faults)</SelectItem>
                <SelectItem value="2">2 refusals (12 faults)</SelectItem><SelectItem value="3">3 refusals (ELIMINATION)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 space-y-3">
            <Label>Time Allowed (sec)</Label>
            <Input type="number" value={timeAllowed} onChange={(e) => setTimeAllowed(e.target.value)} />
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 space-y-3">
            <Label>Round Time (sec)</Label>
            <Input type="number" step="0.01" value={roundTime} onChange={(e) => setRoundTime(e.target.value)} placeholder="e.g. 78.52" />
            {timeFaults > 0 && <p className="text-xs text-amber-500">+{timeFaults} time fault{timeFaults > 1 ? "s" : ""}</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card mb-8">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Timer className="w-5 h-5 text-primary" />Jump-Off (Optional)</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Jump-Off Faults</Label><Input type="number" value={jumpOffFaults} onChange={(e) => setJumpOffFaults(e.target.value)} placeholder="0" /></div>
          <div className="space-y-2"><Label>Jump-Off Time (sec)</Label><Input type="number" step="0.01" value={jumpOffTime} onChange={(e) => setJumpOffTime(e.target.value)} placeholder="e.g. 34.21" /></div>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={submitScore.isPending || !roundTime} className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-lg gap-2">
        {submitScore.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Submit Score</>}
      </Button>
    </div>
  )
}

export default function ShowJumpingScoringPage() {
  return (
    <Suspense fallback={<div className="container py-8 text-center text-muted-foreground">Loading scorer...</div>}>
      <ShowJumpingScoringContent />
    </Suspense>
  )
}
