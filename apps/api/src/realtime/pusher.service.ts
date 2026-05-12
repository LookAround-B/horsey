import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PusherService {
  private readonly logger = new Logger(PusherService.name);
  private pusher: any;

  constructor(private configService: ConfigService) {
    const appId = this.configService.get('PUSHER_APP_ID');

    if (appId && appId !== '...') {
      const Pusher = require('pusher');
      this.pusher = new Pusher({
        appId,
        key: this.configService.get('PUSHER_KEY'),
        secret: this.configService.get('PUSHER_SECRET'),
        cluster: this.configService.get('PUSHER_CLUSTER', 'ap2'),
        useTLS: true,
      });
    }
  }

  async trigger(channel: string, event: string, data: any) {
    if (this.pusher) {
      await this.pusher.trigger(channel, event, data);
      this.logger.log(`Pusher: ${channel}/${event}`);
    } else {
      this.logger.warn(`[DEV] Pusher event: ${channel}/${event} ${JSON.stringify(data)}`);
    }
  }

  async emitOrderUpdate(subOrderId: string, status: string, extra?: any) {
    await this.trigger(`order-${subOrderId}`, 'status-update', { status, ...extra });
  }

  async emitNewOrder(vendorId: string, subOrderId: string) {
    await this.trigger(`vendor-${vendorId}`, 'new-order', { subOrderId });
  }

  async emitNotification(userId: string, notification: any) {
    await this.trigger(`user-${userId}`, 'notification', notification);
  }
}
