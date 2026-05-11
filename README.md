# 🐴 Horsey — India's Premier Equestrian Marketplace

A full-stack marketplace platform for horses, feed, tack, and equestrian supplies with vendor management, secure payments, and real-time notifications.

## ✨ Features

### 🛒 Multi-Vendor Marketplace
- Product catalog with categories, search, and filters
- Shopping cart with multi-vendor support
- Secure checkout with payment gateway integration
- Order tracking with 24-hour SLA enforcement
- Product reviews and ratings

### 👥 User Management
- Email/Password authentication
- Google OAuth integration
- Phone OTP verification (Twilio)
- Multi-factor authentication (TOTP)
- Role-based access control (Admin, Vendor, Buyer)
- Session management with JWT refresh token rotation

### 🏪 Vendor Platform
- Vendor onboarding with KYC verification
- Product listing management
- Order fulfillment dashboard
- Analytics and payout tracking
- Admin approval workflow

### 🔒 Security
- Helmet security headers
- Rate limiting and throttling
- CORS with strict allowlist
- Input validation and sanitization
- Encrypted MFA secrets at rest
- Audit logging for sensitive operations

### 📱 Real-time Features
- Live notifications (Pusher)
- Order status updates
- Vendor response tracking

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js | 16.2.4 |
| | React | 19.2.5 |
| | TanStack Query | 5.x |
| | Zustand | State Management |
| | shadcn/ui | Component Library |
| | Tailwind CSS | Styling |
| **Backend** | NestJS | 11.1.19 |
| | Prisma ORM | 5.22.0 |
| | PostgreSQL | 15+ |
| | Passport JWT | Authentication |
| | Redis (optional) | Caching |
| **Auth** | JWT | Access/Refresh Tokens |
| | Google OAuth | Social Login |
| | Twilio | Phone Verification |
| | TOTP | Multi-Factor Auth |
| **Payments** | Razorpay | Payment Gateway |
| **Media** | AWS S3 | File Storage |
| **Notifications** | Pusher | Real-time Updates |
| **Email** | Resend | Transactional Emails |
| **Deployment** | PM2 | Process Manager |
| | Docker | Containerization |

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.0.0
- **pnpm** = 10.33.4
- **PostgreSQL** ≥ 15
- **Redis** (optional, for caching)

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/yourusername/horsey.git
cd horsey

# Install dependencies
pnpm install
```

### 2. Environment Setup

#### API Environment (`apps/api/.env`)

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/horsey"

# JWT Secrets (generate secure random strings)
JWT_ACCESS_SECRET=your-64-char-secret-here
JWT_REFRESH_SECRET=your-different-64-char-secret-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encryption (for MFA secrets)
ENCRYPTION_KEY=your-64-hex-char-key-here

# Security
SESSION_SECRET=your-64-char-session-secret
BCRYPT_ROUNDS=12

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Twilio (Phone OTP)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_VERIFY_SERVICE_SID=...

# Razorpay
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

# Pusher
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=ap2

# AWS S3
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...

# Resend (Email)
RESEND_API_KEY=...

# App Config
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:3001/api/v1
```

#### Web Environment (`apps/web/.env`)

```bash
# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# NextAuth (legacy)
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (same as API)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create **OAuth 2.0 Client ID** (Web application)
3. Add **Authorized JavaScript origins:**
   - `http://localhost:3000`
   - `http://localhost:3001`
4. Add **Authorized redirect URIs:**
   - `http://localhost:3001/api/v1/auth/google/callback`
5. Copy credentials to both `.env` files

### 4. Database Setup

```bash
# Generate Prisma client
pnpm --filter=database exec prisma generate

# Push schema to database
pnpm --filter=database exec prisma db push

# Seed demo data
pnpm --filter=database exec prisma db seed
```

### 5. Build Packages

```bash
# Build shared packages
pnpm --filter=database build
pnpm --filter=shared build
```

### 6. Start Development

```bash
# Start all services in parallel
pnpm dev

# Or start individually:
# API (port 3001)
pnpm dev:api

# Web (port 3000)
pnpm dev:web
```

Open http://localhost:3000

### 7. Test Accounts

After seeding, you can use:

- **Admin Email:** admin@horsey.com
- **Password:** admin123

## 📁 Project Structure

```
horsey/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/          # Authentication & authorization
│   │   │   ├── users/         # User management
│   │   │   ├── vendors/       # Vendor onboarding & KYC
│   │   │   ├── products/      # Product catalog & reviews
│   │   │   ├── orders/        # Cart, checkout, fulfillment
│   │   │   ├── notifications/ # Real-time notifications
│   │   │   ├── media/         # File uploads (S3)
│   │   │   └── admin/         # Admin dashboard
│   │   ├── .env
│   │   └── Dockerfile
│   └── web/                    # Next.js frontend
│       ├── src/
│       │   ├── app/           # App router pages
│       │   ├── components/    # Reusable components
│       │   ├── lib/           # Utilities & API client
│       │   └── stores/        # Zustand stores
│       └── .env
├── packages/
│   ├── database/              # Prisma schema
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # Database schema
│   │   │   └── seed.ts        # Demo data
│   │   └── src/
│   └── shared/                # Shared utilities
│       └── src/
│           ├── constants/     # Enums & constants
│           └── types/         # TypeScript types
├── docker-compose.yml         # Local development services
├── package.json               # Root workspace config
├── pnpm-workspace.yaml        # pnpm workspace
└── turbo.json                 # Turborepo config
```

## 🔧 Development Commands

```bash
# Install dependencies
pnpm install

# Run development servers
pnpm dev

# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Database commands
pnpm --filter=database exec prisma generate
pnpm --filter=database exec prisma db push
pnpm --filter=database exec prisma migrate dev
pnpm --filter=database exec prisma studio  # GUI for database

# Type checking
pnpm --filter=api tsc --noEmit
pnpm --filter=web tsc --noEmit
```

## 🚢 Production Deployment

### Using PM2

1. **Build the application:**
   ```bash
   pnpm install --frozen-lockfile
   pnpm --filter=database build
   pnpm --filter=shared build
   pnpm --filter=api build
   ```

2. **Run migrations:**
   ```bash
   pnpm --filter=database exec prisma migrate deploy
   ```

3. **Start with PM2:**
   ```bash
   pm2 start apps/api/dist/main.js \
     --name horsey-api \
     --env production \
     --max-memory-restart 512M

   pm2 save
   pm2 startup
   ```

### Using Docker

```bash
# Build and run services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Environment Variables for Production

Update `.env` files with production values:
- Change `NODE_ENV` to `production`
- Use strong secrets (64+ characters)
- Update `ALLOWED_ORIGINS` with your domain
- Configure SSL certificates
- Set production database URL
- Enable Twilio, Razorpay, AWS S3 in production mode

## 🔐 Security Checklist

- [x] JWT access tokens (15min expiry)
- [x] Refresh token rotation
- [x] Password hashing (bcrypt, 12 rounds)
- [x] MFA encryption at rest
- [x] CORS strict allowlist
- [x] Rate limiting (express-rate-limit)
- [x] Input validation (class-validator)
- [x] Helmet security headers
- [x] SQL injection protection (Prisma)
- [x] XSS protection
- [x] CSRF protection (SameSite cookies)
- [x] Audit logging

## 📊 API Documentation

When running in development mode, API documentation is available at:
- **Swagger UI:** http://localhost:3001/docs

## 🧪 Testing

```bash
# Run tests (when implemented)
pnpm test

# Run E2E tests
pnpm test:e2e
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Reset database
pnpm --filter=database exec prisma migrate reset
```

### Port Already in Use
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in .env
PORT=3002
```

### Build Errors After Dependency Updates
```bash
# Clear node_modules and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install

# Rebuild
pnpm build
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linter and type checks
4. Submit a pull request

## 📝 License

Private — All rights reserved

## 🙋 Support

For issues or questions, contact the development team.

---

**Built with ❤️ for the equestrian community**
