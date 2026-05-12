import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, CreateAddressDto } from './dto';

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
    const { passwordHash, mfaSecret, mfaBackupCodes, emailVerifyToken, passwordResetToken, ...rest } = user;
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
    const { passwordHash, mfaSecret, mfaBackupCodes, emailVerifyToken, passwordResetToken, ...rest } = user;
    return rest;
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return this.prisma.address.create({ data: { ...dto, userId } });
  }

  async deleteAddress(userId: string, addressId: string) {
    const addr = await this.prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!addr) throw new NotFoundException('Address not found');
    return this.prisma.address.delete({ where: { id: addressId } });
  }
}
