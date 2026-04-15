import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto, EventQueryDto } from './dto';
import { Prisma } from 'database';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(organizerId: string, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        name: dto.name,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        venue: dto.venue,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        latitude: dto.latitude,
        longitude: dto.longitude,
        organizerId,
        disciplines: (dto.disciplines as any) || [],
        efiSanctioned: dto.efiSanctioned ?? false,
        feiSanctioned: dto.feiSanctioned ?? false,
        bannerUrl: dto.bannerUrl,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        maxEntries: dto.maxEntries,
        entryFee: dto.entryFee,
        registrationDeadline: dto.registrationDeadline
          ? new Date(dto.registrationDeadline)
          : undefined,
        rules: dto.rules,
      },
      include: { organizer: { select: { id: true, name: true } } },
    });
  }

  async findAll(query: EventQueryDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 12;
    const skip = (page - 1) * pageSize;

    const where: Prisma.EventWhereInput = {
      isPublished: true,
      ...(query.discipline && {
        disciplines: { has: query.discipline as any },
      }),
      ...(query.city && {
        city: { contains: query.city, mode: 'insensitive' as const },
      }),
      ...(query.state && {
        state: { contains: query.state, mode: 'insensitive' as const },
      }),
      ...(query.efiSanctioned !== undefined && {
        efiSanctioned: query.efiSanctioned,
      }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { venue: { contains: query.search, mode: 'insensitive' as const } },
          { city: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
      ...(query.startDate && {
        startDate: { gte: new Date(query.startDate) },
      }),
      ...(query.endDate && {
        endDate: { lte: new Date(query.endDate) },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { startDate: 'asc' },
        include: {
          organizer: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { competitions: true } },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: { select: { id: true, name: true, avatarUrl: true, phone: true, email: true } },
        competitions: {
          include: {
            testSheet: { select: { id: true, name: true } },
            _count: { select: { entries: true } },
          },
          orderBy: { orderOfGo: 'asc' },
        },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: string, organizerId: string, dto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerId !== organizerId) {
      throw new ForbiddenException('Only the organizer can update this event');
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description && { description: dto.description }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
        ...(dto.venue && { venue: dto.venue }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.latitude !== undefined && { latitude: dto.latitude }),
        ...(dto.longitude !== undefined && { longitude: dto.longitude }),
        ...(dto.disciplines && { disciplines: dto.disciplines as any }),
        ...(dto.efiSanctioned !== undefined && { efiSanctioned: dto.efiSanctioned }),
        ...(dto.feiSanctioned !== undefined && { feiSanctioned: dto.feiSanctioned }),
        ...(dto.bannerUrl !== undefined && { bannerUrl: dto.bannerUrl }),
        ...(dto.contactEmail !== undefined && { contactEmail: dto.contactEmail }),
        ...(dto.contactPhone !== undefined && { contactPhone: dto.contactPhone }),
        ...(dto.maxEntries !== undefined && { maxEntries: dto.maxEntries }),
        ...(dto.entryFee !== undefined && { entryFee: dto.entryFee }),
        ...(dto.registrationDeadline !== undefined && {
          registrationDeadline: dto.registrationDeadline
            ? new Date(dto.registrationDeadline)
            : null,
        }),
        ...(dto.rules !== undefined && { rules: dto.rules }),
      },
    });
  }

  async publish(id: string, organizerId: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerId !== organizerId) {
      throw new ForbiddenException('Only the organizer can publish this event');
    }

    return this.prisma.event.update({
      where: { id },
      data: { isPublished: true, status: 'PUBLISHED' },
    });
  }
}
