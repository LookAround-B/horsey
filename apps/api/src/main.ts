import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters';
import { TransformInterceptor, LoggingInterceptor } from './common/interceptors';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';

// ─── Startup Security Validation ─────────────────────────────────────────────

function validateStartupSecurity(): void {
  const logger = new Logger('StartupValidator');
  const errors: string[] = [];

  const nodeEnv = process.env.NODE_ENV || '';
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    errors.push(`NODE_ENV must be one of: development, test, production. Got: "${nodeEnv}"`);
  }

  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is not set');
  }

  const isProduction = nodeEnv === 'production';

  // In production, enforce strict secret requirements
  if (isProduction) {
    const accessSecret = process.env.JWT_ACCESS_SECRET || '';
    if (accessSecret.length < 64) {
      errors.push(`JWT_ACCESS_SECRET must be at least 64 characters. Got: ${accessSecret.length}`);
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || '';
    if (refreshSecret.length < 64) {
      errors.push(`JWT_REFRESH_SECRET must be at least 64 characters. Got: ${refreshSecret.length}`);
    }

    if (accessSecret && refreshSecret && accessSecret === refreshSecret) {
      errors.push('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different');
    }

    const encryptionKey = process.env.ENCRYPTION_KEY || '';
    if (encryptionKey.length !== 64) {
      errors.push(`ENCRYPTION_KEY must be exactly 64 hex chars (32 bytes). Got: ${encryptionKey.length}`);
    }

    const sessionSecret = process.env.SESSION_SECRET || '';
    if (sessionSecret.length < 64) {
      errors.push(`SESSION_SECRET must be at least 64 characters. Got: ${sessionSecret.length}`);
    }

    const allowedOrigins = process.env.ALLOWED_ORIGINS || '';
    if (!allowedOrigins || allowedOrigins === '*') {
      errors.push('ALLOWED_ORIGINS must be set and cannot be "*" in production');
    }
  }

  if (errors.length > 0) {
    for (const error of errors) {
      logger.error(`🔴 SECURITY ERROR: ${error}`);
    }
    if (isProduction) {
      logger.error('🔴 Server will not start due to security configuration errors.');
      process.exit(1);
    } else {
      logger.warn('⚠️  Security warnings detected — acceptable in development mode.');
    }
  }
}

async function bootstrap() {
  // Validate security before anything else
  validateStartupSecurity();

  const app = await NestFactory.create(AppModule);

  // ─── Helmet (Security Headers) ───────────────────────────────────────────
  let helmet: typeof import('helmet');
  try {
    helmet = require('helmet');
    app.use(
      helmet.default({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        },
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: { policy: 'same-origin' as const },
        crossOriginResourcePolicy: { policy: 'same-origin' as const },
        dnsPrefetchControl: { allow: false },
        frameguard: { action: 'deny' as const },
        hidePoweredBy: true,
        hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
        ieNoOpen: true,
        noSniff: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' as const },
        xssFilter: true,
      }),
    );
  } catch {
    Logger.warn('helmet not available, skipping security headers', 'Bootstrap');
  }

  // ─── Cookie Parser ────────────────────────────────────────────────────────
  try {
    app.use(cookieParser());
  } catch {
    const cp = require('cookie-parser');
    app.use(cp());
  }

  // ─── Body Size Limits ─────────────────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // ─── CORS — strict allowlist ──────────────────────────────────────────────
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
    credentials: true,
    maxAge: 86400,
  });

  // ─── Global Prefix ────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── Global Pipes ─────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      disableErrorMessages: process.env.NODE_ENV === 'production',
      stopAtFirstError: false,
    }),
  );

  // ─── Global Filters & Interceptors ────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor(), new LoggingInterceptor());

  // ─── Disable X-Powered-By ─────────────────────────────────────────────────
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  // ─── Shutdown Hooks ───────────────────────────────────────────────────────
  app.enableShutdownHooks();

  // ─── Swagger / OpenAPI ────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Horsey Marketplace API')
      .setDescription('Horse Marketplace — buy horses, feed, tack, and equestrian supplies')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Auth', 'Authentication — email/password + Google OAuth + Phone OTP + MFA')
      .addTag('Users', 'User profiles and addresses')
      .addTag('Vendors', 'Vendor onboarding, KYC, and admin approval')
      .addTag('Products', 'Product catalog, search, and reviews')
      .addTag('Orders', 'Cart, checkout, 24-hour SLA, and fulfillment')
      .addTag('Notifications', 'In-app notification inbox')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  Logger.log(`🐴 Horsey Marketplace API running on http://localhost:${port}`, 'Bootstrap');
  if (process.env.NODE_ENV !== 'production') {
    Logger.log(`📚 Swagger docs: http://localhost:${port}/docs`, 'Bootstrap');
  }
}

bootstrap();
