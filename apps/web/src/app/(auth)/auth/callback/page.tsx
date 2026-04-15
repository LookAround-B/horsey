"use client"

import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2, Trophy } from "lucide-react"
import { useAuthStore } from "@/stores"
import apiClient from "@/lib/api/client"
import { ENDPOINTS } from "@/lib/api/endpoints"
import { toast } from "sonner"

/**
 * Post-Google-OAuth callback page.
 *
 * After NextAuth authenticates with Google, this page:
 * 1. Reads the Google ID token from the NextAuth session
 * 2. Exchanges it with the NestJS API at /auth/google
 * 3. Stores the returned Horsey JWT tokens in Zustand + localStorage
 * 4. Redirects to /dashboard
 */
export default function AuthCallbackPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { setAuth, user } = useAuthStore()
  const exchanged = useRef(false)

  useEffect(() => {
    // Skip if already authenticated via Zustand
    if (user) {
      router.replace("/dashboard")
      return
    }

    if (status === "loading") return
    if (status === "unauthenticated") {
      toast.error("Authentication failed. Please try again.")
      router.replace("/login")
      return
    }

    // Session is authenticated — exchange Google token with our NestJS API
    const googleIdToken = (session as any)?.googleIdToken
    if (!googleIdToken || exchanged.current) return

    exchanged.current = true

    const exchangeToken = async () => {
      try {
        const { data } = await apiClient.post(ENDPOINTS.GOOGLE_AUTH, {
          idToken: googleIdToken,
        })

        const result = data.data || data
        setAuth(result.user, result.accessToken, result.refreshToken)
        toast.success(`Welcome, ${result.user.name}!`)
        router.replace("/dashboard")
      } catch (err: any) {
        console.error("Google token exchange failed:", err)
        const message =
          err.response?.data?.message || "Google sign-in failed. Please try again."
        toast.error(message)
        exchanged.current = false // Allow retry
        router.replace("/login")
      }
    }

    exchangeToken()
  }, [session, status, user, router, setAuth])

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
        <Trophy className="w-8 h-8 text-white animate-pulse" />
      </div>
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
        <p className="text-muted-foreground">
          Signing you in with Google...
        </p>
      </div>
      <p className="text-xs text-muted-foreground/60">
        Exchanging credentials with Horsey API
      </p>
    </div>
  )
}
