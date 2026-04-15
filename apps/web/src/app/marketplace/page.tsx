"use client"

import { useState } from "react"
import Link from "next/link"
import { Store, Search, Filter, Heart, MapPin, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useMarketplaceHorses, useToggleFavorite } from "@/lib/api/hooks"
import { DISCIPLINE_LABELS } from "shared"

export default function MarketplacePage() {
  const [search, setSearch] = useState("")
  const [breed, setBreed] = useState("")
  const [page, setPage] = useState(1)

  const { data, isLoading } = useMarketplaceHorses({
    search: search || undefined,
    breed: breed || undefined,
    page,
    pageSize: 12,
  })

  const toggleFavorite = useToggleFavorite()
  const horses = data?.data || []
  const totalPages = data?.totalPages || 1

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">
          Horse <span className="gradient-text">Marketplace</span>
        </h1>
        <p className="text-muted-foreground text-lg">Find your perfect equine partner</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search horses..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>
        <Select value={breed} onValueChange={(v) => { setBreed(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Breeds" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Breeds</SelectItem>
            <SelectItem value="Thoroughbred">Thoroughbred</SelectItem>
            <SelectItem value="Marwari">Marwari</SelectItem>
            <SelectItem value="Kathiawari">Kathiawari</SelectItem>
            <SelectItem value="Arabian">Arabian</SelectItem>
            <SelectItem value="Warmblood">Warmblood</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : horses.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <Store className="w-12 h-12 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold">No horses found</h3>
          <p className="text-muted-foreground">Try adjusting your search</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {horses.map((horse: any) => (
              <Card key={horse.id} className="glass-card group hover:border-primary/30 transition-all duration-300 overflow-hidden">
                <CardContent className="p-0">
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent flex items-center justify-center">
                    {horse.mediaUrls?.[0] ? (
                      <img src={horse.mediaUrls[0]} alt={horse.name} className="object-cover w-full h-full" />
                    ) : (
                      <Store className="w-10 h-10 text-primary/30" />
                    )}
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite.mutate(horse.id); }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-primary/20 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {horse.disciplines?.map((d: string) => (
                        <Badge key={d} variant="outline" className="text-xs">
                          {(DISCIPLINE_LABELS as any)[d] || d}
                        </Badge>
                      ))}
                    </div>

                    <Link href={`/marketplace/${horse.id}`}>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {horse.name}
                      </h3>
                    </Link>

                    <p className="text-sm text-muted-foreground">
                      {horse.breed} · {horse.age} yrs{horse.gender ? ` · ${horse.gender}` : ""}
                    </p>

                    {horse.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" /> {horse.location}
                      </div>
                    )}

                    {horse.price && (
                      <div className="flex items-center justify-between pt-2 border-t border-border/40">
                        <span className="text-lg font-bold gradient-text">
                          ₹{(horse.price / 100).toLocaleString()}
                        </span>
                        <Link href={`/marketplace/${horse.id}`}>
                          <Button size="sm" variant="ghost" className="gap-1 text-xs">
                            Details <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
