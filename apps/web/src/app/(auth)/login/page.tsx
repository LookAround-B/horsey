"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trophy, Phone, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuthStore } from "@/stores"
import apiClient from "@/lib/api/client"
import { ENDPOINTS } from "@/lib/api/endpoints"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) return

    const fullPhone = phone.startsWith("+") ? phone : `+91${phone}`
    setLoading(true)

    try {
      await apiClient.post(ENDPOINTS.SEND_OTP, { phone: fullPhone })
      setPhone(fullPhone)
      setStep("otp")
      toast.success("OTP sent! (Dev mode: use 123456)")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp) return

    setLoading(true)
    try {
      const { data } = await apiClient.post(ENDPOINTS.VERIFY_OTP, {
        phone,
        code: otp,
        name: name || undefined,
      })

      const result = data.data || data
      setAuth(result.user, result.accessToken, result.refreshToken)
      toast.success(`Welcome, ${result.user.name}!`)
      router.push("/dashboard")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 gradient-bg pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

      <Card className="relative w-full max-w-md glass-card">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {step === "phone" ? "Welcome to Horsey" : "Verify OTP"}
            </CardTitle>
            <CardDescription className="mt-1.5">
              {step === "phone"
                ? "Enter your phone number to get started"
                : `Enter the OTP sent to ${phone}`}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  We&apos;ll send a verification code via SMS
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name (for new accounts)</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white h-11 gap-2"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                  required
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-center">
                  Dev mode: use code <code className="text-primary">123456</code>
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white h-11 gap-2"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Verify & Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("phone")}
              >
                ← Change number
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
