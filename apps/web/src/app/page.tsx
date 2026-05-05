import Link from "next/link"
import {
  ArrowRight, ShoppingBag, Store, Shield, Clock, Star, ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const categories = [
  { name: "Horses", slug: "horses", emoji: "🐴", description: "Foals, broodmares, performance horses", accent: "from-amber-500 to-orange-600" },
  { name: "Feed & Supplements", slug: "feed-supplements", emoji: "🌾", description: "Hay, grain, vitamins, electrolytes", accent: "from-green-500 to-emerald-600" },
  { name: "Tack & Accessories", slug: "tack-accessories", emoji: "🏇", description: "Saddles, bridles, halters, blankets", accent: "from-blue-500 to-indigo-600" },
  { name: "Grooming & Health", slug: "grooming-health", emoji: "✨", description: "Brushes, shampoos, first-aid supplies", accent: "from-pink-500 to-rose-600" },
  { name: "Stable Equipment", slug: "stable-equipment", emoji: "🏠", description: "Buckets, troughs, fencing, mucking tools", accent: "from-violet-500 to-purple-600" },
]

const whyHorsey = [
  {
    icon: Shield,
    title: "Verified Vendors",
    description: "Every seller goes through KYC verification before listing products.",
  },
  {
    icon: Clock,
    title: "24-Hour Acceptance SLA",
    description: "Vendors must accept or decline within 24 hours — or your payment is automatically refunded.",
  },
  {
    icon: Star,
    title: "Trusted Reviews",
    description: "Real reviews from verified buyers, tied to confirmed purchases.",
  },
  {
    icon: ShoppingBag,
    title: "Multi-Vendor Cart",
    description: "Shop from multiple sellers in one checkout. Each sub-order tracked independently.",
  },
]

const stats = [
  { value: "300+", label: "Listed Horses" },
  { value: "5,000+", label: "SKUs" },
  { value: "100+", label: "Verified Vendors" },
  { value: "90%+", label: "Acceptance Rate" },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

        <div className="container relative py-24 md:py-36">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="px-4 py-1.5 text-xs font-medium">
              India&apos;s Premier Horse Marketplace
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1]">
              Buy Horses, Feed &amp;{" "}
              <span className="gradient-text">Everything Equestrian</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A unified marketplace connecting riders with verified breeders, feed suppliers,
              and tack retailers — with a guaranteed 24-hour vendor acceptance SLA on every order.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href="/marketplace">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 gap-2 h-12 px-8 text-base">
                  Browse Marketplace
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/vendor/apply">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base gap-2">
                  <Store className="w-4 h-4" />
                  Sell on Horsey
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="outline" className="mb-4">Categories</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
          <p className="text-muted-foreground text-lg">
            Five curated categories covering every equestrian need.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {categories.map((cat, i) => (
            <Link key={cat.slug} href={`/marketplace?category=${cat.slug}`}>
              <Card className="glass-card group hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full">
                <CardContent className="p-6 space-y-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.accent} flex items-center justify-center text-2xl shadow-lg`}>
                    {cat.emoji}
                  </div>
                  <h3 className="text-base font-semibold">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cat.description}</p>
                  <div className="flex items-center text-xs text-primary font-medium gap-1 group-hover:gap-2 transition-all">
                    Browse <ChevronRight className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Horsey */}
      <section className="bg-card/30 border-y border-border/40">
        <div className="container py-20 md:py-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="outline" className="mb-4">Why Horsey</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Trust</h2>
            <p className="text-muted-foreground text-lg">
              Every feature is designed around the unique needs of horse owners and equestrian businesses.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyHorsey.map((f) => (
              <Card key={f.title} className="glass-card">
                <CardContent className="p-6 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 md:py-28">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-transparent" />
          <div className="relative glass-card rounded-2xl p-10 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Buying or Selling?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Join thousands of riders and vendors on India&apos;s most trusted equestrian marketplace.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 h-12 px-8">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button size="lg" variant="outline" className="h-12 px-8">
                  Browse Without Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
