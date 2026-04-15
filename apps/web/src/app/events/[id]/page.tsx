"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Calendar, MapPin, Users, Trophy, Shield, ArrowRight,
  Clock, BarChart3, Phone, Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useEvent } from "@/lib/api/hooks"
import { DISCIPLINE_LABELS } from "shared"
import { format } from "date-fns"

export default function EventDetailPage() {
  const params = useParams()
  const { data: event, isLoading } = useEvent(params.id as string)

  if (isLoading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-64 md:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container py-20 text-center">
        <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Event Not Found</h2>
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-12">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap gap-2">
          {event.disciplines?.map((d: string) => (
            <Badge key={d} variant="secondary">{(DISCIPLINE_LABELS as any)[d] || d}</Badge>
          ))}
          {event.efiSanctioned && <Badge variant="success">EFI Sanctioned</Badge>}
          {event.feiSanctioned && <Badge variant="success">FEI Sanctioned</Badge>}
          <Badge variant={event.status === "PUBLISHED" ? "default" : "outline"}>
            {event.status}
          </Badge>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">{event.name}</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Info Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dates</p>
                  <p className="font-medium">
                    {format(new Date(event.startDate), "MMM d")} – {format(new Date(event.endDate), "MMM d, yyyy")}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Venue</p>
                  <p className="font-medium">{event.venue}{event.city ? `, ${event.city}` : ""}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </CardContent>
          </Card>

          {/* Competitions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Competitions ({event.competitions?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {event.competitions?.length > 0 ? (
                <div className="space-y-3">
                  {event.competitions.map((comp: any) => (
                    <Link key={comp.id} href={`/events/${event.id}/competitions/${comp.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group">
                        <div className="space-y-1">
                          <div className="font-medium group-hover:text-primary transition-colors">
                            {comp.name}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {(DISCIPLINE_LABELS as any)[comp.discipline]}
                            </Badge>
                            <span>{comp.level}</span>
                            {comp._count?.entries > 0 && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> {comp._count.entries}
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No competitions yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Organizer */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Organizer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold">
                  {event.organizer?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{event.organizer?.name}</p>
                  <p className="text-sm text-muted-foreground">Organizer</p>
                </div>
              </div>
              {event.contactPhone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" /> {event.contactPhone}
                </div>
              )}
              {event.contactEmail && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" /> {event.contactEmail}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Entry Fee */}
          {event.entryFee && (
            <Card className="glass-card">
              <CardContent className="p-6 text-center space-y-3">
                <p className="text-sm text-muted-foreground">Entry Fee</p>
                <p className="text-3xl font-bold gradient-text">
                  ₹{(event.entryFee / 100).toLocaleString()}
                </p>
                <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                  Register Now
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard Quick Link */}
          {event.competitions?.length > 0 && (
            <Card className="glass-card">
              <CardContent className="p-5">
                <Link href={`/events/${event.id}/competitions/${event.competitions[0].id}`}>
                  <Button variant="outline" className="w-full gap-2">
                    <BarChart3 className="w-4 h-4" />
                    View Leaderboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
