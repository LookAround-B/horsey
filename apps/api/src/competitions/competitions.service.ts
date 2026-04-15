import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompetitionDto, CreateEntryDto } from './dto';

@Injectable()
export class CompetitionsService {
  constructor(private prisma: PrismaService) {}

  async create(eventId: string, organizerId: string, dto: CreateCompetitionDto) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerId !== organizerId) {
      throw new ForbiddenException('Only the organizer can create competitions');
    }

    return this.prisma.competition.create({
      data: {
        name: dto.name,
        eventId,
        discipline: dto.discipline as any,
        level: dto.level as any,
        ageCategory: dto.ageCategory as any,
        arenaSize: dto.arenaSize as any,
        format: dto.format as any,
        testSheetId: dto.testSheetId,
        maxJudges: dto.maxJudges ?? 1,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        orderOfGo: dto.orderOfGo ?? 0,
        courseLength: dto.courseLength,
        obstacles: dto.obstacles,
        efforts: dto.efforts,
        speedMPerMin: dto.speedMPerMin,
        timeAllowed: dto.timeAllowed,
        heightMin: dto.heightMin,
        heightMax: dto.heightMax,
        spread: dto.spread,
      },
    });
  }

  async findByEvent(eventId: string) {
    return this.prisma.competition.findMany({
      where: { eventId },
      include: {
        testSheet: { select: { id: true, name: true, maxScore: true } },
        _count: { select: { entries: true, scores: true } },
      },
      orderBy: { orderOfGo: 'asc' },
    });
  }

  async findById(id: string) {
    const competition = await this.prisma.competition.findUnique({
      where: { id },
      include: {
        event: { select: { id: true, name: true, organizerId: true } },
        testSheet: true,
        entries: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
            horse: { select: { id: true, name: true, breed: true } },
          },
          orderBy: { drawNumber: 'asc' },
        },
        _count: { select: { entries: true, scores: true } },
      },
    });
    if (!competition) throw new NotFoundException('Competition not found');
    return competition;
  }

  async update(id: string, organizerId: string, data: Partial<CreateCompetitionDto>) {
    const comp = await this.prisma.competition.findUnique({
      where: { id },
      include: { event: { select: { organizerId: true } } },
    });
    if (!comp) throw new NotFoundException('Competition not found');
    if (comp.event.organizerId !== organizerId) {
      throw new ForbiddenException('Only the organizer can update competitions');
    }

    return this.prisma.competition.update({ where: { id }, data: data as any });
  }

  async createEntry(competitionId: string, userId: string, dto: CreateEntryDto) {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
      include: { event: true },
    });
    if (!competition) throw new NotFoundException('Competition not found');

    // Check duplicate entry
    const existing = await this.prisma.entry.findFirst({
      where: { competitionId, userId, horseId: dto.horseId },
    });
    if (existing) throw new BadRequestException('Entry already exists');

    // Verify horse ownership
    const horse = await this.prisma.horse.findFirst({
      where: { id: dto.horseId, ownerId: userId },
    });
    if (!horse) throw new ForbiddenException('You do not own this horse');

    return this.prisma.entry.create({
      data: {
        userId,
        horseId: dto.horseId,
        competitionId,
      },
      include: {
        user: { select: { id: true, name: true } },
        horse: { select: { id: true, name: true } },
      },
    });
  }

  async getEntries(competitionId: string) {
    return this.prisma.entry.findMany({
      where: { competitionId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        horse: { select: { id: true, name: true, breed: true } },
      },
      orderBy: { drawNumber: 'asc' },
    });
  }

  async deleteEntry(entryId: string, userId: string) {
    const entry = await this.prisma.entry.findUnique({ where: { id: entryId } });
    if (!entry) throw new NotFoundException('Entry not found');
    if (entry.userId !== userId) {
      throw new ForbiddenException('You can only delete your own entries');
    }
    return this.prisma.entry.delete({ where: { id: entryId } });
  }

  /**
   * Generate random draw numbers for all entries in a competition.
   */
  async generateDraw(competitionId: string, organizerId: string) {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
      include: { event: { select: { organizerId: true } }, entries: true },
    });
    if (!competition) throw new NotFoundException('Competition not found');
    if (competition.event.organizerId !== organizerId) {
      throw new ForbiddenException('Only the organizer can generate draw');
    }

    // Shuffle entries
    const entries = [...competition.entries];
    for (let i = entries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [entries[i], entries[j]] = [entries[j], entries[i]];
    }

    // Assign draw numbers
    const drawData = entries.map((entry, idx) => ({
      drawNumber: idx + 1,
      entryId: entry.id,
    }));

    // Update each entry and the competition
    await this.prisma.$transaction([
      ...drawData.map((d) =>
        this.prisma.entry.update({
          where: { id: d.entryId },
          data: { drawNumber: d.drawNumber },
        }),
      ),
      this.prisma.competition.update({
        where: { id: competitionId },
        data: {
          draw: drawData,
          status: 'DRAW_PUBLISHED',
        },
      }),
    ]);

    return { message: 'Draw generated successfully', draw: drawData };
  }
}
