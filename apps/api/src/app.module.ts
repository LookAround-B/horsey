import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

// Core modules
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { CompetitionsModule } from './competitions/competitions.module';
import { ScoringModule } from './scoring/scoring.module';
import { HorsesModule } from './horses/horses.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { PaymentsModule } from './payments/payments.module';
import { StablesModule } from './stables/stables.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RealtimeModule } from './realtime/realtime.module';

// Root
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
