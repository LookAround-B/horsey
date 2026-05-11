"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { API_BASE } from "@/lib/api"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") ?? ""

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  const base = API_BASE

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Invalid verification link.")
      return
    }

    fetch(`${base}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (res.ok) {
          setStatus("success")
          setMessage(data.message || "Email verified successfully!")
        } else {
          setStatus("error")
          setMessage(data.message || "Verification failed. Link may have expired.")
        }
      })
      .catch(() => {
        setStatus("error")
        setMessage("Something went wrong. Please try again.")
      })
  }, [token])

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="absolute inset-0 gradient-bg pointer-events-none" />
      <Card className="glass-card relative max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
              <h2 className="text-xl font-bold">Verifying your email…</h2>
            </>
          )}
          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold">Email Verified!</h2>
              <p className="text-muted-foreground text-sm">{message}</p>
              <Button onClick={() => router.push("/marketplace")} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                Start Shopping
              </Button>
            </>
          )}
          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold">Verification Failed</h2>
              <p className="text-muted-foreground text-sm">{message}</p>
              <Link href="/login">
                <Button variant="outline" className="mt-2">Back to Login</Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}

