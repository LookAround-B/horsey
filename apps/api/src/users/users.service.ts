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
        addresses: true,
        vendor: { select: { id: true, businessName: true, status: true } },
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
        bio: true, createdAt: true,
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
        ...(dto.bio && { bio: dto.bio }),
        ...(dto.fcmToken && { fcmToken: dto.fcmToken }),
      },
    });
    const { passwordHash, refreshToken, ...rest } = user;
    return rest;
  }
}
