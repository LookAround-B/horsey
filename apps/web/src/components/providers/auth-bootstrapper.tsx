"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores"
import apiClient from "@/lib/api/client"

export function AuthBootstrapper() {
  const { isAuthenticated, logout, setLoading, setUser } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    const token = localStorage.getItem("horsey_access_token")
    if (!token) {
      logout().then(() => router.push("/login"))
      return
    }

    apiClient
      .get("/users/me")
      .then((res) => {
        const user = res.data?.data  // TransformInterceptor: res.data.data = user object
        if (user?.id) setUser(user)
        setLoading(false)
      })
      .catch(() => {
        // Token invalid and refresh failed — force full logout
        logout().then(() => router.push("/login"))
      })
  }, [])

  return null
}
