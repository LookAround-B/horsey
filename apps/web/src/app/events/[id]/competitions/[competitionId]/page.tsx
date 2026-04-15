"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Trophy, Users, BarChart3, Medal, Clock, ArrowLeft, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useCompetition, useLeaderboard, useEntries } from "@/lib/api/hooks"
import { DISCIPLINE_LABELS } from "shared"

export default function CompetitionPage() {
  const params = useParams()
  const compId = params.competitionId as string
  const eventId = params.id as string

  const { data: competition, isLoading: compLoading } = useCompetition(compId)
  const { data: leaderboard, isLoading: lbLoading } = useLeaderboard(compId)

  if (compLoading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-12">
      {/* Back Link */}
      <Link href={`/events/${eventId}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Event
      </Link>

      {/* Header */}
      <div className="mb-8 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{(DISCIPLINE_LABELS as any)[competition?.discipline]}</Badge>
          <Badge variant="outline">{competition?.level}</Badge>
          <Badge variant={competition?.status === "IN_PROGRESS" ? "success" : "secondary"}>
            {competition?.status}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold">{competition?.name}</h1>
      </div>

      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:w-[300px]">
          <TabsTrigger value="leaderboard" className="gap-2">
            <BarChart3 className="w-4 h-4" /> Leaderboard
          </TabsTrigger>
          <TabsTrigger value="entries" className="gap-2">
            <Users className="w-4 h-4" /> Entries
          </TabsTrigger>
        </TabsList>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Live Leaderboard
                <Badge variant="success" className="ml-2 text-xs">
                  <Clock className="w-3 h-3 mr-1" /> Live
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lbLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : !leaderboard || leaderboard.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Trophy className="w-10 h-10 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">No scores submitted yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <div className="col-span-1">#</div>
                    <div className="col-span-4">Rider & Horse</div>
                    <div className="col-span-2 text-center">Draw</div>
                    <div className="col-span-3 text-center">Score</div>
                    <div className="col-span-2 text-center">Status</div>
                  </div>

                  {leaderboard.map((entry: any, idx: number) => (
                    <div
                      key={entry.entryId}
                      className={`grid grid-cols-12 gap-2 items-center px-4 py-3 rounded-lg transition-colors ${
                        idx === 0 ? "bg-amber-500/10 border border-amber-500/20" :
                        idx === 1 ? "bg-zinc-400/5 border border-zinc-400/10" :
                        idx === 2 ? "bg-orange-800/5 border border-orange-800/10" :
                        "hover:bg-muted/50"
                      }`}
                    >
                      <div className="col-span-1">
                        {idx < 3 ? (
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === 0 ? "bg-amber-500 text-white" :
                            idx === 1 ? "bg-zinc-400 text-white" :
                            "bg-orange-700 text-white"
                          }`}>
                            {entry.rank}
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-muted-foreground pl-1.5">{entry.rank}</span>
                        )}
                      </div>
                      <div className="col-span-4">
                        <p className="font-medium text-sm">{entry.riderName}</p>
                        <p className="text-xs text-muted-foreground">{entry.horseName}</p>
                      </div>
                      <div className="col-span-2 text-center text-sm text-muted-foreground">
                        {entry.drawNumber || "—"}
                      </div>
                      <div className="col-span-3 text-center">
                        {competition?.discipline === "DRESSAGE" ? (
                          <span className="font-semibold text-sm">{entry.percentage?.toFixed(2)}%</span>
                        ) : competition?.discipline === "SHOW_JUMPING" ? (
                          <span className="font-semibold text-sm">{entry.totalFaults} faults</span>
                        ) : (
                          <span className="font-semibold text-sm">{entry.totalPoints} pts</span>
                        )}
                      </div>
                      <div className="col-span-2 text-center">
                        {entry.isEliminated ? (
                          <Badge variant="destructive" className="text-xs">ELIM</Badge>
                        ) : entry.achievedMer ? (
                          <Badge variant="success" className="text-xs">MER ✓</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">—</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Entries Tab */}
        <TabsContent value="entries">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Entries ({competition?.entries?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {competition?.entries?.length > 0 ? (
                <div className="space-y-2">
                  {competition.entries.map((entry: any) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                          {entry.drawNumber || "—"}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{entry.user?.name}</p>
                          <p className="text-xs text-muted-foreground">{entry.horse?.name} ({entry.horse?.breed})</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">{entry.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No entries yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
