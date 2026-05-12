import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * AES-256-GCM encryption service for encrypting sensitive data at rest
 * (e.g., MFA TOTP secrets).
 *
 * Storage format: base64(iv[16] + authTag[16] + ciphertext)
 */
@Injectable()
export class EncryptionService implements OnModuleInit {
  private readonly logger = new Logger(EncryptionService.name);
  private key: Buffer = Buffer.alloc(0);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const hexKey = this.configService.get<string>('ENCRYPTION_KEY', '');

    if (!hexKey || hexKey === '...' || hexKey.length !== 64) {
      // In development mode, allow a fallback
      const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
      if (nodeEnv === 'production') {
        this.logger.error(
          '🔴 SECURITY ERROR: ENCRYPTION_KEY must be exactly 64 hex chars (32 bytes). Server will not start.',
        );
        process.exit(1);
      }
      // Dev fallback - deterministic key for development
      this.key = crypto.scryptSync('dev-encryption-key', 'salt', 32);
      this.logger.warn('⚠️  Using development fallback encryption key — NOT SAFE FOR PRODUCTION');
      return;
    }

    this.key = Buffer.from(hexKey, 'hex');
    if (this.key.length !== 32) {
      this.logger.error(
        '🔴 SECURITY ERROR: ENCRYPTION_KEY decoded to wrong length. Expected 32 bytes.',
      );
      process.exit(1);
    }
  }

  /**
   * Encrypt plaintext using AES-256-GCM.
   * Returns: base64(iv[16] + authTag[16] + ciphertext)
   */
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    // Pack: iv (16) + authTag (16) + ciphertext
    const packed = Buffer.concat([iv, authTag, encrypted]);
    return packed.toString('base64');
  }

  /**
   * Decrypt a value previously encrypted with encrypt().
   * Throws on any failure — never returns partial data.
   */
  decrypt(stored: string): string {
    const packed = Buffer.from(stored, 'base64');

    if (packed.length < 33) {
      throw new Error('Invalid encrypted data: too short');
    }

    const iv = packed.subarray(0, 16);
    const authTag = packed.subarray(16, 32);
    const ciphertext = packed.subarray(32);

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(authTag);

    try {
      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);
      return decrypted.toString('utf8');
    } catch {
      this.logger.error('Decryption failed — possible key mismatch or data corruption');
      throw new Error('Decryption failed');
    }
  }
}
