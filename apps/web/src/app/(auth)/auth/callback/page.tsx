"use client"

import { useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Trophy } from "lucide-react"
import { useAuthStore } from "@/stores"
import apiClient from "@/lib/api/client"
import { toast } from "sonner"

/**
 * Post-Google-OAuth callback page.
 *
 * After Google authenticates the user, the backend redirects here with a one-time code.
 * This page:
 * 1. Extracts the code from URL query params
 * 2. Exchanges it with the NestJS API at /auth/google/exchange
 * 3. Stores the returned Horsey JWT tokens in Zustand + localStorage
 * 4. Redirects to /dashboard
 */
function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuth, user } = useAuthStore()
  const exchanged = useRef(false)

  useEffect(() => {
    // Skip if already authenticated via Zustand
    if (user) {
      router.replace("/dashboard")
      return
    }

    const code = searchParams.get("code")
    if (!code) {
      toast.error("No authentication code received")
      router.replace("/login")
      return
    }

    if (exchanged.current) return
    exchanged.current = true

    const exchangeCode = async () => {
      try {
        const { data } = await apiClient.post("/auth/google/exchange", {
          code,
        })

        const result = data.data || data
        setAuth(result.user, result.accessToken, result.refreshToken)
        toast.success(`Welcome, ${result.user.name}!`)
        router.replace("/dashboard")
      } catch (err: any) {
        console.error("Google code exchange failed:", err)
        const message =
          err.response?.data?.message || "Google sign-in failed. Please try again."
        toast.error(message)
        exchanged.current = false // Allow retry
        router.replace("/login")
      }
    }

    exchangeCode()
  }, [searchParams, user, router, setAuth])

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

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
