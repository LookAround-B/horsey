/**
 * Horsey Marketplace — Seed Script
 *
 * Creates marketplace test accounts:
 * - 1 Admin (platform operator)
 * - 2 Approved Vendors (Feed & Tack Co. + Sharma Stud Farm)
 * - 2 Buyers (Priya Mehta + Rajput Stables)
 * - Default product categories (5)
 * - Sample products per category
 */

import { PrismaClient, UserRole, VendorStatus, ListingStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding marketplace data...');

  // ─── Categories ────────────────────────────────────────────────────────────

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'horses' },
      create: {
        name: 'Horses',
        slug: 'horses',
        slaHours: 72,
        attributes: { lineage: 'string', registry: 'string', breed: 'string', trainingLevel: 'string', vetRecordsUrl: 'string' },
      },
      update: {},
    }),
    prisma.category.upsert({
      where: { slug: 'feed-supplements' },
      create: {
        name: 'Feed & Supplements',
        slug: 'feed-supplements',
        slaHours: 24,
        attributes: { brand: 'string', weight: 'number', ingredients: 'string' },
      },
      update: {},
    }),
    prisma.category.upsert({
      where: { slug: 'tack-accessories' },
      create: {
        name: 'Tack & Accessories',
        slug: 'tack-accessories',
        slaHours: 24,
        attributes: { size: 'string', color: 'string', discipline: 'string' },
      },
      update: {},
    }),
    prisma.category.upsert({
      where: { slug: 'grooming-health' },
      create: {
        name: 'Grooming & Health',
        slug: 'grooming-health',
        slaHours: 24,
        attributes: { size: 'string' },
      },
      update: {},
    }),
    prisma.category.upsert({
      where: { slug: 'stable-equipment' },
      create: {
        name: 'Stable Equipment',
        slug: 'stable-equipment',
        slaHours: 24,
        attributes: {},
      },
      update: {},
    }),
  ]);

  const [horsesCat, feedCat, tackCat] = categories;
  console.log('✅ Categories seeded');

  // ─── Admin ──────────────────────────────────────────────────────────────────

  const admin = await prisma.user.upsert({
    where: { email: 'admin@horsey.in' },
    create: {
      email: 'admin@horsey.in',
      name: 'Admin Horsey',
      role: UserRole.ADMIN,
      emailVerified: true,
      passwordHash: await bcrypt.hash('Admin@1234', 10),
    },
    update: {},
  });

  // ─── Vendor 1: Feed & Tack Co. ─────────────────────────────────────────────

  const vendor1User = await prisma.user.upsert({
    where: { email: 'vendor1@horsey.in' },
    create: {
      email: 'vendor1@horsey.in',
      name: 'Feed & Tack Co.',
      role: UserRole.VENDOR,
      emailVerified: true,
      passwordHash: await bcrypt.hash('Vendor@1234', 10),
    },
    update: {},
  });

  const vendor1 = await prisma.vendor.upsert({
    where: { userId: vendor1User.id },
    create: {
      userId: vendor1User.id,
      businessName: 'Feed & Tack Co.',
      gstNumber: '27AAPFU0939F1ZV',
      panNumber: 'AAPFU0939F',
      status: VendorStatus.APPROVED,
    },
    update: { status: VendorStatus.APPROVED },
  });

  // ─── Vendor 2: Sharma Stud Farm ────────────────────────────────────────────

  const vendor2User = await prisma.user.upsert({
    where: { email: 'vendor2@horsey.in' },
    create: {
      email: 'vendor2@horsey.in',
      name: 'Sharma Stud Farm',
      role: UserRole.VENDOR,
      emailVerified: true,
      passwordHash: await bcrypt.hash('Vendor@1234', 10),
    },
    update: {},
  });

  const vendor2 = await prisma.vendor.upsert({
    where: { userId: vendor2User.id },
    create: {
      userId: vendor2User.id,
      businessName: 'Sharma Stud Farm',
      gstNumber: '06AAHCS1234D1ZP',
      panNumber: 'AAHCS1234D',
      status: VendorStatus.APPROVED,
    },
    update: { status: VendorStatus.APPROVED },
  });

  console.log('✅ Vendors seeded');

  // ─── Buyers ────────────────────────────────────────────────────────────────

  const buyer1 = await prisma.user.upsert({
    where: { email: 'priya@horsey.in' },
    create: {
      email: 'priya@horsey.in',
      name: 'Priya Mehta',
      role: UserRole.BUYER,
      emailVerified: true,
      passwordHash: await bcrypt.hash('Buyer@1234', 10),
    },
    update: {},
  });

  const buyer2 = await prisma.user.upsert({
    where: { email: 'rajput@horsey.in' },
    create: {
      email: 'rajput@horsey.in',
      name: 'Rajput Stables',
      role: UserRole.BUYER,
      emailVerified: true,
      passwordHash: await bcrypt.hash('Buyer@1234', 10),
    },
    update: {},
  });

  // Default addresses
  await prisma.address.upsert({
    where: { id: 'addr_priya_1' },
    create: {
      id: 'addr_priya_1',
      userId: buyer1.id,
      label: 'Home Stable',
      line1: '14 Meadow Lane',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      isDefault: true,
      isStable: true,
    },
    update: {},
  });

  await prisma.address.upsert({
    where: { id: 'addr_rajput_1' },
    create: {
      id: 'addr_rajput_1',
      userId: buyer2.id,
      label: 'Rajput Farm',
      line1: 'NH-48, Rajput Farms',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122001',
      isDefault: true,
      isStable: true,
    },
    update: {},
  });

  console.log('✅ Buyers seeded');

  // ─── Sample Products ───────────────────────────────────────────────────────

  // Horse listing (Sharma Stud Farm)
  await prisma.product.upsert({
    where: { id: 'prod_horse_1' },
    create: {
      id: 'prod_horse_1',
      vendorId: vendor2.id,
      categoryId: horsesCat.id,
      title: 'Marwari Gelding — 7yr, Trained for Dressage',
      description: 'Beautiful 7-year-old Marwari gelding from proven lineage. Extensively trained for dressage and shows. Vet records available. Calm temperament, suitable for intermediate riders.',
      price: 350000,
      status: ListingStatus.ACTIVE,
      inventory: 1,
      isFeatured: true,
      freightRequired: false,
      attributes: {
        breed: 'Marwari',
        lineage: 'Sire: Sultan of Marwar, Dam: Rajkumari',
        registry: 'EFI/2019/MRW/0042',
        trainingLevel: 'Intermediate Dressage',
      },
    },
    update: {},
  });

  // Feed product (Feed & Tack Co.)
  await prisma.product.upsert({
    where: { id: 'prod_feed_1' },
    create: {
      id: 'prod_feed_1',
      vendorId: vendor1.id,
      categoryId: feedCat.id,
      title: 'Premium Alfalfa Hay — 25kg Bale',
      description: 'Sun-dried premium alfalfa hay. High protein content (18%), low dust. Ideal for performance horses. Sourced from certified farms in Rajasthan.',
      price: 1200,
      status: ListingStatus.ACTIVE,
      inventory: 500,
      lowStockAlert: 50,
      isFeatured: true,
      attributes: { brand: 'GreenMeadow', weight: 25, ingredients: 'Alfalfa (Medicago sativa)' },
    },
    update: {},
  });

  // Tack product (Feed & Tack Co.)
  await prisma.product.upsert({
    where: { id: 'prod_tack_1' },
    create: {
      id: 'prod_tack_1',
      vendorId: vendor1.id,
      categoryId: tackCat.id,
      title: 'Leather English Saddle — Medium Tree',
      description: 'Handcrafted genuine leather English saddle. Medium tree width, suitable for most horses. Includes girth and stirrups. Traditional craftsmanship from Kanpur.',
      price: 28000,
      status: ListingStatus.ACTIVE,
      inventory: 8,
      attributes: { size: 'Medium', color: 'Havana Brown', discipline: 'English' },
    },
    update: {},
  });

  console.log('✅ Products seeded');

  // ─── Platform Settings ─────────────────────────────────────────────────────

  await prisma.platformSetting.upsert({
    where: { key: 'commission_rate_pct' },
    create: { key: 'commission_rate_pct', value: '5' },
    update: {},
  });

  await prisma.platformSetting.upsert({
    where: { key: 'payout_net_days' },
    create: { key: 'payout_net_days', value: '7' },
    update: {},
  });

  await prisma.platformSetting.upsert({
    where: { key: 'default_sla_hours' },
    create: { key: 'default_sla_hours', value: '24' },
    update: {},
  });

  console.log('✅ Platform settings seeded');

  console.log('\n🎉 Marketplace seed complete!');
  console.log('\n📋 Test Accounts:');
  console.log('  Admin:    admin@horsey.in     / Admin@1234');
  console.log('  Vendor 1: vendor1@horsey.in   / Vendor@1234  (Feed & Tack Co.)');
  console.log('  Vendor 2: vendor2@horsey.in   / Vendor@1234  (Sharma Stud Farm)');
  console.log('  Buyer 1:  priya@horsey.in     / Buyer@1234   (Priya Mehta)');
  console.log('  Buyer 2:  rajput@horsey.in    / Buyer@1234   (Rajput Stables)');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
