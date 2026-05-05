"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Store, User, Menu, X, LogOut, ShoppingCart, Package,
  BarChart3, Shield,
  Trophy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/marketplace", label: "Marketplace", icon: Store },
]

const vendorLinks = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/vendor/orders", label: "Orders", icon: Package },
  { href: "/vendor/listings", label: "Listings", icon: Store },
]

const buyerLinks = [
  { href: "/orders", label: "My Orders", icon: Package },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
]

const adminLinks = [
  { href: "/admin/vendors", label: "Vendors", icon: Shield },
  { href: "/admin/orders", label: "Orders", icon: Package },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/40">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text hidden sm:block">
            Horsey
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                pathname === link.href || pathname.startsWith(link.href + "/")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {user?.role === 'VENDOR' && (
                <Link href="/vendor/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Vendor Portal
                  </Button>
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link href="/admin/orders">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Shield className="w-4 h-4" />
                    Admin
                  </Button>
                </Link>
              )}
              {user?.role === 'BUYER' && (
                <Link href="/cart">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Cart
                  </Button>
                </Link>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="text-sm font-medium max-w-[100px] truncate">
                  {user?.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => logout()}
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
              <Link href="/login">
                <Button size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/20">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl animate-fade-in">
          <div className="container py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  pathname.startsWith(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <div className="h-px bg-border my-2" />
                {(user?.role === 'VENDOR' ? vendorLinks : user?.role === 'ADMIN' ? adminLinks : buyerLinks).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      pathname.startsWith(link.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            )}
            {!isAuthenticated && (
              <div className="pt-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
