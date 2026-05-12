import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../password.service';

/**
 * Local strategy for email + password authentication.
 * Uses constant-time comparison and dummy bcrypt when user not found.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<{ id: string; role: string }> {
    const normalizedEmail = email?.toLowerCase()?.trim();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        role: true,
        passwordHash: true,
        isActive: true,
        isBanned: true,
      },
    });

    if (!user || !user.passwordHash) {
      // Perform dummy compare to normalize timing
      await this.passwordService.dummyCompare();
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.passwordService.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { id: user.id, role: user.role };
  }
}
