"use client"

import { useState } from "react"
import { Star, Loader2, Camera, X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { API_BASE } from "@/lib/api"

interface ReviewFormProps {
  productId: string
  productTitle: string
  subOrderId: string
  onReviewSubmitted?: () => void
  onClose?: () => void
}

export function ReviewForm({ productId, productTitle, subOrderId, onReviewSubmitted, onClose }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  const base = API_BASE
  const token = () => localStorage.getItem("horsey_access_token")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) { setError("Please select a rating"); return }
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`${base}/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ rating, body: body.trim() || undefined, subOrderId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || "Failed to submit review")
        return
      }
      setDone(true)
      onReviewSubmitted?.()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 text-center space-y-3">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
          <p className="font-medium">Review submitted!</p>
          <p className="text-sm text-muted-foreground">Thank you for your feedback.</p>
          {onClose && <Button variant="outline" size="sm" onClick={onClose}>Close</Button>}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Review: {productTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star rating */}
          <div className="space-y-1.5">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      (hoverRating || rating) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-sm text-muted-foreground ml-2 self-center">
                  {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Very Good" : "Excellent"}
                </span>
              )}
            </div>
          </div>

          {/* Review text */}
          <div className="space-y-1.5">
            <Label htmlFor="review-body">Your Review (optional)</Label>
            <textarea
              id="review-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              placeholder="Share your experience with this product…"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white gap-2"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Review"}
            </Button>
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
