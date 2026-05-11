"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, LogOut, Store, Trophy, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores"
import { NotificationBell } from "./notification-bell"

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/40">
      <div className="container flex h-16 items-center justify-between gap-4">

        {/* Logo — links to dashboard if logged in, home otherwise */}
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text hidden sm:block">Horsey</span>
        </Link>

        {/* Desktop right rail — profile + logout only */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <Link href="/dashboard/profile">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-none truncate max-w-[120px]">{user?.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{user?.role?.toLowerCase()}</p>
                  </div>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => logout()}
                title="Sign out"
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/20">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
          <div className="container py-4 space-y-1">
            <Link href="/marketplace" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted">
              <Store className="w-4 h-4" /> Marketplace
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted">
                  <User className="w-4 h-4" /> Dashboard
                </Link>
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm text-muted-foreground">Notifications</span>
                  <NotificationBell />
                </div>
                <div className="h-px bg-border my-1" />
                <button
                  onClick={() => { logout(); setMobileOpen(false) }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 w-full"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 space-y-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
