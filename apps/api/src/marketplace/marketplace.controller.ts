import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import { CurrentUser } from '../common/decorators';

@ApiTags('Marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('horses')
  @ApiOperation({ summary: 'Browse horses for sale' })
  findAll(
    @Query('breed') breed?: string,
    @Query('discipline') discipline?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('location') location?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.marketplaceService.findAll({
      breed,
      discipline,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      location,
      search,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  @Get('horses/:id')
  @ApiOperation({ summary: 'Get marketplace horse details' })
  findOne(@Param('id') id: string) {
    return this.marketplaceService.findById(id);
  }

  @Post('horses/:id/favorite')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle horse favorite' })
  toggleFavorite(
    @Param('id') horseId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.marketplaceService.toggleFavorite(userId, horseId);
  }

  @Get('favorites')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my favorite horses' })
  getFavorites(@CurrentUser('id') userId: string) {
    return this.marketplaceService.getFavorites(userId);
  }
}
