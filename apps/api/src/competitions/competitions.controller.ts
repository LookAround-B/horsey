import {
  Controller, Get, Post, Patch, Delete, Param, Body, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto, CreateEntryDto } from './dto';
import { CurrentUser, Roles } from '../common/decorators';
import { RolesGuard } from '../common/guards';

@ApiTags('Competitions')
@Controller()
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Post('events/:eventId/competitions')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a competition within an event' })
  create(
    @Param('eventId') eventId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCompetitionDto,
  ) {
    return this.competitionsService.create(eventId, userId, dto);
  }

  @Get('events/:eventId/competitions')
  @ApiOperation({ summary: 'List competitions for an event' })
  findByEvent(@Param('eventId') eventId: string) {
    return this.competitionsService.findByEvent(eventId);
  }

  @Get('competitions/:id')
  @ApiOperation({ summary: 'Get competition details' })
  findOne(@Param('id') id: string) {
    return this.competitionsService.findById(id);
  }

  @Patch('competitions/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a competition' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: Partial<CreateCompetitionDto>,
  ) {
    return this.competitionsService.update(id, userId, dto);
  }

  @Post('competitions/:id/entries')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enter a competition' })
  createEntry(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateEntryDto,
  ) {
    return this.competitionsService.createEntry(id, userId, dto);
  }

  @Get('competitions/:id/entries')
  @ApiOperation({ summary: 'List entries for a competition' })
  getEntries(@Param('id') id: string) {
    return this.competitionsService.getEntries(id);
  }

  @Delete('entries/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Withdraw from a competition' })
  deleteEntry(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.competitionsService.deleteEntry(id, userId);
  }

  @Post('competitions/:id/draw')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate draw for a competition' })
  generateDraw(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.competitionsService.generateDraw(id, userId);
  }
}
