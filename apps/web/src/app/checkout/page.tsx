"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, AlertCircle, MapPin } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import apiClient from "@/lib/api/client"

export default function CheckoutPage() {
  const [cart, setCart] = useState<any>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>("")
  const [placing, setPlacing] = useState(false)
  const [done, setDone] = useState(false)
  const [horsePurchase, setHorsePurchase] = useState(false)
  const [attestation, setAttestation] = useState(false)
  const [vetCheckRequested, setVetCheckRequested] = useState(false)
  const [escrowRequested, setEscrowRequested] = useState(false)
  const [subOrderNotes, setSubOrderNotes] = useState<Record<string, string>>({})
  const router = useRouter()

  useEffect(() => {
    Promise.all([
      apiClient.get("/cart").catch(() => null),
      apiClient.get("/users/me/addresses").catch(() => null),
    ]).then(([cartRes, addrRes]) => {
      const cartData = cartRes?.data?.data ?? null
      const addrList = addrRes?.data?.data ?? []
      setCart(cartData)
      setAddresses(Array.isArray(addrList) ? addrList : [])
      const def = Array.isArray(addrList) ? addrList.find((a: any) => a.isDefault) : null
      if (def) setSelectedAddress(def.id)
      const hasHorse = cartData?.items?.some((i: any) => i.product?.category?.slug === "horses")
      setHorsePurchase(!!hasHorse)
    })
  }, [])

  const vendorGroups: Record<string, any[]> = cart?.items?.reduce((g: any, i: any) => {
    const vid = i.product?.vendor?.id ?? "x"
    g[vid] = [...(g[vid] ?? []), i]
    return g
  }, {}) ?? {}

  const total = cart?.items?.reduce((s: number, i: any) => {
    return s + Number(i.variant?.price ?? i.product?.price ?? 0) * i.quantity
  }, 0) ?? 0

  const placeOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address before placing your order")
      return
    }
    if (horsePurchase && !attestation) {
      toast.error("Please confirm the live animal purchase attestation")
      return
    }
    setPlacing(true)
    try {
      const subOrders = Object.entries(vendorGroups).map(([vendorId]) => ({
        vendorId,
        addressId: selectedAddress,
        notes: subOrderNotes[vendorId] || undefined,
        buyerAttestation: horsePurchase ? attestation : false,
        vetCheckRequested: horsePurchase ? vetCheckRequested : false,
        escrowRequested: horsePurchase ? escrowRequested : false,
      }))
      await apiClient.post("/orders/checkout", { subOrders })
      setDone(true)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to place order. Please try again.")
    } finally {
      setPlacing(false)
    }
  }

  if (done) {
    return (
      <div className="container py-20 text-center max-w-md mx-auto">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
        <p className="text-muted-foreground mb-6">Your payment is authorized. The vendor has 24 hours to accept your order.</p>
        <Button onClick={() => router.push("/orders")}>Track My Orders</Button>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Address */}
          <Card className="glass-card">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold">Delivery Address</h3>
              {addresses.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <MapPin className="w-10 h-10 text-muted-foreground/40" />
                  <div>
                    <p className="text-sm font-medium">No saved addresses</p>
                    <p className="text-xs text-muted-foreground mt-1">Add a shipping address to your profile before checking out.</p>
                  </div>
                  <Link href="/dashboard/profile">
                    <Button size="sm" variant="outline">Add Address in Profile</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {addresses.map((addr: any) => (
                    <label key={addr.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedAddress === addr.id ? "border-primary bg-primary/5" : "border-border"}`}>
                      <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1" />
                      <div>
                        <p className="text-sm font-medium">{addr.label ?? "Address"}</p>
                        <p className="text-xs text-muted-foreground">{addr.line1}, {addr.city}, {addr.state} — {addr.pincode}</p>
                      </div>
                    </label>
                  ))}
                  <Link href="/dashboard/profile" className="inline-flex">
                    <Button size="sm" variant="ghost" className="text-xs text-muted-foreground h-7 px-2">+ Add another address</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary by Vendor */}
          {Object.entries(vendorGroups).map(([vendorId, items]: [string, any]) => (
            <Card key={vendorId} className="glass-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{items[0]?.product?.vendor?.businessName}</h3>
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> 24h acceptance SLA
                  </span>
                </div>
                {items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">{item.quantity}×</span>
                    <span className="flex-1">{item.product?.title}</span>
                    <span className="font-medium">₹{(Number(item.variant?.price ?? item.product?.price ?? 0) * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
                <div className="pt-2">
                  <Label className="text-xs text-muted-foreground">Order notes for this vendor (optional)</Label>
                  <Input
                    placeholder="Special instructions…"
                    value={subOrderNotes[vendorId] ?? ""}
                    onChange={(e) => setSubOrderNotes((prev) => ({ ...prev, [vendorId]: e.target.value }))}
                    className="mt-1 text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Horse attestation */}
          {horsePurchase && (
            <Card className="glass-card border-amber-500/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertCircle className="w-5 h-5" />
                  <h3 className="font-semibold">Live Animal Purchase</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your cart includes a live horse. By proceeding, you confirm that you understand the terms for live animal purchases, including transport coordination and no-return policy.
                </p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={attestation} onChange={(e) => setAttestation(e.target.checked)} className="rounded" />
                  <span className="text-sm font-medium">I confirm and agree to the live animal purchase terms</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={vetCheckRequested} onChange={(e) => setVetCheckRequested(e.target.checked)} className="rounded" />
                  <span className="text-sm">Request vet check before transport</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={escrowRequested} onChange={(e) => setEscrowRequested(e.target.checked)} className="rounded" />
                  <span className="text-sm">Use escrow payment (recommended for high-value purchases)</span>
                </label>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <Card className="glass-card sticky top-6">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform fee</span>
                  <span>Included</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-xs text-muted-foreground">Payment authorized now. Captured only when vendor accepts.</p>
              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                onClick={placeOrder}
                disabled={placing || addresses.length === 0}
              >
                {placing ? "Placing Order…" : "Place Order & Authorize Payment"}
              </Button>
              {addresses.length === 0 && (
                <p className="text-xs text-center text-muted-foreground">Add an address to continue</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
