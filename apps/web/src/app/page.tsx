import Link from "next/link"
import {
  Trophy, Calendar, Store, Landmark, ArrowRight, Shield,
  Timer, BarChart3, Users, Zap, Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const disciplines = [
  {
    name: "Dressage",
    description: "FEI 26th Edition compliant scoring with 0-10 scale, coefficient multipliers, and multi-judge averaging.",
    icon: "🐴",
    color: "from-violet-500 to-purple-600",
  },
  {
    name: "Show Jumping",
    description: "Table A fault-based scoring with time faults, refusal tracking, and jump-off tiebreakers.",
    icon: "🏇",
    color: "from-blue-500 to-cyan-600",
  },
  {
    name: "Tent Pegging",
    description: "EFI/ITPF points-based scoring for lance and sword events with MER qualification tracking.",
    icon: "⚔️",
    color: "from-amber-500 to-orange-600",
  },
  {
    name: "Eventing",
    description: "Three-phase combined penalties — dressage, cross-country, and show jumping.",
    icon: "🎯",
    color: "from-emerald-500 to-teal-600",
  },
]

const features = [
  {
    icon: Calendar,
    title: "Event Discovery",
    description: "Browse sanctioned events across India with map-based search and advanced filters.",
  },
  {
    icon: Timer,
    title: "Live Scoring",
    description: "Real-time FEI/EFI compliant scoring with instant leaderboard updates during competitions.",
  },
  {
    icon: BarChart3,
    title: "MER Tracking",
    description: "Automatic Minimum Entry Requirements tracking for NEC/JNEC qualification.",
  },
  {
    icon: Store,
    title: "Horse Marketplace",
    description: "Buy and sell horses with detailed profiles, breed info, and discipline history.",
  },
  {
    icon: Landmark,
    title: "Stable Finder",
    description: "Discover stables near you with amenities, reviews, and direct booking inquiries.",
  },
  {
    icon: Shield,
    title: "FEI/EFI Compliant",
    description: "Scoring engines built to exact FEI and EFI REL 2026 specifications.",
  },
]

const stats = [
  { value: "6", label: "Regional Zones" },
  { value: "4", label: "Disciplines" },
  { value: "5", label: "Age Categories" },
  { value: "10", label: "Competition Levels" },
]

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

        <div className="container relative py-24 md:py-36 lg:py-44">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="px-4 py-1.5 text-xs font-medium">
              <Zap className="w-3 h-3 mr-1.5" />
              FEI & EFI REL 2026 Compliant
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1]">
              India&apos;s Premier{" "}
              <span className="gradient-text">Equestrian</span>{" "}
              Platform
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover events, compete with live scoring, trade horses, and find stables —
              all on one platform built for the Indian equestrian community.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href="/events">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 gap-2 h-12 px-8 text-base">
                  Explore Events
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base gap-2">
                  <Users className="w-4 h-4" />
                  Join as Rider
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disciplines */}
      <section className="container py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="outline" className="mb-4">Disciplines</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Complete Discipline Coverage
          </h2>
          <p className="text-muted-foreground text-lg">
            Supporting all major equestrian disciplines with rule-accurate scoring engines.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {disciplines.map((d, i) => (
            <Card key={d.name} className="glass-card group hover:scale-[1.02] transition-all duration-300" style={{ animationDelay: `${i * 100}ms` }}>
              <CardContent className="p-6 space-y-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${d.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {d.icon}
                </div>
                <h3 className="text-lg font-semibold">{d.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {d.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-card/30 border-y border-border/40">
        <div className="container py-20 md:py-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg">
              From event discovery to live scoring, marketplace, and stable management.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Card key={f.title} className="glass-card group hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 md:py-28">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-transparent" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="relative glass-card rounded-2xl p-10 md:p-16 text-center">
            <Globe className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Join India&apos;s Equestrian Community?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Whether you&apos;re a rider, judge, organizer, or stable owner — Horsey has everything you need.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 h-12 px-8">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/events">
                <Button size="lg" variant="outline" className="h-12 px-8">
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
