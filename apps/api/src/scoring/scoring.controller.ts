import {
  Controller, Get, Post, Patch, Param, Body, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ScoringService } from './scoring.service';
import {
  SubmitDressageScoreDto,
  SubmitShowJumpingScoreDto,
  SubmitTentPeggingScoreDto,
  UpdateScoreDto,
} from './dto';
import { CurrentUser, Roles } from '../common/decorators';
import { RolesGuard } from '../common/guards';

@ApiTags('Scoring')
@Controller('scores')
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Post('dressage')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('JUDGE', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit dressage scores (Judge only)' })
  submitDressage(
    @CurrentUser('id') judgeId: string,
    @Body() dto: SubmitDressageScoreDto,
  ) {
    return this.scoringService.submitDressageScore(judgeId, dto);
  }

  @Post('show-jumping')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('JUDGE', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit show jumping scores (Judge only)' })
  submitShowJumping(
    @CurrentUser('id') judgeId: string,
    @Body() dto: SubmitShowJumpingScoreDto,
  ) {
    return this.scoringService.submitShowJumpingScore(judgeId, dto);
  }

  @Post('tent-pegging')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('JUDGE', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit tent pegging scores (Judge only)' })
  submitTentPegging(
    @CurrentUser('id') judgeId: string,
    @Body() dto: SubmitTentPeggingScoreDto,
  ) {
    return this.scoringService.submitTentPeggingScore(judgeId, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('JUDGE', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Correct an existing score' })
  updateScore(
    @Param('id') id: string,
    @CurrentUser('id') judgeId: string,
    @Body() dto: UpdateScoreDto,
  ) {
    return this.scoringService.updateScore(id, judgeId, dto);
  }

  @Get('competitions/:id/scores')
  @ApiOperation({ summary: 'Get all scores for a competition' })
  getScores(@Param('id') id: string) {
    return this.scoringService.getCompetitionScores(id);
  }

  @Get('competitions/:id/leaderboard')
  @ApiOperation({ summary: 'Get leaderboard for a competition' })
  getLeaderboard(@Param('id') id: string) {
    return this.scoringService.getLeaderboard(id);
  }
}
