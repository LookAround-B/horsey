import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { SlaModule } from '../sla/sla.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [SlaModule, NotificationsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
