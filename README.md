# 🐴 Horsey — India's Premier Equestrian Platform

A full-stack equestrian competition management system built for **EFI (Equestrian Federation of India)** compliance, following **REL Guidelines 2026** and **FEI** standards.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TanStack Query, Zustand, shadcn/ui, Tailwind CSS |
| **Backend** | NestJS 10, Prisma ORM, PostgreSQL, Passport JWT |
| **Shared** | TypeScript scoring engines (Dressage, Show Jumping, Tent Pegging) |
| **Auth** | Google OAuth (NextAuth.js) + Phone OTP (Twilio) + JWT refresh rotation |
| **Payments** | Razorpay (entry fee collection) |
| **Real-time** | Pusher (live leaderboards) |

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 9
- **PostgreSQL** ≥ 15

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

```bash
# Root .env (for shared vars)
cp .env.example .env

# Web app
# Edit apps/web/.env — add your Google OAuth credentials

# API
# Edit apps/api/.env — update DATABASE_URL if needed
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret into `apps/web/.env`:
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

### 4. Setup Database

```bash
# Start PostgreSQL, then:
cd packages/database
pnpm db:push     # Push schema to DB
pnpm db:seed     # Seed with demo data
```

### 5. Start Development Servers

```bash
# Terminal 1 — API (port 3001)
cd apps/api && pnpm start:dev

# Terminal 2 — Web (port 3000)
cd apps/web && pnpm dev
```

Open http://localhost:3000

### Test Accounts (OTP code: `123456`)

| Role | Phone | Name |
|------|-------|------|
| Admin | +919999999999 | Admin Horsey |
| Organizer | +919876543210 | Col. Rajesh Sharma |
| Judge | +919876543220 | Mr. Vikram Singh |
| Rider | +919876500001 | Arjun Thapa |

## Architecture

```
horsey/
├── apps/
│   ├── api/          # NestJS backend (REST API)
│   └── web/          # Next.js frontend
├── packages/
│   ├── database/     # Prisma schema + seed
│   └── shared/       # Scoring engines, constants, types
└── .env              # Root environment variables
```

## EFI REL 2026 Compliance

- **MER Tracking**: Dressage ≥57%, SJ ≤8 faults, TP ≥24 points
- **Age Categories**: Children-II (10-12), Children-I (12-14), Junior (14-18), Young Rider (16-21), Senior (18+)
- **6 Regional Zones**: North, East, West, South, Central, North East
- **Daily Horse Limits**: 2 Dressage + 1 SJ OR 2 SJ + 1 Dressage per horse per day
- **Bitting**: Snaffle only for all JNEC categories
- **Horse Age**: 7+ years for Young Rider dressage
- **Error Deductions**: −0.5% (1st), −1.0% (2nd), Elimination (3rd)

## License

Private — Equestrian Federation of India
