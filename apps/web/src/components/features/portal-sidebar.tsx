"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Store, Package, ShoppingCart, User,
  BarChart3, Plus, DollarSign,
  Shield, Users, FolderTree, MessageSquare, Settings,
  Trophy,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores"
import { Button } from "@/components/ui/button"

type NavLink = { href: string; label: string; icon: React.ElementType; group?: string }

const buyerLinks: NavLink[] = [
  { href: "/dashboard",         label: "Dashboard",   icon: LayoutDashboard, group: "main" },
  { href: "/marketplace",       label: "Marketplace", icon: Store,           group: "main" },
  { href: "/orders",            label: "My Orders",   icon: Package,         group: "main" },
  { href: "/cart",              label: "Cart",        icon: ShoppingCart,    group: "main" },
  { href: "/dashboard/profile", label: "Profile",     icon: User,            group: "account" },
]

const vendorLinks: NavLink[] = [
  { href: "/dashboard",           label: "Dashboard",   icon: LayoutDashboard, group: "main" },
  { href: "/vendor/orders",       label: "Order Inbox", icon: Package,         group: "store" },
  { href: "/vendor/listings",     label: "My Listings", icon: Store,           group: "store" },
  { href: "/vendor/payouts",      label: "Payouts",     icon: DollarSign,      group: "store" },
  { href: "/dashboard/profile",   label: "Profile",     icon: User,            group: "account" },
]

const adminLinks: NavLink[] = [
  { href: "/dashboard",         label: "Dashboard",  icon: LayoutDashboard, group: "main" },
  { href: "/marketplace",       label: "Marketplace",icon: Store,           group: "main" },
  { href: "/admin/vendors",     label: "Vendors",    icon: Shield,          group: "manage" },
  { href: "/admin/orders",      label: "Orders",     icon: Package,         group: "manage" },
  { href: "/admin/users",       label: "Users",      icon: Users,           group: "manage" },
  { href: "/admin/categories",  label: "Categories", icon: FolderTree,      group: "manage" },
  { href: "/admin/disputes",    label: "Disputes",   icon: MessageSquare,   group: "manage" },
  { href: "/admin/settings",    label: "Settings",   icon: Settings,        group: "config" },
  { href: "/dashboard/profile", label: "Profile",    icon: User,            group: "account" },
]

const groupLabels: Record<string, string> = {
  main: "Overview",
  store: "Store",
  manage: "Manage",
  config: "Config",
  account: "Account",
}

const portalMeta = {
  BUYER:  { label: "My Dashboard",   sub: "Buyer account",      color: "from-orange-500 to-amber-600" },
  VENDOR: { label: "Vendor Portal",  sub: "Manage your store",  color: "from-orange-500 to-amber-600" },
  ADMIN:  { label: "Admin Portal",   sub: "Platform oversight", color: "from-purple-500 to-indigo-600" },
}

export function PortalSidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const role = user?.role ?? "BUYER"

  const links = role === "VENDOR" ? vendorLinks : role === "ADMIN" ? adminLinks : buyerLinks
  const meta = portalMeta[role as keyof typeof portalMeta] ?? portalMeta.BUYER

  // Group the links
  const groups = [...new Set(links.map((l) => l.group ?? "main"))]

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-border/40 bg-card/30 backdrop-blur-sm min-h-[calc(100vh-4rem)]">
      {/* Portal header */}
      <div className="px-4 py-5 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-md shrink-0`}>
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-none truncate">{meta.label}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{meta.sub}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {groups.map((group) => {
          const groupLinks = links.filter((l) => (l.group ?? "main") === group)
          return (
            <div key={group}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-2 mb-1.5">
                {groupLabels[group] ?? group}
              </p>
              <div className="space-y-0.5">
                {groupLinks.map((link) => {
                  const active = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href + "/"))
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      )}
                    >
                      <link.icon className={cn("w-4 h-4 shrink-0 transition-colors", active ? "text-primary" : "group-hover:text-foreground")} />
                      <span className="flex-1">{link.label}</span>
                      {active && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Vendor CTA */}
      {role === "VENDOR" && (
        <div className="px-3 pb-4 border-t border-border/40 pt-3">
          <Link href="/vendor/listings/new">
            <Button size="sm" className="w-full gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20">
              <Plus className="w-3.5 h-3.5" />
              New Listing
            </Button>
          </Link>
        </div>
      )}
    </aside>
  )
}
