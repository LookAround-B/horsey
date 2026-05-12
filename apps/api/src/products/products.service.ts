import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ListingStatus, VendorStatus } from 'database';
import { CreateProductDto, UpdateProductDto, ProductSearchDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // ─── Categories ────────────────────────────────────────────────────────────

  async getCategories() {
    return this.prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { name: 'asc' },
    });
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: { children: true, parent: true },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  // ─── Products ──────────────────────────────────────────────────────────────

  async search(dto: ProductSearchDto) {
    const page = Number(dto.page) || 1;
    const pageSize = Number(dto.pageSize) || 24;
    const skip = (page - 1) * pageSize;

    let categoryIds: string[] | undefined;
    if (dto.categorySlug) {
      const cat = await this.prisma.category.findUnique({
        where: { slug: dto.categorySlug },
        include: { children: true },
      });
      if (cat) {
        categoryIds = [cat.id, ...cat.children.map((c) => c.id)];
      }
    } else if (dto.categoryId) {
      const cat = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
        include: { children: true },
      });
      if (cat) {
        categoryIds = [cat.id, ...cat.children.map((c) => c.id)];
      }
    }

    const where: Prisma.ProductWhereInput = {
      status: ListingStatus.ACTIVE,
      vendor: { status: VendorStatus.APPROVED },
      ...(categoryIds && { categoryId: { in: categoryIds } }),
      ...(dto.vendorId && { vendorId: dto.vendorId }),
      ...(dto.featured !== undefined && { isFeatured: dto.featured === true || (dto.featured as any) === 'true' }),
      ...(dto.minPrice || dto.maxPrice
        ? {
            price: {
              ...(dto.minPrice ? { gte: dto.minPrice } : {}),
              ...(dto.maxPrice ? { lte: dto.maxPrice } : {}),
            },
          }
        : {}),
      ...(dto.q && {
        OR: [
          { title: { contains: dto.q, mode: 'insensitive' } },
          { description: { contains: dto.q, mode: 'insensitive' } },
        ],
      }),
    };

    // JSON attribute filters (breed, discipline, brand, location)
    const attrFilters: any[] = [];
    if (dto.breed) {
      attrFilters.push({ attributes: { path: ['breed'], string_contains: dto.breed } });
    }
    if (dto.discipline) {
      attrFilters.push({ attributes: { path: ['trainingLevel'], string_contains: dto.discipline } });
    }
    if (dto.brand) {
      attrFilters.push({ attributes: { path: ['brand'], string_contains: dto.brand } });
    }
    if (dto.location) {
      attrFilters.push({ attributes: { path: ['location'], string_contains: dto.location } });
    }
    if (attrFilters.length > 0) {
      where.AND = [...(where.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : []), ...attrFilters];
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      dto.sort === 'price_asc'
        ? { price: 'asc' }
        : dto.sort === 'price_desc'
          ? { price: 'desc' }
          : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          vendor: { select: { id: true, businessName: true } },
          media: { where: { type: 'image' }, orderBy: { order: 'asc' }, take: 1 },
          _count: { select: { reviews: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        vendor: {
          select: {
            id: true,
            businessName: true,
            status: true,
            user: { select: { name: true, avatarUrl: true } },
          },
        },
        media: { orderBy: { order: 'asc' } },
        variants: true,
        reviews: {
          include: {
            buyer: { select: { name: true, avatarUrl: true } },
            photos: true,
            response: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: { select: { reviews: true } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async getFeatured() {
    return this.prisma.product.findMany({
      where: { isFeatured: true, status: ListingStatus.ACTIVE },
      take: 10,
      include: {
        category: { select: { name: true, slug: true } },
        vendor: { select: { businessName: true } },
        media: { where: { type: 'image' }, orderBy: { order: 'asc' }, take: 1 },
      },
    });
  }

  // ─── Vendor Listing Management ────────────────────────────────────────────

  async createProduct(userId: string, dto: CreateProductDto) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new ForbiddenException('Not a vendor');
    if (vendor.status !== VendorStatus.APPROVED) {
      throw new ForbiddenException('Vendor not approved — cannot list products');
    }

    return this.prisma.product.create({
      data: {
        vendorId: vendor.id,
        categoryId: dto.categoryId,
        title: dto.title,
        description: dto.description,
        price: dto.price,
        status: dto.status ?? ListingStatus.DRAFT,
        inventory: dto.inventory ?? 0,
        lowStockAlert: dto.lowStockAlert ?? 5,
        freightRequired: dto.freightRequired ?? false,
        attributes: dto.attributes ?? {},
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      },
    });
  }

  async updateProduct(userId: string, productId: string, dto: UpdateProductDto) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new ForbiddenException('Not a vendor');

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.vendorId !== vendor.id) throw new ForbiddenException('Not your product');

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.status && { status: dto.status }),
        ...(dto.inventory !== undefined && { inventory: dto.inventory }),
        ...(dto.freightRequired !== undefined && { freightRequired: dto.freightRequired }),
        ...(dto.attributes && { attributes: dto.attributes }),
      },
    });
  }

  async getVendorProducts(userId: string, page: number = 1, pageSize: number = 20) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new ForbiddenException('Not a vendor');

    const p = Math.max(1, Number(page) || 1);
    const ps = Math.max(1, Number(pageSize) || 20);
    const skip = (p - 1) * ps;
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { vendorId: vendor.id },
        skip,
        take: ps,
        orderBy: { updatedAt: 'desc' },
        include: {
          category: { select: { name: true, slug: true } },
          media: { where: { type: 'image' }, take: 1 },
          _count: { select: { orderItems: true } },
        },
      }),
      this.prisma.product.count({ where: { vendorId: vendor.id } }),
    ]);
    return { data, total };
  }

  async addMedia(userId: string, productId: string, url: string, type: string, order = 0) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new ForbiddenException('Not a vendor');
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.vendorId !== vendor.id) throw new ForbiddenException('Not your product');

    return this.prisma.productMedia.create({
      data: { productId, url, type, order },
    });
  }

  // ─── Reviews ──────────────────────────────────────────────────────────────

  async createReview(
    buyerId: string,
    productId: string,
    dto: { rating: number; body?: string; subOrderId: string },
  ) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    // Verify the buyer has a delivered sub-order containing this product
    const eligibleItem = await this.prisma.orderItem.findFirst({
      where: {
        productId,
        subOrder: {
          order: { buyerId },
          status: 'DELIVERED',
          id: dto.subOrderId,
        },
      },
    });
    if (!eligibleItem) {
      throw new ForbiddenException('You can only review products from delivered orders');
    }

    const existing = await this.prisma.review.findFirst({
      where: { buyerId, productId, subOrderId: dto.subOrderId },
    });
    if (existing) throw new ConflictException('You have already reviewed this product');

    return this.prisma.review.create({
      data: {
        buyerId,
        productId,
        vendorId: product.vendorId,
        subOrderId: dto.subOrderId,
        rating: dto.rating,
        body: dto.body,
      },
    });
  }

  async respondToReview(vendorUserId: string, reviewId: string, body: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId: vendorUserId } });
    if (!vendor) throw new ForbiddenException('Not a vendor');

    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.vendorId !== vendor.id) throw new ForbiddenException('Not your review');

    const existing = await this.prisma.reviewResponse.findUnique({ where: { reviewId } });
    if (existing) throw new ConflictException('Already responded to this review');

    return this.prisma.reviewResponse.create({
      data: { reviewId, vendorId: vendor.id, body },
    });
  }

  // ─── Category Seeding (Admin) ─────────────────────────────────────────────

  async seedDefaultCategories() {
    const categories = [
      {
        name: 'Horses',
        slug: 'horses',
        slaHours: 72,
        attributes: {
          lineage: 'string',
          registry: 'string',
          breed: 'string',
          trainingLevel: 'string',
          vetRecordsUrl: 'string',
        },
      },
      {
        name: 'Feed & Supplements',
        slug: 'feed-supplements',
        slaHours: 24,
        attributes: { brand: 'string', weight: 'number', ingredients: 'string' },
      },
      {
        name: 'Tack & Accessories',
        slug: 'tack-accessories',
        slaHours: 24,
        attributes: { size: 'string', color: 'string', discipline: 'string' },
      },
      {
        name: 'Grooming & Health',
        slug: 'grooming-health',
        slaHours: 24,
        attributes: { size: 'string' },
      },
      {
        name: 'Stable Equipment',
        slug: 'stable-equipment',
        slaHours: 24,
        attributes: {},
      },
    ];

    for (const cat of categories) {
      await this.prisma.category.upsert({
        where: { slug: cat.slug },
        create: cat,
        update: {},
      });
    }

    return { seeded: categories.length };
  }
}
