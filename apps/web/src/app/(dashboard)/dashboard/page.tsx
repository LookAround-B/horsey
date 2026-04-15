"use client"

import Link from "next/link"
import {
  Trophy, Calendar, Store, BarChart3, User, ArrowRight,
  Plus, Clock, TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/stores"
import { useMe, useMyHorses } from "@/lib/api/hooks"

const quickActions = [
  { href: "/events", label: "Browse Events", icon: Calendar, color: "from-blue-500 to-cyan-500" },
  { href: "/marketplace", label: "Marketplace", icon: Store, color: "from-emerald-500 to-teal-500" },
  { href: "/dashboard/horses", label: "My Horses", icon: Trophy, color: "from-orange-500 to-amber-500" },
  { href: "/dashboard/profile", label: "Edit Profile", icon: User, color: "from-violet-500 to-purple-500" },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: profile, isLoading: profileLoading } = useMe()
  const { data: horses } = useMyHorses()

  return (
    <div className="container py-8 md:py-12">
      {/* Welcome */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">
          Welcome back, <span className="gradient-text">{user?.name || "Rider"}</span>
        </h1>
        <p className="text-muted-foreground">
          Manage your horses, entries, and track your competition performance.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="glass-card group hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full">
              <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Overview */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profileLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            ) : profile ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xl font-bold">
                    {profile.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{profile.name}</p>
                    <Badge variant="secondary">{profile.role}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{profile._count?.entries || 0}</p>
                    <p className="text-xs text-muted-foreground">Entries</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{profile._count?.merRecords || 0}</p>
                    <p className="text-xs text-muted-foreground">MER Records</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{profile.horses?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Horses</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Sign in to view profile</p>
            )}
          </CardContent>
        </Card>

        {/* My Horses */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5 text-primary" />
              My Horses
            </CardTitle>
            <Link href="/dashboard/horses">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                <Plus className="w-3 h-3" /> Add
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {horses && horses.length > 0 ? (
              <div className="space-y-2">
                {horses.slice(0, 4).map((horse: any) => (
                  <div key={horse.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{horse.name}</p>
                      <p className="text-xs text-muted-foreground">{horse.breed} · {horse.age} yrs</p>
                    </div>
                    {horse.forSale && <Badge variant="success" className="text-xs">For Sale</Badge>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <Trophy className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No horses registered</p>
                <Link href="/dashboard/horses">
                  <Button size="sm" variant="outline" className="mt-2 gap-1">
                    <Plus className="w-3 h-3" /> Register Horse
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
