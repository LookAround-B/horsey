import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes only VENDOR (or ADMIN acting as vendor) can access
const VENDOR_ONLY = [
  '/vendor/dashboard',
  '/vendor/orders',
  '/vendor/listings',
  '/vendor/payouts',
]

// Routes only ADMIN can access
const ADMIN_ONLY = '/admin'

// Routes any authenticated user can access (regardless of role)
const AUTH_REQUIRED = [
  '/dashboard',   // all roles land here after login
  '/orders',
  '/cart',
  '/checkout',
  '/vendor/apply',
]

// Auth pages — redirect away if already logged in
const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password']

function getPortalHome(_role: string): string {
  return '/dashboard'
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const role = request.cookies.get('horsey_role')?.value  // BUYER | VENDOR | ADMIN | undefined

  // ── Auth pages: redirect authenticated users to their portal ───────────
  if (AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    if (role) {
      return NextResponse.redirect(new URL(getPortalHome(role), request.url))
    }
    return NextResponse.next()
  }

  // ── Admin-only routes ──────────────────────────────────────────────────
  if (pathname.startsWith(ADMIN_ONLY)) {
    if (!role) return redirectToLogin(request)
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL(getPortalHome(role), request.url))
    }
    return NextResponse.next()
  }

  // ── Vendor-only routes (excludes /vendor/apply which is AUTH_REQUIRED) ─
  if (VENDOR_ONLY.some((p) => pathname.startsWith(p))) {
    if (!role) return redirectToLogin(request)
    if (role !== 'VENDOR' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL(getPortalHome(role), request.url))
    }
    return NextResponse.next()
  }

  // ── Auth-required routes (any authenticated role) ──────────────────────
  if (AUTH_REQUIRED.some((p) => pathname.startsWith(p))) {
    if (!role) return redirectToLogin(request)
    return NextResponse.next()
  }

  return NextResponse.next()
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('from', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    // Skip static files, images, and Next.js internals
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)).*)',
  ],
}
