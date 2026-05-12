import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Apple OAuth strategy placeholder.
 * Only activates if APPLE_CLIENT_ID is properly configured.
 * If not configured, this is a no-op injectable that prevents startup crashes.
 */
@Injectable()
export class AppleStrategy {
  private readonly logger = new Logger(AppleStrategy.name);

  constructor(configService: ConfigService) {
    const clientId = configService.get<string>('APPLE_CLIENT_ID', '');
    if (!clientId || clientId === '...') {
      this.logger.warn('⚠️  Apple OAuth not configured — skipping strategy registration');
    }
  }
}
