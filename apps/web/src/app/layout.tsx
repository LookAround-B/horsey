import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/session-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { AuthBootstrapper } from '@/components/providers/auth-bootstrapper'
import { Navbar } from '@/components/features/navbar'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Horsey — Horse Marketplace',
    template: '%s | Horsey',
  },
  description:
    'India\'s unified marketplace for buying horses, feed, tack, grooming supplies, and stable equipment — with a guaranteed 24-hour vendor acceptance SLA on every order.',
  keywords: [
    'horse marketplace', 'buy horse India', 'horse feed', 'tack accessories',
    'equestrian supplies', 'horse breeder', 'KYC verified vendors', 'horse sale India',
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
            <AuthBootstrapper />
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
            </div>
            <Toaster position="top-right" richColors />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
