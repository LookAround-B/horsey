"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Store, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function VendorApplyPage() {
  const [form, setForm] = useState({ businessName: "", gstNumber: "", panNumber: "" })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const token = localStorage.getItem("accessToken")
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
      const res = await fetch(`${base}/vendors/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      if (res.ok) setDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="container py-20 text-center max-w-md mx-auto">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Application Submitted</h2>
        <p className="text-muted-foreground mb-6">Our team will review your KYC documents and approve your account within 2–3 business days.</p>
        <Button onClick={() => router.push("/")}>Back to Home</Button>
      </div>
    )
  }

  return (
    <div className="container py-12 max-w-lg">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Store className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Become a Vendor</h1>
        <p className="text-muted-foreground mt-2">List your horses, feed, and accessories on India's premier equestrian marketplace.</p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input id="businessName" required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} placeholder="e.g. Sharma Stud Farm" />
            </div>
            <div>
              <Label htmlFor="gstNumber">GST Number (optional)</Label>
              <Input id="gstNumber" value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} placeholder="27AAPFU0939F1ZV" />
            </div>
            <div>
              <Label htmlFor="panNumber">PAN Number (optional)</Label>
              <Input id="panNumber" value={form.panNumber} onChange={(e) => setForm({ ...form, panNumber: e.target.value })} placeholder="AAPFU0939F" />
            </div>

            <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
              By applying, you agree to our Vendor Terms including the <strong>24-hour order acceptance SLA</strong>. Repeated SLA breaches may result in account suspension.
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
