"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Trophy, Loader2, ShieldCheck, Award, MapPin, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

const features = [
  {
    icon: Award,
    title: "FEI/EFI Compliant",
    description: "Official scoring systems for Dressage, Show Jumping & Tent Pegging",
  },
  {
    icon: MapPin,
    title: "Event Discovery",
    description: "Find REL events across all 6 regional zones of India",
  },
  {
    icon: BarChart3,
    title: "Live Scoring",
    description: "Real-time leaderboards with MER tracking for JNEC/NEC qualification",
  },
  {
    icon: ShieldCheck,
    title: "MER Records",
    description: "Track Minimum Entry Requirements across disciplines & venues",
  },
]

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = () => {
    setLoading(true)
    signIn("google", { callbackUrl: "/auth/callback" })
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 gradient-bg pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="relative w-full max-w-lg space-y-6">
        {/* Main Auth Card */}
        <Card className="glass-card overflow-hidden">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/25 transition-transform hover:scale-105">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Welcome to Horsey
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                India&apos;s premier equestrian platform — EFI REL 2026 compliant
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-6 pb-8 px-8 space-y-6">
            {/* Google Sign-In Button */}
            <Button
              id="google-sign-in-btn"
              type="button"
              variant="outline"
              className="w-full h-13 gap-3 text-base font-medium border-border/60 hover:bg-muted/50 hover:border-orange-500/30 transition-all duration-300 group"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <GoogleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Continue with Google
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              Sign in with your Google account to access events, scoring, marketplace, and more.
              <br />
              By signing in, you agree to Horsey&apos;s{" "}
              <span className="text-foreground/80 hover:underline cursor-pointer">Terms of Service</span> and{" "}
              <span className="text-foreground/80 hover:underline cursor-pointer">Privacy Policy</span>
            </p>
          </CardContent>
        </Card>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-4 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm hover:border-orange-500/30 hover:bg-card/80 transition-all duration-300"
            >
              <feature.icon className="w-5 h-5 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-sm font-semibold mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
