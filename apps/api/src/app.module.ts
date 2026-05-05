import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

// Core
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RealtimeModule } from './realtime/realtime.module';
import { MediaModule } from './media/media.module';

// Marketplace
import { VendorModule } from './vendor/vendor.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
// import { SlaModule } from './sla/sla.module'; // Disabled: pg-boss queues not initialized in dev

// App
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    NotificationsModule,
    RealtimeModule,
    MediaModule,
    VendorModule,
    ProductsModule,
    OrdersModule,
    // SlaModule, // Disabled: pg-boss queues not initialized in dev
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
