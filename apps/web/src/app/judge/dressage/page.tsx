"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
  ClipboardCheck, Award, Send, Loader2, AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSubmitDressageScore } from "@/lib/api/hooks"
import { DRESSAGE_MARK_SCALE, DRESSAGE_COLLECTIVES, VALID_MARKS } from "shared"
import { toast } from "sonner"

interface MovementMark {
  movementNumber: number;
  mark: number;
  coefficient: 1 | 2;
  points: number;
  remark: string;
}

function DressageScoringContent() {
  const searchParams = useSearchParams()
  const competitionId = searchParams.get("competitionId") || ""
  const entryId = searchParams.get("entryId") || ""

  const submitScore = useSubmitDressageScore()

  const [movements, setMovements] = useState<MovementMark[]>(
    Array.from({ length: 20 }, (_, i) => ({
      movementNumber: i + 1, mark: 0, coefficient: 1 as const, points: 0, remark: "",
    }))
  )

  const [collectiveMarks, setCollectiveMarks] = useState(
    DRESSAGE_COLLECTIVES.map((c) => ({ name: c.name, mark: 0, coefficient: c.coefficient, points: 0 }))
  )

  const [errorCount, setErrorCount] = useState(0)
  const [judgePosition, setJudgePosition] = useState("C")

  const updateMovement = (index: number, field: string, value: any) => {
    setMovements((prev) => {
      const updated = [...prev]
      const m = { ...updated[index], [field]: value }
      m.points = m.mark * m.coefficient
      updated[index] = m
      return updated
    })
  }

  const updateCollective = (index: number, mark: number) => {
    setCollectiveMarks((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], mark, points: mark * updated[index].coefficient }
      return updated
    })
  }

  const rawScore = movements.reduce((s, m) => s + m.points, 0) + collectiveMarks.reduce((s, m) => s + m.points, 0)
  const maxPossible = movements.reduce((s, m) => s + 10 * m.coefficient, 0) + collectiveMarks.reduce((s, m) => s + 10 * m.coefficient, 0)
  const percentage = maxPossible > 0 ? ((rawScore / maxPossible) * 100).toFixed(2) : "0.00"

  const handleSubmit = async () => {
    if (!competitionId || !entryId) { toast.error("Missing competitionId or entryId in URL params"); return }
    try {
      await submitScore.mutateAsync({ entryId, competitionId, judgePosition, movementMarks: movements.filter((m) => m.mark > 0), collectiveMarks, errorCount })
      toast.success("Score submitted successfully!")
    } catch (err: any) { toast.error(err.response?.data?.message || "Failed to submit score") }
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8 space-y-2">
        <Badge variant="outline">Judge Interface</Badge>
        <h1 className="text-3xl font-bold"><span className="gradient-text">Dressage</span> Score Sheet</h1>
        <p className="text-muted-foreground">Enter movement marks (0-10, half marks allowed) with coefficients</p>
      </div>

      <Card className="glass-card mb-6">
        <CardContent className="p-4 flex items-center gap-4">
          <Label className="text-sm font-medium whitespace-nowrap">Judge Position:</Label>
          <Select value={judgePosition} onValueChange={setJudgePosition}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["C", "B", "E", "H", "M", "K", "F"].map((pos) => (<SelectItem key={pos} value={pos}>{pos}</SelectItem>))}
            </SelectContent>
          </Select>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Raw: <strong>{rawScore}</strong>/{maxPossible}</span>
            <Badge variant="success" className="text-sm px-3 py-1">{percentage}%</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card mb-6">
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ClipboardCheck className="w-5 h-5 text-primary" />Movement Marks</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 px-2 text-xs font-medium text-muted-foreground">
              <div className="col-span-1">#</div><div className="col-span-3">Mark</div><div className="col-span-2">Coeff</div><div className="col-span-2">Points</div><div className="col-span-4">Remark</div>
            </div>
            {movements.map((m, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center px-2 py-1.5 rounded hover:bg-muted/30">
                <div className="col-span-1 text-sm font-medium text-muted-foreground">{m.movementNumber}</div>
                <div className="col-span-3">
                  <Select value={m.mark.toString()} onValueChange={(v) => updateMovement(i, "mark", parseFloat(v))}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{VALID_MARKS.map((v) => (<SelectItem key={v} value={v.toString()}>{v} — {(DRESSAGE_MARK_SCALE as any)[Math.floor(v)] || ""}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Select value={m.coefficient.toString()} onValueChange={(v) => updateMovement(i, "coefficient", parseInt(v))}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="1">×1</SelectItem><SelectItem value="2">×2</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 text-sm font-medium text-center">{m.points}</div>
                <div className="col-span-4"><Input className="h-8 text-sm" placeholder="Remark..." value={m.remark} onChange={(e) => updateMovement(i, "remark", e.target.value)} /></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card mb-6">
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Award className="w-5 h-5 text-primary" />Collective Marks</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {collectiveMarks.map((cm, i) => (
              <div key={cm.name} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30">
                <div className="flex-1">
                  <p className="text-sm font-medium">{cm.name}</p>
                  <p className="text-xs text-muted-foreground">{DRESSAGE_COLLECTIVES[i]?.description}</p>
                </div>
                <Select value={cm.mark.toString()} onValueChange={(v) => updateCollective(i, parseFloat(v))}>
                  <SelectTrigger className="w-24 h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{VALID_MARKS.map((v) => (<SelectItem key={v} value={v.toString()}>{v}</SelectItem>))}</SelectContent>
                </Select>
                <Badge variant="outline" className="w-12 justify-center">×{cm.coefficient}</Badge>
                <span className="w-12 text-center font-medium text-sm">{cm.points}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card mb-8">
        <CardContent className="p-4 flex items-center gap-4">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-medium">Errors of Course</p>
            <p className="text-xs text-muted-foreground">EFI REL 2026: −0.5% (1st), −1.0% (2nd), Elimination (3rd)</p>
          </div>
          <Select value={errorCount.toString()} onValueChange={(v) => setErrorCount(parseInt(v))}>
            <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0</SelectItem><SelectItem value="1">1</SelectItem><SelectItem value="2">2</SelectItem><SelectItem value="3">3 (ELIM)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={submitScore.isPending} className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-lg gap-2">
        {submitScore.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" />Submit Score</>}
      </Button>
    </div>
  )
}

export default function DressageScoringPage() {
  return (
    <Suspense fallback={<div className="container py-8 text-center text-muted-foreground">Loading scorer...</div>}>
      <DressageScoringContent />
    </Suspense>
  )
}
