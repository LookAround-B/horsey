import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHorseDto, UpdateHorseDto } from './dto';

@Injectable()
export class HorsesService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateHorseDto) {
    return this.prisma.horse.create({
      data: {
        name: dto.name,
        breed: dto.breed,
        age: dto.age,
        disciplines: (dto.disciplines as any) || [],
        passportNo: dto.passportNo,
        color: dto.color,
        gender: dto.gender,
        height: dto.height,
        registrationNo: dto.registrationNo,
        ownerId,
        mediaUrls: dto.mediaUrls || [],
        forSale: dto.forSale ?? false,
        price: dto.price,
        description: dto.description,
        location: dto.location,
      },
    });
  }

  async findAll(ownerId?: string) {
    return this.prisma.horse.findMany({
      where: ownerId ? { ownerId } : undefined,
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const horse = await this.prisma.horse.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true, phone: true } },
        entries: {
          take: 10,
          include: {
            competition: { select: { name: true, discipline: true, level: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!horse) throw new NotFoundException('Horse not found');
    return horse;
  }

  async update(id: string, ownerId: string, dto: UpdateHorseDto) {
    const horse = await this.prisma.horse.findUnique({ where: { id } });
    if (!horse) throw new NotFoundException('Horse not found');
    if (horse.ownerId !== ownerId) throw new ForbiddenException('Not your horse');

    return this.prisma.horse.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.breed && { breed: dto.breed }),
        ...(dto.age !== undefined && { age: dto.age }),
        ...(dto.disciplines && { disciplines: dto.disciplines as any }),
        ...(dto.passportNo !== undefined && { passportNo: dto.passportNo }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.gender !== undefined && { gender: dto.gender }),
        ...(dto.height !== undefined && { height: dto.height }),
        ...(dto.registrationNo !== undefined && { registrationNo: dto.registrationNo }),
        ...(dto.mediaUrls && { mediaUrls: dto.mediaUrls }),
        ...(dto.forSale !== undefined && { forSale: dto.forSale }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.location !== undefined && { location: dto.location }),
      },
    });
  }
}
