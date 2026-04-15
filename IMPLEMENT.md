# Horsey - Implementation Plan

## Project Overview

Horsey is a comprehensive equestrian platform for India covering event discovery, competition scoring (FEI/EFI compliant), horse marketplace, and stable management.

**Governing Bodies:** FEI (International), EFI (Equestrian Federation of India)

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 (App Router) |
| **Backend** | NestJS (REST API) |
| UI | shadcn/ui + Tailwind CSS |
| State | Zustand |
| Forms | React Hook Form + Zod |
| API Communication | Axios + React Query (TanStack Query) |
| Backend Validation | class-validator + class-transformer |
| Database | PostgreSQL (Neon/Railway) + Prisma |
| Cache | Redis (Upstash) |
| Realtime | Pusher/Ably |
| Auth | NextAuth.js v5 (Frontend) + NestJS Guards + Twilio Verify |
| Payments | Razorpay |
| Media | Cloudinary + AWS S3 |
| Notifications | FCM + Resend |
| Maps | Mapbox GL JS |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│              Next.js 15 (App Router, SSR/CSR)               │
│         shadcn/ui · Tailwind · Zustand · TanStack Query     │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/REST (Axios)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                       Backend Layer                         │
│                  NestJS REST API (Port 3001)                 │
│      Controllers · Services · Guards · Interceptors         │
│          class-validator · Prisma ORM · Redis Cache         │
└──────────┬─────────────────────────────┬────────────────────┘
           │                             │
           ▼                             ▼
┌──────────────────┐           ┌──────────────────────────────┐
│   PostgreSQL DB  │           │  External Services           │
│  (Neon/Railway)  │           │  Pusher · Razorpay ·         │
│   Prisma ORM     │           │  Cloudinary · Twilio ·       │
│   PostGIS ext.   │           │  Resend · FCM · Mapbox       │
└──────────────────┘           └──────────────────────────────┘
```

---

## Project Structure

```
horsey/
├── apps/
│   ├── web/                            # Next.js 15 Frontend
│   │   ├── app/
│   │   │   ├── (auth)/                 # Auth routes (login, OTP)
│   │   │   ├── (dashboard)/            # Protected dashboard routes
│   │   │   ├── events/                 # Event discovery (SSR)
│   │   │   ├── marketplace/            # Horse marketplace
│   │   │   ├── judge/                  # Judge scoring interface
│   │   │   │   ├── dressage/
│   │   │   │   ├── show-jumping/
│   │   │   │   └── tent-pegging/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/                     # shadcn components
│   │   │   ├── scoring/                # Scoring UI components
│   │   │   │   ├── DressageScoreSheet.tsx
│   │   │   │   ├── MovementInput.tsx
│   │   │   │   ├── CollectiveMarks.tsx
│   │   │   │   ├── ShowJumpingScorer.tsx
│   │   │   │   └── Leaderboard.tsx
│   │   │   └── features/               # Feature components
│   │   ├── lib/
│   │   │   ├── api/                    # Axios client + API hooks
│   │   │   │   ├── client.ts           # Axios instance with interceptors
│   │   │   │   ├── hooks/              # TanStack Query hooks
│   │   │   │   │   ├── useScores.ts
│   │   │   │   │   ├── useEvents.ts
│   │   │   │   │   └── useEntries.ts
│   │   │   │   └── endpoints/          # API endpoint constants
│   │   │   ├── auth/                   # NextAuth config
│   │   │   ├── scoring/                # Client-side score display utils
│   │   │   └── utils/
│   │   └── stores/                     # Zustand stores
│   │
│   └── api/                            # NestJS Backend
│       ├── src/
│       │   ├── main.ts                 # Bootstrap & Swagger setup
│       │   ├── app.module.ts
│       │   ├── common/
│       │   │   ├── guards/             # AuthGuard, RolesGuard
│       │   │   ├── interceptors/       # Logging, Transform
│       │   │   ├── filters/            # Global exception filter
│       │   │   ├── decorators/         # @Roles(), @CurrentUser()
│       │   │   └── pipes/              # ValidationPipe config
│       │   ├── auth/
│       │   │   ├── auth.module.ts
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── jwt.strategy.ts
│       │   │   └── dto/
│       │   ├── users/
│       │   │   ├── users.module.ts
│       │   │   ├── users.controller.ts
│       │   │   ├── users.service.ts
│       │   │   └── dto/
│       │   ├── events/
│       │   │   ├── events.module.ts
│       │   │   ├── events.controller.ts
│       │   │   ├── events.service.ts
│       │   │   └── dto/
│       │   ├── competitions/
│       │   ├── scoring/
│       │   │   ├── scoring.module.ts
│       │   │   ├── scoring.controller.ts
│       │   │   ├── scoring.service.ts
│       │   │   ├── dressage/
│       │   │   │   ├── dressage.service.ts    # Scoring calc logic
│       │   │   │   └── dressage.dto.ts
│       │   │   ├── show-jumping/
│       │   │   └── tent-pegging/
│       │   ├── horses/
│       │   ├── marketplace/
│       │   ├── stables/
│       │   ├── payments/
│       │   │   ├── payments.module.ts
│       │   │   ├── payments.controller.ts
│       │   │   └── razorpay.service.ts
│       │   ├── notifications/
│       │   │   ├── fcm.service.ts
│       │   │   └── email.service.ts
│       │   ├── realtime/
│       │   │   └── pusher.service.ts
│       │   └── prisma/
│       │       ├── prisma.module.ts
│       │       └── prisma.service.ts
│       └── test/
│
├── packages/
│   ├── db/                             # Shared Prisma schema & client
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed/
│   │   │       └── testSheets.ts       # Seed FEI/EFI test sheets
│   │   └── index.ts
│   ├── scoring/                        # Shared scoring logic (used by NestJS)
│   │   ├── dressage/
│   │   │   ├── calculate.ts
│   │   │   ├── validate.ts
│   │   │   └── testSheets/
│   │   ├── showJumping/
│   │   └── eventing/
│   └── types/                          # Shared TypeScript types & DTOs
│       ├── scoring.types.ts
│       ├── event.types.ts
│       └── user.types.ts
│
├── turbo.json                          # Turborepo config
└── package.json
```

---

## API Design (NestJS REST)

### Base URL
- Development: `http://localhost:3001/api/v1`
- Production: `https://api.horsey.in/api/v1`

### Authentication
- JWT Bearer tokens (access + refresh)
- Phone OTP via Twilio Verify
- Google OAuth (handled by NextAuth, token exchanged with NestJS)

### Key Endpoints

```
# Auth
POST   /auth/send-otp
POST   /auth/verify-otp
POST   /auth/google
POST   /auth/refresh
POST   /auth/logout

# Users
GET    /users/me
PATCH  /users/me
GET    /users/:id

# Events
GET    /events                    # SSR-friendly, paginated
GET    /events/:id
POST   /events                    # Organizer only
PATCH  /events/:id
POST   /events/:id/publish

# Competitions
GET    /events/:eventId/competitions
POST   /events/:eventId/competitions
GET    /competitions/:id
PATCH  /competitions/:id

# Entries
POST   /competitions/:id/entries
GET    /competitions/:id/entries
DELETE /entries/:id

# Scoring
POST   /scores/dressage           # Judge submits dressage scores
POST   /scores/show-jumping       # Judge submits SJ faults
POST   /scores/tent-pegging
PATCH  /scores/:id                # Correction
GET    /competitions/:id/scores
GET    /competitions/:id/leaderboard

# Horses
GET    /horses
POST   /horses
GET    /horses/:id
PATCH  /horses/:id

# Marketplace
GET    /marketplace/horses
GET    /marketplace/horses/:id

# Payments
POST   /payments/create-order     # Razorpay order
POST   /payments/verify           # Razorpay webhook

# Stables
GET    /stables
POST   /stables
GET    /stables/:id

# MER Records
GET    /users/me/mer-records
GET    /users/me/mer-records/:discipline
```

---

## NestJS Module Setup

### app.module.ts

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    EventsModule,
    CompetitionsModule,
    ScoringModule,
    HorsesModule,
    MarketplaceModule,
    PaymentsModule,
    StablesModule,
    NotificationsModule,
    RealtimeModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
  ],
})
export class AppModule {}
```

### Global Validation Pipe (main.ts)

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  app.enableCors({ origin: process.env.FRONTEND_URL });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Horsey API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(3001);
}
```

---

## Frontend API Client (Next.js)

### Axios Client Setup

```typescript
// apps/web/lib/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken(); // from cookie/store
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await refreshTokens();
      return apiClient.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

### TanStack Query Hook Example

```typescript
// apps/web/lib/api/hooks/useLeaderboard.ts
export function useLeaderboard(competitionId: string) {
  return useQuery({
    queryKey: ['leaderboard', competitionId],
    queryFn: () =>
      apiClient
        .get(`/competitions/${competitionId}/leaderboard`)
        .then((r) => r.data),
    refetchInterval: 5000, // Poll every 5s (supplement Pusher)
  });
}
```

---

## Indian Equestrian Disciplines & Scoring Systems

### Supported Disciplines

| Discipline | Scoring Type | Governing Rules |
|------------|--------------|-----------------|
| **Dressage** | Percentage-based (0-10 scale) | FEI 26th Edition, EFI Rules |
| **Show Jumping** | Fault-based penalties | FEI Rules, EFI |
| **Tent Pegging** | Points-based | EFI/ITPF Rules |
| **Eventing** | Combined penalties | FEI Rules |

---

## Dressage Scoring System (FEI/EFI Compliant)

### Arena Configurations

#### 20 × 60 m Standard Arena (FEI/Upper Levels)

| Letter | Location | Distance from A |
|--------|----------|-----------------|
| A | Entry (bottom centre) | 0 m |
| K | Left long side | 6 m |
| V | Left long side | 18 m |
| E | Left long side (centre) | 30 m |
| S | Left long side | 42 m |
| H | Left long side | 54 m |
| C | Chief Judge (top centre) | 60 m |
| M | Right long side | 54 m |
| R | Right long side | 42 m |
| B | Right long side (centre) | 30 m |
| P | Right long side | 18 m |
| F | Right long side | 6 m |
| D | Centre line | 12 m |
| L | Centre line | 24 m |
| X | Centre line (midpoint) | 30 m |
| I | Centre line | 36 m |
| G | Centre line | 48 m |

#### 20 × 40 m Small Arena (Introductory/Training)

| Letter | Location | Distance from A |
|--------|----------|-----------------|
| A | Entry | 0 m |
| K | Left long side | 6 m |
| E | Left long side (centre) | 20 m |
| H | Left long side | 34 m |
| C | Chief Judge | 40 m |
| M | Right long side | 34 m |
| B | Right long side (centre) | 20 m |
| F | Right long side | 6 m |
| D | Centre line | 10 m |
| X | Centre line (midpoint) | 20 m |
| G | Centre line | 30 m |

### Scoring Scale (0-10)

| Mark | Descriptor | Meaning |
|------|------------|---------|
| 10 | Excellent | Technically perfect, harmonious. Rarely awarded. |
| 9 | Very Good | Outstanding quality, minor flaws only. |
| 8 | Good | Clearly above average, correct with quality. |
| 7 | Fairly Good | Above average, correct but lacking expression. |
| 6 | Satisfactory | Average, mostly correct. |
| 5 | Sufficient | Marginal, some clear weaknesses. |
| 4 | Insufficient | Below average, notable faults. |
| 3 | Fairly Bad | Clearly incorrect. |
| 2 | Bad | Severely flawed. |
| 1 | Very Bad | Nearly not performed. |
| 0 | Not Performed | Not attempted or completely wrong. |

**Key Thresholds:**
- **60%** — Ready to move up a level
- **65%** — Comfortably ready to progress
- **65%+** — Required for FEI CDI4*/CDI5* Grand Prix progression

### Coefficient Multipliers

| Movement Type | Raw Mark (max) | Coefficient | Points (max) |
|---------------|----------------|-------------|--------------|
| Standard movement | 10 | ×1 | 10 |
| Coefficient movement | 10 | ×2 | 20 |
| Collective mark (standard) | 10 | ×1 | 10 |
| Collective mark (coefficient) | 10 | ×2 | 20 |

### Collective Marks

| Collective Mark | Coefficient | Evaluation |
|-----------------|-------------|------------|
| Gaits (Paces) | ×2 | Freedom, regularity, quality of walk/trot/canter |
| Impulsion | ×2 | Desire to move forward, elasticity, engagement |
| Submission | ×2 | Attention, harmony, lightness, acceptance of contact |
| Rider's Position & Seat | ×1 | Posture, alignment, stability, independent seat |
| Rider's Use of Aids | ×1 | Correct, effective, clear use of leg/rein/seat aids |

### Score Calculation

```
Step 1: Raw Score = Σ(movement mark × coefficient) − error deductions
Step 2: Judge % = (Raw Score ÷ Maximum Possible) × 100 (2 decimal places)
Step 3: Final % = Σ(Judge Percentages) ÷ Number of Judges (2 decimal places)
Step 4: Eventing Penalties = 100 − Final % (1 decimal place)
```

### Error Penalties (EFI REL 2026)

**Important:** EFI uses percentage-based deductions, not mark-based.

| Error | Deduction |
|-------|-----------|
| First error of course | −0.5 percentage points |
| Second error | −1.0 percentage point |
| Third error | **Elimination** |
| Other errors | −2 points each |
| Late arena entry (45-90 sec) | −2 marks |
| Late arena entry (>90 sec) | **Elimination** |

**Note:** This differs from FEI international rules which use mark deductions (−2, −4).

### EFI Age Categories (REL 2026)

| Category | Age Range | Disciplines |
|----------|-----------|-------------|
| Children-II | 10-12 years | Show Jumping, Dressage |
| Children-I | 12-14 years | Show Jumping, Dressage |
| Junior | 14-18 years | Show Jumping, Dressage |
| Young Rider | 16-21 years | Show Jumping, Dressage |
| Senior | 18+ years | Tent Pegging only |

*Ages calculated as of 01 January of the calendar year.*

### EFI Minimum Entry Requirements (MER) for NEC/JNEC

| Discipline | Category | MER Requirement | MERs Required |
|------------|----------|-----------------|---------------|
| **Show Jumping** | Juniors, Ch-I, Ch-II | Max 8 jumping penalties (excl. time) | 2 MERs |
| **Dressage** | Juniors, Ch-I, Ch-II | Min 57% score in REL | 2 MERs |
| **Tent Pegging** | Seniors | Min 24 points (incl. time penalties) | 2 MERs |

**MER Rules:**
- MER is for the rider, not horse-rider combination
- Must achieve MERs on two different horses OR same horse at two different venues
- Only 50 entries permitted per category for JNEC
- Merit list prepared by EFI based on highest scores

### EFI Dressage Test Sheets

| Category | Test | Movements | Max Score | Time |
|----------|------|-----------|-----------|------|
| Young Rider | Appendix A | 27 | 290 points | 6'30" |
| Junior | Appendix C | 19 | 250 points | 3'55" |
| Children-I | Appendix D | 22 | 290 points | 5'00" |
| Children-II | Appendix E | 18 | 210 points | 4'00" |

### Children's Dressage Scoring (EFI Unique)

Children-I and Children-II use a **combined Technical + Quality** scoring system:

**Quality Marking Components:**
1. Rider's position and seat
2. Effectiveness of aids
3. Precision
4. General impression

**Calculation:**
```
Technical Score = (Raw Score ÷ Max Technical) × 100
Quality Score = (Total Quality Marks ÷ 40) × 100
TOTAL Score = (Technical % + Quality %) ÷ 2
```

### Competition Levels (India/FEI)

| Level | Arena | Key Movements | Qualifying Score |
|-------|-------|---------------|------------------|
| Introductory | 20 × 40 m | Walk, rising trot, 20 m circles | 60%+ |
| Preliminary | 20 × 40 m | Working gaits, free walk | 60%+ |
| Novice | 20 × 40 m | Leg yield, lengthening, 10 m circles | 60%+ |
| Elementary | 20 × 60 m | Shoulder-in, travers, collected gaits | 60%+ |
| Medium | 20 × 60 m | Half-pass, simple changes | 60%+ |
| Advanced | 20 × 60 m | Flying changes, pirouettes | 60%+ |
| Prix St-Georges | 20 × 60 m | Flying changes every 4 strides | 60%+ |
| Intermediate I/II | 20 × 60 m | Piaffe introduction, pirouettes | 60%+ |
| Grand Prix | 20 × 60 m | Piaffe, passage, tempi changes | 65%+ |

### Judge Panel Requirements

| Competition Level | Min Judges | Max Judges | Positions |
|-------------------|------------|------------|-----------|
| National (EFI) | 1 | 3 | C (+ B, E optional) |
| FEI CDI1* | 3 | 3 | C + 2 additional |
| FEI CDI2*/CDI3* | 3 | 5 | C + up to 4 |
| FEI CDI4*/CDI5* | 5 | 5 | C, B, E, H, M |
| Championships | 5 | 7 | C, E, B, K, F, M, H |

---

## Show Jumping Scoring System

### Fault System

| Fault Type | Penalty |
|------------|---------|
| Knockdown (pole falls) | 4 faults |
| First refusal | 4 faults |
| Second refusal | 8 faults (cumulative) |
| Third refusal | **Elimination** |
| Fall of rider | **Elimination** |
| Time fault (per second over) | 1 fault |
| Jump-off time fault | 1 fault per 4 seconds |

### EFI REL Course Specifications (2026)

| Category | Height (Min-Max) | Spread | Speed | Time Allowed | Arena |
|----------|------------------|--------|-------|--------------|-------|
| Children-II | 70-80 cm | 90 cm | 325 m/min | 84 sec | 65×50 m |
| Children-I | 80-90 cm | 105 cm | 325 m/min | 84 sec | 65×50 m |
| Junior | 1.00-1.05 m | 1.25 m | 350 m/min | 78 sec | 65×50 m |
| Young Rider | 1.05-1.15 m | 1.35 m | 350 m/min | 78 sec | 65×50 m |

**Course Details:**
- Obstacles: 11
- Efforts: 12-13
- Combinations: 1-2
- Course Length: 455 m
- Time Limit: 2× Time Allowed

### Competition Format

- **Table A** — Faults accumulated, jump-off for ties (REL standard)
- **Table C** — Time-based, seconds added for faults
- **Two-Phase** — First phase + jump-off combined

### Tiebreaker Rules

1. Fewest total faults
2. Fastest time in jump-off
3. If no jump-off: fastest round time

---

## Tent Pegging Scoring System (EFI/ITPF)

### Scoring Categories

| Action | Points |
|--------|--------|
| Clean peg carry (tent peg) | 10 points |
| Peg hit but not carried | 5 points |
| Ring collection (sword) | 10 points |
| Ring touched/missed | 0-5 points |
| Lemon/melon slice | 10 points |
| Miss | 0 points |

### REL MER Requirements (Seniors Only)

**Lance Events:**
- Two runs on 6 cm peg
- One run on 4 cm peg

**Sword Events:**
- Two runs on 6 cm peg
- One run on 4 cm peg

**Minimum Score:** 24 points (including time penalties)

### Competition Classes

- **Individual Tent Pegging** — Single rider, multiple pegs
- **Team Tent Pegging** — 4 riders, coordinated runs
- **Sword Events** — Ring collection, lemon cutting
- **Lance Events** — Traditional tent peg carry

---

## EFI Regional Zones

India is divided into 6 zones for REL competitions:

| Zone | States/UTs |
|------|------------|
| **North** | J&K, Himachal Pradesh, Punjab, Haryana, Chandigarh, Delhi |
| **East** | West Bengal, Bihar, Jharkhand, Odisha |
| **West** | Maharashtra, Goa, Gujarat, Rajasthan |
| **South** | Tamil Nadu, Kerala, Karnataka, Andhra Pradesh, Telangana, Puducherry |
| **Central** | Uttar Pradesh, Madhya Pradesh, Chhattisgarh, Uttarakhand |
| **North East** | Assam, Manipur, Nagaland, Sikkim, Arunachal Pradesh, Tripura, Meghalaya, Mizoram |

---

## EFI Equipment & Horse Rules

### Bitting Rules (All Categories)

| Category | Permitted Bits |
|----------|---------------|
| Young Rider | Snaffle only |
| Junior | Snaffle only |
| Children-I | Snaffle only |
| Children-II | Snaffle only |

### Horse Restrictions

| Category | Horse Age Minimum | Notes |
|----------|-------------------|-------|
| Young Rider | 7 years | Horses 7+ years only |
| Junior | 6 years | No grade restriction |
| Children-I | 6 years for children, 5 years for adults | - |
| Children-II | 6 years for children, 5 years for adults | - |

### Horse Usage Limits (Per Day)

- One horse can participate once in each category
- Per day limit: **2× Dressage + 1× Jumping** OR **2× Jumping + 1× Dressage**

---

## Eventing Scoring System

### Three-Phase Combined Penalties

```
Total Penalties = Dressage Penalties + XC Penalties + SJ Penalties
Winner = Lowest total penalties
```

### Cross-Country Penalties

| Fault | Penalty |
|-------|---------|
| Refusal (1st) | 20 penalties |
| Refusal (2nd at same fence) | 40 penalties |
| Refusal (3rd) | **Elimination** |
| Fall of rider | **Elimination** |
| Time fault (per second over optimum) | 0.4 penalties |

---

## Phase 1: Foundation & Core Setup

### 1.1 Monorepo Initialization (Turborepo)

- [ ] Initialize Turborepo with `apps/web`, `apps/api`, `packages/db`, `packages/scoring`, `packages/types`
- [ ] Configure TypeScript strict mode across all packages
- [ ] Setup shared ESLint + Prettier config
- [ ] Setup Husky pre-commit hooks

### 1.2 Frontend (Next.js 15)

- [ ] Initialize Next.js 15 with App Router
- [ ] Setup Tailwind CSS + shadcn/ui components
- [ ] Configure TanStack Query (React Query) for server state
- [ ] Configure Zustand for client state
- [ ] Setup Axios client with JWT interceptors

### 1.3 Backend (NestJS)

- [ ] Initialize NestJS project
- [ ] Configure global ValidationPipe (class-validator)
- [ ] Setup Swagger/OpenAPI documentation
- [ ] Implement JWT auth with Passport.js strategies
- [ ] Setup CORS for Next.js frontend
- [ ] Configure rate limiting (Throttler)

### 1.4 Database & ORM Setup

- [ ] Setup Prisma in `packages/db` (shared)
- [ ] Design initial schema
- [ ] Configure PostGIS extension for geospatial queries
- [ ] Setup database migrations workflow
- [ ] Inject PrismaService into NestJS modules

### 1.5 Authentication System

- [ ] NestJS: Phone OTP flow via Twilio Verify
- [ ] NestJS: JWT access + refresh token strategy
- [ ] NestJS: Google OAuth token exchange endpoint
- [ ] Next.js: NextAuth.js v5 with Google provider
- [ ] Next.js: Session → JWT exchange with NestJS
- [ ] Implement RBAC Guards on NestJS controllers
- [ ] Setup Redis session management (Upstash)

---

## Phase 2: Core Features

### 2.1 Event Discovery Module

- [ ] NestJS: `GET /events` endpoint with PostGIS geospatial queries
- [ ] Next.js: Event listing page with SSR (`fetch` from NestJS)
- [ ] Mapbox integration for event locations
- [ ] Advanced filters (discipline, date, location, level)
- [ ] Event detail pages with registration CTA
- [ ] Geospatial search ("events near me")

### 2.2 User Profiles & Onboarding

- [ ] NestJS: Users CRUD endpoints
- [ ] Next.js: Multi-step onboarding flow
- [ ] Profile types: Rider, Organizer, Judge, Stable Owner
- [ ] Horse registration with Cloudinary image upload
- [ ] Profile completion progress tracker

### 2.3 Competition Management (Organizer)

- [ ] NestJS: Events + Competitions CRUD
- [ ] Next.js: Event creation wizard
- [ ] Class/competition setup with discipline selection
- [ ] Test sheet configuration (for dressage)
- [ ] Entry management dashboard
- [ ] Draw generation system
- [ ] Schedule builder with conflict detection

### 2.4 Live Scoring System

- [ ] NestJS: Scoring service with discipline-specific calculation logic
- [ ] NestJS: Score submission endpoints with validation
- [ ] NestJS: Pusher emit on score save (real-time leaderboard)
- [ ] Next.js: Judge scoring interface (tablet-optimized)
- [ ] Discipline-specific scoring forms:
  - Dressage: Movement-by-movement with coefficients
  - Show Jumping: Fault tracking with timer
  - Tent Pegging: Point-based scoring
- [ ] Next.js: Leaderboard with Pusher subscription + TanStack Query polling fallback
- [ ] Redis caching for leaderboard (NestJS)
- [ ] Score validation and error correction

---

## Phase 3: Marketplace & Transactions

### 3.1 Horse Marketplace

- [ ] NestJS: Horses + Marketplace endpoints
- [ ] Next.js: Horse listing creation with media gallery
- [ ] Search with filters (breed, age, discipline, price)
- [ ] Inquiry/contact system
- [ ] Favorite/watchlist functionality

### 3.2 Event Registration & Payments

- [ ] NestJS: `POST /payments/create-order` (Razorpay)
- [ ] NestJS: `POST /payments/verify` (Razorpay webhook)
- [ ] Next.js: Entry cart system (Zustand)
- [ ] Razorpay frontend integration (UPI, cards, net banking)
- [ ] Payment confirmation flow
- [ ] Receipt generation (React PDF)

### 3.3 Stable Finder

- [ ] NestJS: Stables CRUD + geospatial search
- [ ] Next.js: Stable profiles with amenities
- [ ] Map-based stable discovery
- [ ] Booking inquiry system
- [ ] Reviews and ratings

---

## Phase 4: Results & Certificates

### 4.1 Results Publication

- [ ] NestJS: Automated result calculation per discipline
- [ ] NestJS: Tiebreaker logic (collective marks for dressage)
- [ ] Next.js: Public results pages (SSR for SEO)
- [ ] Historical results archive
- [ ] Performance analytics for riders

### 4.2 Digital Certificates

- [ ] NestJS: Certificate generation trigger endpoint
- [ ] Next.js: Certificate template system (EFI/FEI compliant)
- [ ] PDF generation with React PDF
- [ ] QR code verification
- [ ] NestJS: Certificate delivery via Resend

---

## Phase 5: Notifications & Communication

### 5.1 Push Notifications (FCM)

- [ ] NestJS: FCM service for push notification dispatch
- [ ] Draw publication alerts
- [ ] Schedule change notifications
- [ ] Result announcements
- [ ] Entry deadline reminders

### 5.2 Transactional Emails (Resend)

- [ ] NestJS: Email service via Resend
- [ ] Registration confirmation
- [ ] Entry receipt
- [ ] Certificate delivery
- [ ] Weekly stable reports

### 5.3 WhatsApp Integration

- [ ] wa.me deep links for organizer contact
- [ ] Share event/result links

---

## Phase 6: Advanced Features (Future)

### 6.1 KYC Integration

- [ ] Digilocker API for Aadhaar verification
- [ ] Seller verification badge system

### 6.2 Escrow Payments

- [ ] Razorpay Route for split payments
- [ ] High-value transaction protection

### 6.3 Analytics Dashboard

- [ ] Organizer revenue reports
- [ ] Rider performance trends
- [ ] Platform usage metrics

---

## Database Schema (Core Entities)

```prisma
// Enums
enum Role {
  RIDER
  ORGANIZER
  JUDGE
  STABLE_OWNER
  ADMIN
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

enum Discipline {
  DRESSAGE
  SHOW_JUMPING
  EVENTING
  TENT_PEGGING
}

enum ArenaSize {
  SMALL_20x40
  STANDARD_20x60
}

enum CompetitionLevel {
  INTRODUCTORY
  PRELIMINARY
  NOVICE
  ELEMENTARY
  MEDIUM
  ADVANCED
  PRIX_ST_GEORGES
  INTERMEDIATE_I
  INTERMEDIATE_II
  GRAND_PRIX
}

enum AgeCategory {
  CHILDREN_II    // 10-12 years
  CHILDREN_I     // 12-14 years
  JUNIOR         // 14-18 years
  YOUNG_RIDER    // 16-21 years
  SENIOR         // 18+ (Tent Pegging only)
}

enum RegionalZone {
  NORTH
  EAST
  WEST
  SOUTH
  CENTRAL
  NORTH_EAST
}

// Models
model User {
  id            String        @id @default(cuid())
  phone         String        @unique
  email         String?       @unique
  name          String
  role          Role          @default(RIDER)
  avatarUrl     String?
  dateOfBirth   DateTime?
  efiLicenseNo  String?
  feiId         String?
  regionalZone  RegionalZone?
  horses        Horse[]
  entries       Entry[]
  stables       Stable[]
  judgeScores   Score[]       @relation("JudgeScores")
  merRecords    MerRecord[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model MerRecord {
  id            String       @id @default(cuid())
  userId        String
  user          User         @relation(fields: [userId], references: [id])
  discipline    Discipline
  ageCategory   AgeCategory
  competitionId String
  horseId       String
  venue         String
  score         Float
  achievedMer   Boolean      @default(false)
  merDate       DateTime
  createdAt     DateTime     @default(now())
}

model Horse {
  id            String    @id @default(cuid())
  name          String
  breed         String
  age           Int
  discipline    Discipline[]
  passportNo    String?
  ownerId       String
  owner         User      @relation(fields: [ownerId], references: [id])
  mediaUrls     String[]
  entries       Entry[]
  forSale       Boolean   @default(false)
  price         Int?
  createdAt     DateTime  @default(now())
}

model Event {
  id            String    @id @default(cuid())
  name          String
  description   String
  startDate     DateTime
  endDate       DateTime
  location      Json      // PostGIS point
  venue         String
  organizerId   String
  discipline    Discipline
  competitions  Competition[]
  isPublished   Boolean   @default(false)
  efiSanctioned Boolean   @default(false)
  feiSanctioned Boolean   @default(false)
  createdAt     DateTime  @default(now())
}

model Competition {
  id            String          @id @default(cuid())
  name          String
  eventId       String
  event         Event           @relation(fields: [eventId], references: [id])
  discipline    Discipline
  level         CompetitionLevel
  arenaSize     ArenaSize?
  testSheetId   String?
  testSheet     TestSheet?      @relation(fields: [testSheetId], references: [id])
  entries       Entry[]
  scores        Score[]
  draw          Json?
  maxJudges     Int             @default(1)
  startTime     DateTime?
  status        String          @default("PENDING")
}

model TestSheet {
  id            String       @id @default(cuid())
  name          String
  discipline    Discipline
  level         CompetitionLevel
  arenaSize     ArenaSize
  movements     Json
  collectiveMarks Json
  maxScore      Int
  competitions  Competition[]
  createdAt     DateTime     @default(now())
}

model Entry {
  id            String        @id @default(cuid())
  userId        String
  user          User          @relation(fields: [userId], references: [id])
  horseId       String
  horse         Horse         @relation(fields: [horseId], references: [id])
  competitionId String
  competition   Competition   @relation(fields: [competitionId], references: [id])
  paymentStatus PaymentStatus @default(PENDING)
  drawNumber    Int?
  scores        Score[]
  status        String        @default("ENTERED")
  createdAt     DateTime      @default(now())
}

model Score {
  id              String      @id @default(cuid())
  entryId         String
  entry           Entry       @relation(fields: [entryId], references: [id])
  competitionId   String
  competition     Competition @relation(fields: [competitionId], references: [id])
  judgeId         String
  judge           User        @relation("JudgeScores", fields: [judgeId], references: [id])
  judgePosition   String?

  // Dressage
  movementMarks   Json?
  collectiveMarks Json?
  qualityMarks    Json?
  technicalScore  Float?
  qualityScore    Float?

  errorCount      Int         @default(0)
  errorDeductions Float       @default(0)

  // Show Jumping
  faults          Int?
  timeFaults      Float?
  jumpOffFaults   Int?
  jumpOffTime     Float?
  roundTime       Float?

  // Tent Pegging
  pegPoints       Int?
  lanceRuns       Json?
  swordRuns       Json?

  rawScore        Float
  percentage      Float?
  penalties       Float?
  finalScore      Float

  isEliminated    Boolean     @default(false)
  eliminationReason String?
  achievedMer     Boolean     @default(false)

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model Stable {
  id            String    @id @default(cuid())
  name          String
  ownerId       String
  owner         User      @relation(fields: [ownerId], references: [id])
  location      Json
  amenities     String[]
  capacity      Int
  pricePerMonth Int
  mediaUrls     String[]
}
```

---

## Scoring System Functional Requirements

### Core Scoring Engine (Dressage) — NestJS ScoringService

- **FR-01:** Accept movement marks in 0.5 increments (0.0–10.0)
- **FR-02:** Apply coefficient multipliers (×1 or ×2) per movement
- **FR-03:** Calculate judge percentage to 2 decimal places
- **FR-04:** Calculate average across all judges to 2 decimal places
- **FR-05:** Convert to eventing penalties (1 decimal place)
- **FR-06:** Auto-apply EFI error deductions (−0.5% first, −1.0% second)
- **FR-07:** Flag elimination on third error

### Arena & Test Configuration

- **FR-08:** Support both 20×40m and 20×60m arenas
- **FR-09:** Allow 1-7 simultaneous judges
- **FR-10:** Configurable collective mark coefficients
- **FR-11:** Support FEI and EFI test sheet imports

### Results & Reporting

- **FR-12:** Per-judge, per-competitor score sheets
- **FR-13:** Rank by percentage (dressage) or penalties (eventing)
- **FR-14:** Auto-apply tiebreakers (collective marks)
- **FR-15:** Real-time leaderboard updates via Pusher (emitted by NestJS)

---

## Environment Variables

```env
# --- Frontend (apps/web) ---
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
NEXT_PUBLIC_MAPBOX_TOKEN="..."
NEXT_PUBLIC_PUSHER_KEY="..."
NEXT_PUBLIC_PUSHER_CLUSTER="ap2"
NEXT_PUBLIC_RAZORPAY_KEY_ID="..."

NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# --- Backend (apps/api) ---
PORT=3001
FRONTEND_URL="http://localhost:3000"

DATABASE_URL="postgresql://..."
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_VERIFY_SERVICE_SID="..."

UPSTASH_REDIS_URL="..."
UPSTASH_REDIS_TOKEN="..."

PUSHER_APP_ID="..."
PUSHER_KEY="..."
PUSHER_SECRET="..."
PUSHER_CLUSTER="ap2"

RAZORPAY_KEY_ID="..."
RAZORPAY_KEY_SECRET="..."

CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

RESEND_API_KEY="..."
FCM_SERVICE_ACCOUNT_JSON="..."
```

---

## Development Milestones

| Milestone | Deliverables |
|-----------|-------------|
| M1 | Monorepo setup, NestJS bootstrap, Next.js setup, shared DB schema |
| M2 | Auth system (OTP + JWT + Google OAuth, NestJS ↔ Next.js) |
| M3 | Event discovery (NestJS API + Next.js SSR), user profiles |
| M4 | Competition management, test sheet config |
| M5 | Live scoring system (NestJS service + Next.js judge UI + Pusher) |
| M6 | Payments (Razorpay), entry registration |
| M7 | Results, certificates |
| M8 | Notifications (FCM + Resend) |
| M9 | Marketplace features |
| M10 | Testing, optimization, launch prep |

---

## Key Technical Decisions

1. **Next.js 15 (frontend only)** — SSR for SEO-critical pages (events, results), CSR for interactive scoring UI
2. **NestJS (backend)** — Modular REST API with built-in dependency injection, guards, and pipes; Swagger docs auto-generated
3. **REST over tRPC** — Better interoperability; NestJS + Swagger provides typed contracts; TanStack Query handles caching on the frontend
4. **Shared `packages/scoring`** — Scoring calculation logic lives in a shared package, consumed by NestJS services
5. **Neon PostgreSQL** — Serverless Postgres scales with deployment platform
6. **Upstash Redis** — Serverless Redis for leaderboard caching and session management
7. **Pusher for Realtime** — Managed WebSocket for live scoring; emitted server-side by NestJS
8. **Cloudinary for Media** — Optimized image delivery with transformations
9. **FEI/EFI Compliant** — Scoring systems follow official rulebooks

---

## Success Metrics

- Event discovery page load < 1.5s (LCP)
- Live score update latency < 500ms
- Payment success rate > 98%
- Scoring accuracy: 100% compliance with FEI/EFI rules
- SEO: Event pages indexed within 48 hours
- API response time (p95) < 200ms

---

*Generated for Horsey v1.0 — Indian Equestrian Platform*