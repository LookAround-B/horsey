import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  SubmitDressageScoreDto,
  SubmitShowJumpingScoreDto,
  SubmitTentPeggingScoreDto,
  UpdateScoreDto,
} from './dto';
import {
  calculateDressageScore,
  calculateAveragePercentage,
  calculateShowJumpingScore,
  calculateTentPeggingScore,
} from 'shared';

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Submit dressage score (judge-facing endpoint).
   * Uses the shared scoring engine for FEI/EFI compliant calculations.
   */
  async submitDressageScore(judgeId: string, dto: SubmitDressageScoreDto) {
    // Verify entry and competition exist
    const entry = await this.prisma.entry.findUnique({
      where: { id: dto.entryId },
      include: { competition: true },
    });
    if (!entry) throw new NotFoundException('Entry not found');
    if (entry.competitionId !== dto.competitionId) {
      throw new BadRequestException('Entry does not belong to this competition');
    }

    // Calculate score using shared engine
    const result = calculateDressageScore({
      entryId: dto.entryId,
      competitionId: dto.competitionId,
      judgeId,
      judgePosition: dto.judgePosition,
      movementMarks: dto.movementMarks as any,
      collectiveMarks: dto.collectiveMarks as any,
      qualityMarks: dto.qualityMarks,
      errorCount: dto.errorCount,
    });

    // Upsert score (one score per judge per entry)
    const score = await this.prisma.score.upsert({
      where: {
        entryId_judgeId: { entryId: dto.entryId, judgeId },
      },
      create: {
        entryId: dto.entryId,
        competitionId: dto.competitionId,
        judgeId,
        judgePosition: dto.judgePosition,
        movementMarks: dto.movementMarks as any,
        collectiveMarks: dto.collectiveMarks as any,
        qualityMarks: dto.qualityMarks as any,
        technicalScore: result.technicalScore,
        qualityScore: result.qualityScore,
        errorCount: dto.errorCount,
        errorDeductions: result.errorDeductions,
        rawScore: result.rawScore,
        percentage: result.finalPercentage,
        penalties: result.eventingPenalties,
        finalScore: result.finalPercentage,
        isEliminated: result.isEliminated,
        eliminationReason: result.eliminationReason,
        achievedMer: result.achievedMer,
        isSubmitted: true,
        submittedAt: new Date(),
      },
      update: {
        movementMarks: dto.movementMarks as any,
        collectiveMarks: dto.collectiveMarks as any,
        qualityMarks: dto.qualityMarks as any,
        technicalScore: result.technicalScore,
        qualityScore: result.qualityScore,
        errorCount: dto.errorCount,
        errorDeductions: result.errorDeductions,
        rawScore: result.rawScore,
        percentage: result.finalPercentage,
        penalties: result.eventingPenalties,
        finalScore: result.finalPercentage,
        isEliminated: result.isEliminated,
        eliminationReason: result.eliminationReason,
        achievedMer: result.achievedMer,
        isSubmitted: true,
        submittedAt: new Date(),
      },
    });

    this.logger.log(
      `Dressage score submitted: entry=${dto.entryId}, judge=${judgeId}, percentage=${result.finalPercentage}%`,
    );

    return { score, calculation: result };
  }

  /**
   * Submit show jumping score.
   */
  async submitShowJumpingScore(judgeId: string, dto: SubmitShowJumpingScoreDto) {
    const entry = await this.prisma.entry.findUnique({
      where: { id: dto.entryId },
    });
    if (!entry) throw new NotFoundException('Entry not found');

    const result = calculateShowJumpingScore({
      entryId: dto.entryId,
      competitionId: dto.competitionId,
      judgeId,
      faults: dto.faults,
      refusals: dto.refusals,
      roundTime: dto.roundTime,
      timeAllowed: dto.timeAllowed,
      jumpOffFaults: dto.jumpOffFaults,
      jumpOffTime: dto.jumpOffTime,
    });

    const score = await this.prisma.score.upsert({
      where: {
        entryId_judgeId: { entryId: dto.entryId, judgeId },
      },
      create: {
        entryId: dto.entryId,
        competitionId: dto.competitionId,
        judgeId,
        faults: dto.faults,
        timeFaults: result.timeFaults,
        refusals: dto.refusals,
        roundTime: dto.roundTime,
        jumpOffFaults: dto.jumpOffFaults,
        jumpOffTime: dto.jumpOffTime,
        rawScore: result.totalFaults,
        finalScore: result.totalFaults,
        isEliminated: result.isEliminated,
        eliminationReason: result.eliminationReason,
        achievedMer: result.achievedMer,
        isSubmitted: true,
        submittedAt: new Date(),
      },
      update: {
        faults: dto.faults,
        timeFaults: result.timeFaults,
        refusals: dto.refusals,
        roundTime: dto.roundTime,
        jumpOffFaults: dto.jumpOffFaults,
        jumpOffTime: dto.jumpOffTime,
        rawScore: result.totalFaults,
        finalScore: result.totalFaults,
        isEliminated: result.isEliminated,
        eliminationReason: result.eliminationReason,
        achievedMer: result.achievedMer,
        isSubmitted: true,
        submittedAt: new Date(),
      },
    });

    return { score, calculation: result };
  }

  /**
   * Submit tent pegging score.
   */
  async submitTentPeggingScore(judgeId: string, dto: SubmitTentPeggingScoreDto) {
    const entry = await this.prisma.entry.findUnique({
      where: { id: dto.entryId },
    });
    if (!entry) throw new NotFoundException('Entry not found');

    const result = calculateTentPeggingScore({
      entryId: dto.entryId,
      competitionId: dto.competitionId,
      judgeId,
      lanceRuns: dto.lanceRuns as any,
      swordRuns: dto.swordRuns as any,
    });

    const score = await this.prisma.score.upsert({
      where: {
        entryId_judgeId: { entryId: dto.entryId, judgeId },
      },
      create: {
        entryId: dto.entryId,
        competitionId: dto.competitionId,
        judgeId,
        pegPoints: result.totalPoints,
        lanceRuns: dto.lanceRuns as any,
        swordRuns: dto.swordRuns as any,
        rawScore: result.totalPoints,
        finalScore: result.totalPoints,
        achievedMer: result.achievedMer,
        isSubmitted: true,
        submittedAt: new Date(),
      },
      update: {
        pegPoints: result.totalPoints,
        lanceRuns: dto.lanceRuns as any,
        swordRuns: dto.swordRuns as any,
        rawScore: result.totalPoints,
        finalScore: result.totalPoints,
        achievedMer: result.achievedMer,
        isSubmitted: true,
        submittedAt: new Date(),
      },
    });

    return { score, calculation: result };
  }

  /**
   * Update an existing score (correction).
   */
  async updateScore(scoreId: string, judgeId: string, dto: UpdateScoreDto) {
    const score = await this.prisma.score.findUnique({ where: { id: scoreId } });
    if (!score) throw new NotFoundException('Score not found');
    if (score.judgeId !== judgeId) {
      throw new BadRequestException('Only the scoring judge can correct this score');
    }

    return this.prisma.score.update({
      where: { id: scoreId },
      data: dto as any,
    });
  }

  /**
   * Get all scores for a competition.
   */
  async getCompetitionScores(competitionId: string) {
    return this.prisma.score.findMany({
      where: { competitionId, isSubmitted: true },
      include: {
        entry: {
          include: {
            user: { select: { id: true, name: true } },
            horse: { select: { id: true, name: true } },
          },
        },
        judge: { select: { id: true, name: true } },
      },
      orderBy: { finalScore: 'desc' },
    });
  }

  /**
   * Get leaderboard for a competition.
   * Groups scores by entry, averages across judges, and ranks.
   */
  async getLeaderboard(competitionId: string) {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
      select: { discipline: true },
    });
    if (!competition) throw new NotFoundException('Competition not found');

    const scores = await this.prisma.score.findMany({
      where: { competitionId, isSubmitted: true },
      include: {
        entry: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
            horse: { select: { id: true, name: true, breed: true } },
          },
        },
        judge: { select: { id: true, name: true } },
      },
    });

    // Group by entry
    const byEntry = new Map<string, typeof scores>();
    for (const score of scores) {
      const arr = byEntry.get(score.entryId) || [];
      arr.push(score);
      byEntry.set(score.entryId, arr);
    }

    // Calculate leaderboard
    const leaderboard = Array.from(byEntry.entries()).map(
      ([entryId, entryScores]) => {
        const entry = entryScores[0].entry;
        const isEliminated = entryScores.some((s) => s.isEliminated);
        const achievedMer = entryScores.every((s) => s.achievedMer);

        let finalScore: number;
        let percentage: number | undefined;
        let totalFaults: number | undefined;
        let totalPoints: number | undefined;

        if (competition.discipline === 'DRESSAGE' || competition.discipline === 'EVENTING') {
          // Average percentage across judges
          const percentages = entryScores
            .filter((s) => s.percentage != null)
            .map((s) => s.percentage!);
          percentage = calculateAveragePercentage(percentages);
          finalScore = percentage;
        } else if (competition.discipline === 'SHOW_JUMPING') {
          // Sum faults
          totalFaults = entryScores.reduce(
            (sum, s) => sum + (s.rawScore || 0),
            0,
          );
          finalScore = totalFaults;
        } else {
          // Tent pegging: sum points
          totalPoints = entryScores.reduce(
            (sum, s) => sum + (s.pegPoints || 0),
            0,
          );
          finalScore = totalPoints;
        }

        return {
          entryId,
          riderName: entry.user.name,
          riderAvatar: entry.user.avatarUrl,
          horseName: entry.horse.name,
          horseBreed: entry.horse.breed,
          drawNumber: entry.drawNumber,
          scores: entryScores.map((s) => ({
            judgeId: s.judgeId,
            judgeName: s.judge.name,
            judgePosition: s.judgePosition,
            percentage: s.percentage,
            faults: s.rawScore,
            points: s.pegPoints,
          })),
          finalScore,
          percentage,
          totalFaults,
          totalPoints,
          isEliminated,
          achievedMer,
        };
      },
    );

    // Sort
    if (competition.discipline === 'DRESSAGE') {
      // Highest percentage first
      leaderboard.sort((a, b) => {
        if (a.isEliminated && !b.isEliminated) return 1;
        if (!a.isEliminated && b.isEliminated) return -1;
        return (b.finalScore || 0) - (a.finalScore || 0);
      });
    } else if (competition.discipline === 'SHOW_JUMPING') {
      // Fewest faults first
      leaderboard.sort((a, b) => {
        if (a.isEliminated && !b.isEliminated) return 1;
        if (!a.isEliminated && b.isEliminated) return -1;
        return (a.finalScore || 0) - (b.finalScore || 0);
      });
    } else {
      // Highest points first (tent pegging)
      leaderboard.sort((a, b) => {
        if (a.isEliminated && !b.isEliminated) return 1;
        if (!a.isEliminated && b.isEliminated) return -1;
        return (b.finalScore || 0) - (a.finalScore || 0);
      });
    }

    // Assign ranks
    return leaderboard.map((entry, idx) => ({
      rank: idx + 1,
      ...entry,
    }));
  }
}
