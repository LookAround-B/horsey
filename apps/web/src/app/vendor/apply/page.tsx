"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Store, CheckCircle, Upload, File, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_BASE } from "@/lib/api"

export default function VendorApplyPage() {
  const [form, setForm] = useState({
    businessName: "",
    gstNumber: "",
    panNumber: "",
    bankAccountNumber: "",
    bankIfsc: "",
    bankAccountName: "",
  })
  const [kycFiles, setKycFiles] = useState<{ file: File; type: string }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  const base = API_BASE
  const token = () => localStorage.getItem("horsey_access_token")

  const addKycFile = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0]
    if (file) {
      setKycFiles((prev) => [...prev, { file, type }])
    }
    e.target.value = "" // reset to allow re-selection
  }

  const removeKycFile = (index: number) => {
    setKycFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // 1. Submit application
      const res = await fetch(`${base}/vendors/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        alert("Failed to submit application. Please try again.")
        return
      }

      // 2. Upload KYC documents (if any) via presigned URLs
      for (const kycFile of kycFiles) {
        try {
          // Get presigned URL
          const presignRes = await fetch(`${base}/media/presigned-url`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
            body: JSON.stringify({
              contentType: kycFile.file.type,
              contentLength: kycFile.file.size,
              folder: "kyc",
            }),
          })
          if (!presignRes.ok) continue

          const { presignedUrl, publicUrl } = await presignRes.json()

          // Upload file
          await fetch(presignedUrl, {
            method: "PUT",
            headers: { "Content-Type": kycFile.file.type },
            body: kycFile.file,
          })

          // Link KYC document to vendor profile
          await fetch(`${base}/vendors/kyc-document`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
            body: JSON.stringify({ type: kycFile.type, url: publicUrl }),
          })
        } catch {
          // Continue with other files if one fails
        }
      }

      setDone(true)
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
        <p className="text-muted-foreground mt-2">List your horses, feed, and accessories on India&apos;s premier equestrian marketplace.</p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Business Details */}
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Business Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input id="businessName" required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} placeholder="e.g. Sharma Stud Farm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input id="gstNumber" value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} placeholder="27AAPFU0939F1ZV" />
              </div>
              <div>
                <Label htmlFor="panNumber">PAN Number</Label>
                <Input id="panNumber" value={form.panNumber} onChange={(e) => setForm({ ...form, panNumber: e.target.value })} placeholder="AAPFU0939F" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Account */}
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Bank Account (for payouts)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bankAccountName">Account Holder Name</Label>
              <Input id="bankAccountName" value={form.bankAccountName} onChange={(e) => setForm({ ...form, bankAccountName: e.target.value })} placeholder="Name as on bank account" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bankAccountNumber">Account Number</Label>
                <Input id="bankAccountNumber" value={form.bankAccountNumber} onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })} placeholder="1234567890" />
              </div>
              <div>
                <Label htmlFor="bankIfsc">IFSC Code</Label>
                <Input id="bankIfsc" value={form.bankIfsc} onChange={(e) => setForm({ ...form, bankIfsc: e.target.value })} placeholder="SBIN0001234" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KYC Documents */}
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">KYC Documents</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">Upload identity and business verification documents. Accepted: JPEG, PNG, PDF (max 10MB each).</p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "PAN Card", type: "PAN_CARD" },
                { label: "GST Certificate", type: "GST_CERTIFICATE" },
                { label: "Business Registration", type: "BUSINESS_REGISTRATION" },
                { label: "Address Proof", type: "ADDRESS_PROOF" },
              ].map((docType) => {
                const uploaded = kycFiles.find((f) => f.type === docType.type)
                return (
                  <label key={docType.type} className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${uploaded ? "border-green-500/50 bg-green-500/5" : "border-border/50 hover:border-primary/30 hover:bg-primary/5"}`}>
                    {uploaded ? (
                      <>
                        <File className="w-5 h-5 text-green-500" />
                        <span className="text-xs text-green-600 font-medium text-center truncate max-w-full">{uploaded.file.name}</span>
                        <button type="button" onClick={(e) => { e.preventDefault(); removeKycFile(kycFiles.indexOf(uploaded)) }} className="text-xs text-destructive hover:underline flex items-center gap-1">
                          <X className="w-3 h-3" /> Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground text-center">{docType.label}</span>
                      </>
                    )}
                    <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => addKycFile(e, docType.type)} />
                  </label>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Terms */}
        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
          By applying, you agree to our Vendor Terms including the <strong>24-hour order acceptance SLA</strong>. Repeated SLA breaches may result in account suspension.
        </div>

        <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit Application"}
        </Button>
      </form>
    </div>
  )
}
