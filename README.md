# Horsey

A full-stack monorepo application built with Next.js (frontend) and NestJS (backend).

## Tech Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS, shadcn/ui
- **Backend:** NestJS 10, Express
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js (Google OAuth + Email/Password)
- **Package Manager:** pnpm with workspaces

## Project Structure

```
horsey/
├── apps/
│   ├── web/                 # Next.js frontend (port 3000)
│   │   ├── src/
│   │   │   ├── app/         # App router pages
│   │   │   ├── components/  # React components
│   │   │   └── lib/         # Utilities
│   │   └── ...
│   └── api/                 # NestJS backend (port 3001)
│       ├── src/
│       │   ├── app.module.ts
│       │   ├── app.controller.ts
│       │   └── main.ts
│       └── ...
├── packages/
│   └── database/            # Shared Prisma client
│       ├── prisma/
│       │   └── schema.prisma
│       └── src/
│           └── index.ts
├── package.json
├── pnpm-workspace.yaml
└── .env.example
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- PostgreSQL

### Setup

1. **Clone and install dependencies:**

   ```bash
   cd horsey
   pnpm install
   ```

2. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:

   ```env
   # Database
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/horsey?schema=public"

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

   Generate a secret:
   ```bash
   openssl rand -base64 32
   ```

3. **Setup database:**

   ```bash
   # Generate Prisma client
   pnpm --filter database db:generate

   # Push schema to database
   pnpm --filter database db:push
   ```

4. **Start development servers:**

   ```bash
   pnpm dev
   ```

   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## Scripts

### Root

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm dev:web` | Start frontend only |
| `pnpm dev:api` | Start backend only |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all apps |

### Database

| Command | Description |
|---------|-------------|
| `pnpm --filter database db:generate` | Generate Prisma client |
| `pnpm --filter database db:push` | Push schema to database |
| `pnpm --filter database db:migrate` | Run migrations |
| `pnpm --filter database db:studio` | Open Prisma Studio |

## Authentication

The app includes NextAuth.js with:

- **Email/Password:** Register at `/register`, login at `/login`
- **Google OAuth:** Configure credentials in Google Cloud Console

### Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `.env`

## API Endpoints

### Backend (NestJS)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Hello message |
| GET | `/health` | Health check |

### Frontend API Routes (Next.js)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | User registration |
| * | `/api/auth/*` | NextAuth endpoints |
