import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from 'database';

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    breed?: string;
    minAge?: number;
    maxAge?: number;
    discipline?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 12;
    const skip = (page - 1) * pageSize;

    const where: Prisma.HorseWhereInput = {
      forSale: true,
      ...(query.breed && {
        breed: { contains: query.breed, mode: 'insensitive' as const },
      }),
      ...(query.minAge && { age: { gte: query.minAge } }),
      ...(query.maxAge && { age: { lte: query.maxAge } }),
      ...(query.discipline && {
        disciplines: { has: query.discipline as any },
      }),
      ...(query.minPrice && { price: { gte: query.minPrice } }),
      ...(query.maxPrice && { price: { lte: query.maxPrice } }),
      ...(query.location && {
        location: { contains: query.location, mode: 'insensitive' as const },
      }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { breed: { contains: query.search, mode: 'insensitive' as const } },
          { description: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.horse.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { favorites: true } },
        },
      }),
      this.prisma.horse.count({ where }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findById(id: string) {
    const horse = await this.prisma.horse.findUnique({
      where: { id, forSale: true },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true, phone: true, email: true } },
        _count: { select: { favorites: true } },
      },
    });
    if (!horse) throw new NotFoundException('Horse not found or not for sale');
    return horse;
  }

  async toggleFavorite(userId: string, horseId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_horseId: { userId, horseId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await this.prisma.favorite.create({
      data: { userId, horseId },
    });
    return { favorited: true };
  }

  async getFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        horse: {
          include: {
            owner: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
