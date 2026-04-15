import Link from "next/link"
import { Trophy } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/50">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">Horsey</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              India&apos;s comprehensive equestrian platform for events, scoring, marketplace, and stable management.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/events" className="hover:text-foreground transition-colors">Discover Events</Link></li>
              <li><Link href="/marketplace" className="hover:text-foreground transition-colors">Horse Marketplace</Link></li>
              <li><Link href="/stables" className="hover:text-foreground transition-colors">Find Stables</Link></li>
            </ul>
          </div>

          {/* Disciplines */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Disciplines</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Dressage</li>
              <li>Show Jumping</li>
              <li>Eventing</li>
              <li>Tent Pegging</li>
            </ul>
          </div>

          {/* Governing Bodies */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Compliance</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>FEI Compliant Scoring</li>
              <li>EFI REL 2026 Rules</li>
              <li>ITPF Guidelines</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Horsey. Built for Indian Equestrianism.
          </p>
          <p className="text-xs text-muted-foreground">
            FEI · EFI · ITPF Compliant
          </p>
        </div>
      </div>
    </footer>
  )
}
