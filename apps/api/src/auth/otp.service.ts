import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly isDev: boolean;

  constructor(private readonly configService: ConfigService) {
    const twilioSid = this.configService.get<string>('TWILIO_ACCOUNT_SID', '...');
    this.isDev = !twilioSid || twilioSid === '...';
  }

  /**
   * Send OTP via Twilio Verify. In dev mode, logs and accepts 123456.
   */
  async sendOtp(phone: string): Promise<void> {
    if (this.isDev) {
      this.logger.warn(`[DEV] OTP requested for ${phone} — use code 123456`);
      return;
    }

    try {
      const twilio = require('twilio')(
        this.configService.get<string>('TWILIO_ACCOUNT_SID'),
        this.configService.get<string>('TWILIO_AUTH_TOKEN'),
      );

      await twilio.verify.v2
        .services(this.configService.get<string>('TWILIO_VERIFY_SERVICE_SID'))
        .verifications.create({ to: phone, channel: 'sms' });
    } catch (error) {
      this.logger.error(`Failed to send OTP: ${error}`);
      throw new BadRequestException('Failed to send OTP. Please try again.');
    }
  }

  /**
   * Verify OTP via Twilio Verify. Returns true if valid.
   * In dev mode, accepts 123456.
   */
  async verifyOtp(phone: string, code: string): Promise<boolean> {
    if (this.isDev) {
      return code === '123456';
    }

    try {
      const twilio = require('twilio')(
        this.configService.get<string>('TWILIO_ACCOUNT_SID'),
        this.configService.get<string>('TWILIO_AUTH_TOKEN'),
      );

      const verification = await twilio.verify.v2
        .services(this.configService.get<string>('TWILIO_VERIFY_SERVICE_SID'))
        .verificationChecks.create({ to: phone, code });

      return verification.status === 'approved';
    } catch (error) {
      this.logger.error(`OTP verification failed: ${error}`);
      return false;
    }
  }
}
