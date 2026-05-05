import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthRequest } from '../common/types/request';
import { UserRole } from 'database';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductSearchDto } from './dto';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get('categories')
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get('categories/:slug')
  getCategoryBySlug(@Param('slug') slug: string) {
    return this.productsService.getCategoryBySlug(slug);
  }

  @Get('featured')
  getFeatured() {
    return this.productsService.getFeatured();
  }

  @Get('search')
  search(@Query() dto: ProductSearchDto) {
    return this.productsService.search(dto);
  }

  @Get('vendor/my-listings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  getMyListings(
    @Req() req: AuthRequest,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.productsService.getVendorProducts(req.user.id, page, pageSize);
  }

  @Get(':id')
  getProduct(@Param('id') id: string) {
    return this.productsService.getById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  create(@Req() req: AuthRequest, @Body() dto: CreateProductDto) {
    return this.productsService.createProduct(req.user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(req.user.id, id, dto);
  }

  @Post(':id/media')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  addMedia(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() body: { url: string; type: string; order?: number },
  ) {
    return this.productsService.addMedia(req.user.id, id, body.url, body.type, body.order);
  }

  @Post('admin/seed-categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  seedCategories() {
    return this.productsService.seedDefaultCategories();
  }
}
