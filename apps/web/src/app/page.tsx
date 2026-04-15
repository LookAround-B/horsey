"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Horsey</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Next.js + NestJS Full Stack Application
      </p>

      <div className="mt-8">
        {status === "loading" ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : session ? (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-lg">
              Welcome, <span className="font-semibold">{session.user?.name || session.user?.email}</span>
            </p>
            <Button onClick={() => signOut()} variant="outline">
              Sign out
            </Button>
          </div>
        ) : (
          <div className="flex space-x-4">
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
