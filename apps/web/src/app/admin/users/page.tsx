"use client"

import { useState, useEffect } from "react"
import { Search, UserX, Shield, ShieldOff, Eye, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { API_BASE } from "@/lib/api"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const base = API_BASE
  const token = () => localStorage.getItem("horsey_access_token")

  const fetchUsers = async () => {
    const params = new URLSearchParams({ pageSize: "50" })
    if (search.trim()) params.set("q", search.trim())
    const res = await fetch(`${base}/admin/users?${params}`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
    const data = await res.json()
    setUsers(data.data ?? data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    fetchUsers()
  }

  const suspendUser = async (userId: string) => {
    setActionLoading(userId)
    await fetch(`${base}/admin/users/${userId}/suspend`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token()}` },
    })
    await fetchUsers()
    setActionLoading(null)
  }

  const roleColor: Record<string, string> = {
    ADMIN: "bg-purple-500/10 text-purple-700",
    VENDOR: "bg-blue-500/10 text-blue-700",
    BUYER: "bg-green-500/10 text-green-700",
  }

  if (loading && !users.length) {
    return (
      <div className="container py-8 max-w-5xl">
        <Skeleton className="h-8 w-48 mb-6" />
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 mb-3 rounded-lg" />)}
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Badge variant="secondary">{users.length} users</Badge>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {/* User List */}
      {users.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <Card key={user.id} className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">
                      {user.name?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email} {user.phone ? `· ${user.phone}` : ""}</p>
                </div>
                <Badge variant="outline" className={`text-[10px] ${roleColor[user.role] ?? ""}`}>
                  {user.role}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {user.emailVerified ? "Verified" : "Unverified"}
                </Badge>
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(user.createdAt).toLocaleDateString("en-IN")}
                </span>
                {user.role !== "ADMIN" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive"
                    onClick={() => suspendUser(user.id)}
                    disabled={actionLoading === user.id}
                  >
                    <UserX className="w-3 h-3 mr-1" />
                    Suspend
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
