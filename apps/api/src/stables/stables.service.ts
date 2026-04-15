import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from 'database';

@Injectable()
export class StablesService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: any) {
    return this.prisma.stable.create({
      data: {
        name: dto.name,
        ownerId,
        description: dto.description,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        latitude: dto.latitude,
        longitude: dto.longitude,
        amenities: dto.amenities || [],
        capacity: dto.capacity,
        pricePerMonth: dto.pricePerMonth,
        mediaUrls: dto.mediaUrls || [],
        contactPhone: dto.contactPhone,
        contactEmail: dto.contactEmail,
      },
    });
  }

  async findAll(query: {
    city?: string;
    state?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 12;
    const skip = (page - 1) * pageSize;

    const where: Prisma.StableWhereInput = {
      ...(query.city && { city: { contains: query.city, mode: 'insensitive' as const } }),
      ...(query.state && { state: { contains: query.state, mode: 'insensitive' as const } }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { city: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.stable.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { rating: 'desc' },
        include: {
          owner: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { reviews: true } },
        },
      }),
      this.prisma.stable.count({ where }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findById(id: string) {
    const stable = await this.prisma.stable.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true, phone: true } },
        reviews: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!stable) throw new NotFoundException('Stable not found');
    return stable;
  }

  async addReview(stableId: string, userId: string, dto: { rating: number; comment?: string }) {
    const review = await this.prisma.review.create({
      data: {
        stableId,
        userId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });

    // Recalculate average rating
    const agg = await this.prisma.review.aggregate({
      where: { stableId },
      _avg: { rating: true },
      _count: true,
    });

    await this.prisma.stable.update({
      where: { id: stableId },
      data: {
        rating: agg._avg.rating || 0,
        reviewCount: agg._count,
      },
    });

    return review;
  }
}
