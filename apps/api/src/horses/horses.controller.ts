import { Controller, Get, Post, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { HorsesService } from './horses.service';
import { CreateHorseDto, UpdateHorseDto } from './dto';
import { CurrentUser } from '../common/decorators';

@ApiTags('Horses')
@Controller('horses')
export class HorsesController {
  constructor(private readonly horsesService: HorsesService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my horses' })
  findAll(@CurrentUser('id') userId: string) {
    return this.horsesService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get horse by ID' })
  findOne(@Param('id') id: string) {
    return this.horsesService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a horse' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateHorseDto) {
    return this.horsesService.create(userId, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update horse details' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateHorseDto,
  ) {
    return this.horsesService.update(id, userId, dto);
  }
}
