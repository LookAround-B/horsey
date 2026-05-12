"use client"

import { useState, useEffect, useRef } from "react"
import { MessageSquare, Send, Clock, CheckCircle, XCircle, AlertTriangle, User, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import apiClient from "@/lib/api/client"

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchDisputes = async () => {
    try {
      const res = await apiClient.get("/admin/disputes")
      const body = res.data?.data  // { data: [...], total }
      const raw = body?.data ?? body ?? []
      setDisputes(Array.isArray(raw) ? raw : [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchDisputes() }, [])

  const selectDispute = async (dispute: any) => {
    setSelectedDispute(dispute)
    try {
      const res = await apiClient.get(`/admin/disputes/${dispute.id}/messages`)
      const msgs = res.data?.data  // array directly (no pagination wrapper)
      setMessages(Array.isArray(msgs) ? msgs : [])
    } catch {
      setMessages([])
    }
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedDispute) return
    setSending(true)
    try {
      await apiClient.post(`/admin/disputes/${selectedDispute.id}/messages`, { body: newMessage.trim() })
      setNewMessage("")
      await selectDispute(selectedDispute)
    } catch {}
    setSending(false)
  }

  const resolveDispute = async (id: string, resolution: string) => {
    await apiClient.patch(`/admin/disputes/${id}/resolve`, { resolution })
    await fetchDisputes()
    setSelectedDispute(null)
  }

  const statusIcon: Record<string, any> = {
    OPEN: Clock,
    IN_PROGRESS: MessageSquare,
    RESOLVED: CheckCircle,
    CLOSED: XCircle,
  }

  const statusColor: Record<string, string> = {
    OPEN: "bg-amber-500/10 text-amber-700",
    IN_PROGRESS: "bg-blue-500/10 text-blue-700",
    RESOLVED: "bg-green-500/10 text-green-700",
    CLOSED: "bg-muted text-muted-foreground",
  }

  if (loading) {
    return (
      <div className="max-w-6xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dispute Workspace</h1>
        <Badge variant="secondary">{disputes.filter((d) => d.status === "OPEN" || d.status === "IN_PROGRESS").length} active</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dispute List */}
        <div className="space-y-2 lg:col-span-1 max-h-[70vh] overflow-y-auto">
          {disputes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No disputes</p>
            </div>
          ) : (
            disputes.map((dispute) => {
              const Icon = statusIcon[dispute.status] || Clock
              const isSelected = selectedDispute?.id === dispute.id
              return (
                <button
                  key={dispute.id}
                  onClick={() => selectDispute(dispute)}
                  className={`w-full text-left rounded-xl border p-3 transition-all ${isSelected ? "border-primary bg-primary/5" : "border-border/40 hover:border-primary/30"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{dispute.reason ?? "Dispute"}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        Order: {dispute.subOrderId?.slice(-8)}
                      </p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${statusColor[dispute.status] ?? ""}`}>
                      <Icon className="w-3 h-3 mr-1" />
                      {dispute.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(dispute.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </button>
              )
            })
          )}
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-2">
          {selectedDispute ? (
            <Card className="glass-card h-[70vh] flex flex-col">
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Dispute #{selectedDispute.id.slice(-8)}
                  </CardTitle>
                  {(selectedDispute.status === "OPEN" || selectedDispute.status === "IN_PROGRESS") && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs h-7 gap-1 text-green-600" onClick={() => resolveDispute(selectedDispute.id, "RESOLVED_BUYER_FAVOR")}>
                        <CheckCircle className="w-3 h-3" /> Resolve (Buyer)
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs h-7 gap-1 text-blue-600" onClick={() => resolveDispute(selectedDispute.id, "RESOLVED_VENDOR_FAVOR")}>
                        <CheckCircle className="w-3 h-3" /> Resolve (Vendor)
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No messages yet. Start the conversation.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdmin = msg.senderRole === "ADMIN"
                    return (
                      <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${isAdmin ? "bg-primary/10 text-foreground" : "bg-muted"}`}>
                          <div className="flex items-center gap-1.5 mb-1">
                            {isAdmin ? <Shield className="w-3 h-3 text-primary" /> : <User className="w-3 h-3" />}
                            <span className="text-[10px] font-medium">{msg.senderRole}</span>
                          </div>
                          <p className="text-sm">{msg.body}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(msg.createdAt).toLocaleTimeString("en-IN")}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {(selectedDispute.status === "OPEN" || selectedDispute.status === "IN_PROGRESS") && (
                <div className="p-3 border-t border-border/40 flex gap-2">
                  <Input
                    placeholder="Type a message…"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} disabled={sending || !newMessage.trim()} size="icon" className="shrink-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            <div className="flex items-center justify-center h-[70vh] text-muted-foreground text-sm">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Select a dispute to view the conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
