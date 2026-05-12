import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

// 100 most common passwords — hardcoded for O(1) lookup
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', '1234', 'qwerty', '12345', 'dragon', 'pussy',
  'baseball', 'football', 'letmein', 'monkey', '696969', 'abc123', 'mustang',
  'michael', 'shadow', 'master', 'jennifer', '111111', '2000', 'jordan', 'superman',
  'harley', '1234567', 'fuckme', 'hunter', 'fuckyou', 'trustno1', 'ranger',
  'buster', 'thomas', 'tigger', 'robert', 'soccer', 'fuck', 'batman', 'test',
  'pass', 'killer', 'hockey', 'george', 'charlie', 'andrew', 'michelle', 'love',
  'sunshine', 'jessica', 'asshole', '6969', 'pepper', 'daniel', 'access',
  '123456789', '654321', 'joshua', 'maggie', 'starwars', 'silver', 'william',
  'dallas', 'yankees', '123123', 'ashley', '666666', 'hello', 'amanda', 'orange',
  'biteme', 'freedom', 'computer', 'sexy', 'thunder', 'nicole', 'ginger',
  'heather', 'hammer', 'summer', 'corvette', 'taylor', 'fucker', 'austin',
  'merlin', 'matthew', '121212', 'golfer', 'cheese', 'princess', 'martin',
  'chelsea', 'patrick', 'richard', 'diamond', 'yellow', 'bigdog', 'secret',
  'asdfgh', 'sparky', 'cowboy', 'camaro', 'matrix', 'falcon', 'iloveyou',
  'guitar', 'purple', 'scooter', 'phoenix', 'aaaaaa', 'tigers', 'porsche',
  '1qaz2wsx', 'password1', 'password123', 'qwerty123', 'letmein1', 'welcome',
]);

interface PasswordContext {
  email?: string | null;
  name?: string | null;
  phone?: string | null;
}

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);
  private readonly bcryptRounds: number;

  constructor(private readonly configService: ConfigService) {
    this.bcryptRounds = parseInt(
      this.configService.get<string>('BCRYPT_ROUNDS', '12'),
      10,
    );
  }

  /**
   * Hash a password with bcrypt. Never logs the password.
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.bcryptRounds);
  }

  /**
   * Constant-time password comparison using bcrypt.compare.
   * Never use === on hashes.
   */
  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Perform a dummy bcrypt compare to normalize timing when user is not found.
   * This prevents timing attacks that reveal whether an email exists.
   */
  async dummyCompare(): Promise<void> {
    const dummyHash = '$2b$12$LJ3m4ys3Lg2V3tMN7g4yxuQzPvMHsXLMZgEByB9F1v5KJN5O8sLZC';
    await bcrypt.compare('dummy-password-for-timing', dummyHash);
  }

  /**
   * Validate password strength. Throws BadRequestException with details if weak.
   * Rules:
   * - Minimum 10 characters
   * - At least 1 uppercase, 1 lowercase, 1 digit, 1 special character
   * - Not matching user's email, name, or phone
   * - Not in top 100 common passwords
   * - zxcvbn score >= 3
   */
  validateStrength(password: string, context: PasswordContext = {}): void {
    const errors: string[] = [];

    if (password.length < 10) {
      errors.push('Password must be at least 10 characters long');
    }
    if (password.length > 128) {
      errors.push('Password must not exceed 128 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one digit');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check against user context
    const lowerPassword = password.toLowerCase();
    if (context.email) {
      const emailLocal = context.email.toLowerCase().split('@')[0];
      if (emailLocal && lowerPassword.includes(emailLocal)) {
        errors.push('Password must not contain your email address');
      }
    }
    if (context.name) {
      const nameParts = context.name.toLowerCase().split(/\s+/);
      for (const part of nameParts) {
        if (part.length >= 3 && lowerPassword.includes(part)) {
          errors.push('Password must not contain your name');
          break;
        }
      }
    }
    if (context.phone) {
      const phoneDigits = context.phone.replace(/\D/g, '');
      if (phoneDigits.length >= 4 && lowerPassword.includes(phoneDigits.slice(-4))) {
        errors.push('Password must not contain your phone number');
      }
    }

    // Check common passwords
    if (COMMON_PASSWORDS.has(lowerPassword)) {
      errors.push('This password is too common. Please choose a more unique password');
    }

    // zxcvbn check - dynamic import since it's a large module
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const zxcvbn = require('zxcvbn');
      const userInputs: string[] = [];
      if (context.email) userInputs.push(context.email);
      if (context.name) userInputs.push(context.name);
      if (context.phone) userInputs.push(context.phone);

      const result = zxcvbn(password, userInputs);
      if (result.score < 3) {
        errors.push(
          `Password is too weak (strength: ${result.score}/4). ${result.feedback?.suggestions?.join(' ') || 'Please use a stronger password.'}`,
        );
      }
    } catch {
      this.logger.warn('zxcvbn not available, skipping strength scoring');
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
  }

  /**
   * Check if the new password is the same as the current one.
   * Returns true if they match (meaning the new password should be rejected).
   */
  async isSameAsCurrentPassword(
    newPassword: string,
    currentHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(newPassword, currentHash);
  }
}
