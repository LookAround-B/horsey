import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto, EventQueryDto } from './dto';
import { CurrentUser, Roles } from '../common/decorators';
import { RolesGuard } from '../common/guards';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'List events (paginated, filterable)' })
  findAll(@Query() query: EventQueryDto) {
    return this.eventsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event details by ID' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new event (Organizer only)' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateEventDto) {
    return this.eventsService.create(userId, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an event' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, userId, dto);
  }

  @Post(':id/publish')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish an event' })
  publish(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.eventsService.publish(id, userId);
  }
}
