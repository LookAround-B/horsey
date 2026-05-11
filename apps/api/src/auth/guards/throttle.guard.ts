import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Custom throttler guard that uses IP-based rate limiting.
 * Applied globally and can be overridden per-endpoint with @Throttle().
 */
@Injectable()
export class CustomThrottleGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const request = req as { ip?: string; headers?: Record<string, string | string[] | undefined> };
    // Use X-Forwarded-For if available, otherwise req.ip
    const forwarded = request.headers?.['x-forwarded-for'];
    if (forwarded) {
      const forwardedStr = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      if (forwardedStr) {
        return forwardedStr.split(',')[0]?.trim() || request.ip || 'unknown';
      }
    }
    return request.ip || 'unknown';
  }
}
