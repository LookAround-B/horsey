"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Landmark, Search, MapPin, Star, Users, Phone, ArrowRight,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useStables } from "@/lib/api/hooks"

export default function StablesPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const { data, isLoading } = useStables({
    search: search || undefined,
    page,
    pageSize: 12,
  })

  const stables = data?.data || []
  const totalPages = data?.totalPages || 1

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">
          Find <span className="gradient-text">Stables</span>
        </h1>
        <p className="text-muted-foreground text-lg">Discover stables near you with reviews and amenities</p>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, city..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-5 space-y-4">
                <Skeleton className="h-40 rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stables.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <Landmark className="w-12 h-12 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold">No stables found</h3>
          <p className="text-muted-foreground">Try a different search</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stables.map((stable: any) => (
            <Card key={stable.id} className="glass-card group hover:border-primary/30 transition-all duration-300 overflow-hidden">
              <CardContent className="p-0">
                {/* Header Image */}
                <div className="h-40 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent flex items-center justify-center">
                  {stable.mediaUrls?.[0] ? (
                    <img src={stable.mediaUrls[0]} alt={stable.name} className="object-cover w-full h-full" />
                  ) : (
                    <Landmark className="w-10 h-10 text-primary/30" />
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {stable.name}
                  </h3>

                  {(stable.city || stable.state) && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      {[stable.city, stable.state].filter(Boolean).join(", ")}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    {stable.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{stable.rating?.toFixed(1)}</span>
                        <span className="text-muted-foreground">({stable.reviewCount})</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      {stable.capacity} capacity
                    </div>
                  </div>

                  {/* Amenities */}
                  {stable.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {stable.amenities.slice(0, 3).map((a: string) => (
                        <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                      ))}
                      {stable.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{stable.amenities.length - 3}</Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <span className="text-lg font-bold gradient-text">
                      ₹{(stable.pricePerMonth / 100).toLocaleString()}/mo
                    </span>
                    <Link href={`/stables/${stable.id}`}>
                      <Button size="sm" variant="ghost" className="gap-1 text-xs">
                        Details <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}
