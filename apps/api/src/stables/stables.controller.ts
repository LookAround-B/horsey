import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StablesService } from './stables.service';
import { CurrentUser, Roles } from '../common/decorators';
import { RolesGuard } from '../common/guards';

@ApiTags('Stables')
@Controller('stables')
export class StablesController {
  constructor(private readonly stablesService: StablesService) {}

  @Get()
  @ApiOperation({ summary: 'List stables' })
  findAll(
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.stablesService.findAll({
      city, state, search,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stable details' })
  findOne(@Param('id') id: string) {
    return this.stablesService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('STABLE_OWNER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a stable' })
  create(@CurrentUser('id') userId: string, @Body() dto: any) {
    return this.stablesService.create(userId, dto);
  }

  @Post(':id/reviews')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a review to a stable' })
  addReview(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: { rating: number; comment?: string },
  ) {
    return this.stablesService.addReview(id, userId, dto);
  }
}
