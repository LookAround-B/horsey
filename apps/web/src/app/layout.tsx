import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/session-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { Navbar } from '@/components/features/navbar'
import { Footer } from '@/components/features/footer'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Horsey — Indian Equestrian Platform',
    template: '%s | Horsey',
  },
  description:
    'Discover equestrian events, FEI/EFI compliant competition scoring, horse marketplace, and stable management across India.',
  keywords: [
    'equestrian', 'horse', 'dressage', 'show jumping', 'tent pegging',
    'EFI', 'FEI', 'India', 'competition', 'scoring',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>
        <SessionProvider>
          <QueryProvider>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster position="top-right" richColors />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
