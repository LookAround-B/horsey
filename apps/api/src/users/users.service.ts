import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        horses: { take: 10, orderBy: { createdAt: 'desc' } },
        _count: { select: { entries: true, merRecords: true, stables: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, refreshToken, ...rest } = user;
    return rest;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, role: true, avatarUrl: true,
        bio: true, efiLicenseNo: true, feiId: true, regionalZone: true,
        createdAt: true,
        _count: { select: { entries: true, merRecords: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.email && { email: dto.email }),
        ...(dto.avatarUrl && { avatarUrl: dto.avatarUrl }),
        ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
        ...(dto.efiLicenseNo && { efiLicenseNo: dto.efiLicenseNo }),
        ...(dto.feiId && { feiId: dto.feiId }),
        ...(dto.regionalZone && { regionalZone: dto.regionalZone as any }),
        ...(dto.bio && { bio: dto.bio }),
        ...(dto.role && { role: dto.role as any }),
        ...(dto.fcmToken && { fcmToken: dto.fcmToken }),
      },
    });
    const { passwordHash, refreshToken, ...rest } = user;
    return rest;
  }

  async getMerRecords(userId: string, discipline?: string) {
    return this.prisma.merRecord.findMany({
      where: {
        userId,
        ...(discipline && { discipline: discipline as any }),
      },
      include: {
        competition: { select: { name: true, event: { select: { name: true, venue: true } } } },
        horse: { select: { name: true } },
      },
      orderBy: { merDate: 'desc' },
    });
  }
}
