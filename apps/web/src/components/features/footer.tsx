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
              India&apos;s unified marketplace for buying horses, feed, tack, and all equestrian supplies — with a guaranteed 24-hour vendor SLA.
            </p>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Marketplace</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/marketplace" className="hover:text-foreground transition-colors">Browse All</Link></li>
              <li><Link href="/marketplace?category=horses" className="hover:text-foreground transition-colors">Horses</Link></li>
              <li><Link href="/marketplace?category=feed-supplements" className="hover:text-foreground transition-colors">Feed &amp; Supplements</Link></li>
              <li><Link href="/marketplace?category=tack-accessories" className="hover:text-foreground transition-colors">Tack &amp; Accessories</Link></li>
            </ul>
          </div>

          {/* Sellers */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Sell on Horsey</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/vendor/apply" className="hover:text-foreground transition-colors">Become a Vendor</Link></li>
              <li><Link href="/vendor/dashboard" className="hover:text-foreground transition-colors">Vendor Dashboard</Link></li>
              <li><Link href="/vendor/listings" className="hover:text-foreground transition-colors">Manage Listings</Link></li>
              <li><Link href="/vendor/orders" className="hover:text-foreground transition-colors">Order Inbox</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/register" className="hover:text-foreground transition-colors">Sign Up Free</Link></li>
              <li><Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link></li>
              <li><Link href="/orders" className="hover:text-foreground transition-colors">My Orders</Link></li>
              <li><Link href="/dashboard/profile" className="hover:text-foreground transition-colors">My Profile</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Horsey. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            KYC-verified vendors · 24-hour acceptance SLA · Secure payments
          </p>
        </div>
      </div>
    </footer>
  )
}
