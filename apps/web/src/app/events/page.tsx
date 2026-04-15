"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, MapPin, Filter, Search, Trophy, ArrowRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useEvents } from "@/lib/api/hooks"
import { DISCIPLINE_LABELS } from "shared"
import { format } from "date-fns"

export default function EventsPage() {
  const [search, setSearch] = useState("")
  const [discipline, setDiscipline] = useState<string>("")
  const [page, setPage] = useState(1)

  const { data, isLoading } = useEvents({
    search: search || undefined,
    discipline: discipline || undefined,
    page,
    pageSize: 12,
  })

  const events = data?.data || []
  const totalPages = data?.totalPages || 1

  return (
    <div className="container py-8 md:py-12">
      {/* Page Header */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">
          Discover <span className="gradient-text">Events</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Find equestrian competitions across India
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search events, venues..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>
        <Select value={discipline} onValueChange={(v) => { setDiscipline(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Disciplines" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Disciplines</SelectItem>
            {Object.entries(DISCIPLINE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-5 space-y-4">
                <Skeleton className="h-40 rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold">No events found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event: any) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="glass-card group hover:border-primary/30 hover:scale-[1.01] transition-all duration-300 cursor-pointer h-full">
                  <CardContent className="p-5 space-y-4">
                    {/* Banner placeholder */}
                    <div className="h-40 rounded-lg bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-transparent flex items-center justify-center">
                      <Trophy className="w-10 h-10 text-primary/40" />
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {event.disciplines?.map((d: string) => (
                        <Badge key={d} variant="secondary" className="text-xs">
                          {(DISCIPLINE_LABELS as any)[d] || d}
                        </Badge>
                      ))}
                      {event.efiSanctioned && (
                        <Badge variant="success" className="text-xs">EFI</Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                      {event.name}
                    </h3>

                    {/* Details */}
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(event.startDate), "MMM d")} – {format(new Date(event.endDate), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" />
                        {event.venue}{event.city ? `, ${event.city}` : ""}
                      </div>
                      {event._count?.competitions > 0 && (
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5" />
                          {event._count.competitions} competition{event._count.competitions > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center text-primary text-sm font-medium pt-1 group-hover:gap-2 transition-all">
                      View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
