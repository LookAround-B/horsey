"use client"

import { useState, useEffect } from "react"
import { Settings, Loader2, Save, Clock, Percent, CalendarDays } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { API_BASE } from "@/lib/api"

const DEFAULT_SETTINGS = [
  { key: "sla_window_hours", label: "Default SLA Window", description: "Hours vendors have to accept/decline orders", unit: "hours", icon: Clock, defaultValue: "24" },
  { key: "horse_sla_window_hours", label: "Horse SLA Window", description: "Extended SLA for live animal purchases", unit: "hours", icon: Clock, defaultValue: "72" },
  { key: "commission_rate", label: "Platform Commission", description: "Percentage taken from each sale", unit: "%", icon: Percent, defaultValue: "10" },
  { key: "payout_schedule_days", label: "Payout Schedule", description: "Days after delivery before vendor payout", unit: "days", icon: CalendarDays, defaultValue: "7" },
  { key: "max_strikes_30d", label: "Max SLA Strikes", description: "Strikes in 30 days before auto-suspension", unit: "strikes", icon: Settings, defaultValue: "3" },
]

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const base = API_BASE
  const token = () => localStorage.getItem("horsey_access_token")

  useEffect(() => {
    fetch(`${base}/admin/settings`, { headers: { Authorization: `Bearer ${token()}` } })
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, string> = {}
        if (Array.isArray(data)) {
          data.forEach((s: any) => { map[s.key] = s.value })
        }
        // Fill defaults for missing settings
        DEFAULT_SETTINGS.forEach((s) => {
          if (!map[s.key]) map[s.key] = s.defaultValue
        })
        setSettings(map)
        setLoading(false)
      })
      .catch(() => {
        const map: Record<string, string> = {}
        DEFAULT_SETTINGS.forEach((s) => { map[s.key] = s.defaultValue })
        setSettings(map)
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await fetch(`${base}/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ settings }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="container py-8 max-w-3xl">
        <Skeleton className="h-8 w-48 mb-6" />
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 mb-4 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Platform Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure marketplace rules and parameters</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved ✓" : "Save Changes"}
        </Button>
      </div>

      <div className="space-y-4">
        {DEFAULT_SETTINGS.map((setting) => {
          const Icon = setting.icon
          return (
            <Card key={setting.key} className="glass-card">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{setting.label}</p>
                  <p className="text-xs text-muted-foreground">{setting.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Input
                    type="number"
                    className="w-20 text-center"
                    value={settings[setting.key] ?? setting.defaultValue}
                    onChange={(e) => setSettings((prev) => ({ ...prev, [setting.key]: e.target.value }))}
                  />
                  <span className="text-xs text-muted-foreground w-10">{setting.unit}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
