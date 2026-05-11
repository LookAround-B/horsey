import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthEvent } from 'database';
import * as net from 'net';

interface AuditLogParams {
  userId?: string | null;
  event: AuthEvent;
  ipAddress: string;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
  success: boolean;
  failureReason?: string | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log an auth event asynchronously. Never blocks the response.
   * Never logs passwords, tokens, secrets, or PII beyond userId and masked email.
   */
  log(params: AuditLogParams): void {
    // Fire and forget — do not await
    this.writeLog(params).catch((err) => {
      this.logger.error(`Failed to write audit log: ${err}`);
    });
  }

  private async writeLog(params: AuditLogParams): Promise<void> {
    const sanitizedIp = this.validateAndExtractIp(params.ipAddress);
    const truncatedUserAgent = params.userAgent
      ? params.userAgent.substring(0, 512)
      : null;

    // Sanitize metadata — never include passwords/tokens
    const safeMetadata = params.metadata
      ? this.sanitizeMetadata(params.metadata)
      : null;

    await this.prisma.authAuditLog.create({
      data: {
        userId: params.userId ?? undefined,
        event: params.event,
        ipAddress: sanitizedIp,
        userAgent: truncatedUserAgent,
        metadata: safeMetadata as any,
        success: params.success,
        failureReason: params.failureReason ?? null,
      },
    });
  }

  /**
   * Extract and validate IP address.
   * Trust X-Forwarded-For only if behind known proxy.
   * Take the FIRST IP (client IP) from X-Forwarded-For.
   * Validate IP format before storing.
   */
  extractIpFromRequest(req: {
    headers: Record<string, string | string[] | undefined>;
    ip?: string;
    socket?: { remoteAddress?: string };
  }): string {
    // Try X-Forwarded-For first
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const forwardedStr = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      if (forwardedStr) {
        // Take the first (client) IP
        const firstIp = forwardedStr.split(',')[0]?.trim();
        if (firstIp && this.isValidIp(firstIp)) {
          return firstIp;
        }
      }
    }

    // Fall back to req.ip
    if (req.ip && this.isValidIp(req.ip)) {
      return req.ip;
    }

    // Fall back to socket address
    const socketAddr = req.socket?.remoteAddress;
    if (socketAddr && this.isValidIp(socketAddr)) {
      return socketAddr;
    }

    return '0.0.0.0';
  }

  /**
   * Mask email for audit logs: "jo***@gmail.com"
   */
  maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***@***';
    const masked = local.length > 2
      ? local.substring(0, 2) + '***'
      : local.substring(0, 1) + '***';
    return `${masked}@${domain}`;
  }

  private validateAndExtractIp(ip: string): string {
    if (this.isValidIp(ip)) return ip;
    // Try extracting from IPv6-mapped IPv4
    if (ip.startsWith('::ffff:')) {
      const v4 = ip.substring(7);
      if (this.isValidIp(v4)) return v4;
    }
    return '0.0.0.0';
  }

  private isValidIp(ip: string): boolean {
    return net.isIPv4(ip) || net.isIPv6(ip);
  }

  private sanitizeMetadata(
    metadata: Record<string, unknown>,
  ): Record<string, unknown> {
    const sensitiveKeys = [
      'password', 'passwordHash', 'token', 'tokenHash', 'secret',
      'mfaSecret', 'refreshToken', 'accessToken', 'otp', 'code',
      'authorization', 'cookie',
    ];
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}
