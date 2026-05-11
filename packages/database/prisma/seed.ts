/**
 * Horsey Marketplace — Seed Script
 *
 * Creates marketplace test accounts:
 * - 1 Admin (platform operator)
 * - 2 Approved Vendors (Feed & Tack Co. + Sharma Stud Farm)
 * - 2 Buyers (Priya Mehta + Rajput Stables)
 * - Default product categories (5)
 * - Sample products per category with cover images
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

  const [horsesCat, feedCat, tackCat, groomingCat, stableCat] = categories;
  console.log('✅ Categories seeded');

  // ─── Admin ──────────────────────────────────────────────────────────────────

  await prisma.user.upsert({
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

  // ─── Products ──────────────────────────────────────────────────────────────
  // helper: upsert a product then set its media (delete + recreate for idempotency)
  async function upsertProduct(
    data: Parameters<typeof prisma.product.upsert>[0]['create'] & { id: string },
    mediaUrls: string[] = [],
  ) {
    const { id, ...rest } = data;
    const product = await prisma.product.upsert({
      where: { id },
      create: { id, ...rest },
      update: {},
    });

    // Always refresh media so re-seeding updates images
    await prisma.productMedia.deleteMany({ where: { productId: product.id } });
    if (mediaUrls.length) {
      await prisma.productMedia.createMany({
        data: mediaUrls.map((url, order) => ({
          productId: product.id,
          url,
          type: 'image',
          order,
        })),
      });
    }
    return product;
  }

  // ── Horses ─────────────────────────────────────────────────────────────────

  await upsertProduct(
    {
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
      attributes: { breed: 'Marwari', lineage: 'Sire: Sultan of Marwar, Dam: Rajkumari', registry: 'EFI/2019/MRW/0042', trainingLevel: 'Intermediate Dressage' },
    },
    ['https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&auto=format&fit=crop'],
  );

  await upsertProduct(
    {
      id: 'prod_horse_2',
      vendorId: vendor2.id,
      categoryId: horsesCat.id,
      title: 'Thoroughbred Mare — 4yr, Racetrack Ready',
      description: 'Young 4-year-old Thoroughbred mare with excellent race pedigree. Fully vet-cleared, RWITC registered. Ideal for flat racing or cross-country. Handled by experienced trainers at Sharma Stud Farm.',
      price: 850000,
      status: ListingStatus.ACTIVE,
      inventory: 1,
      isFeatured: true,
      freightRequired: false,
      attributes: { breed: 'Thoroughbred', lineage: 'Sire: Royal Flash, Dam: Golden Sunrise', registry: 'RWITC/2021/TB/0198', trainingLevel: 'Advanced Racing' },
    },
    ['https://images.unsplash.com/photo-1598974357801-cbca100e65d3?w=800&auto=format&fit=crop'],
  );

  await upsertProduct(
    {
      id: 'prod_horse_3',
      vendorId: vendor2.id,
      categoryId: horsesCat.id,
      title: 'Kathiawari Stallion — 5yr, Show Jumper',
      description: 'Stunning Kathiawari stallion, 15.2 hands, trained for show jumping. Placed 2nd at Maharashtra State Equestrian Championships 2023. Excellent conformation and athletic ability.',
      price: 620000,
      status: ListingStatus.ACTIVE,
      inventory: 1,
      isFeatured: false,
      freightRequired: false,
      attributes: { breed: 'Kathiawari', lineage: 'Sire: Desert Wind, Dam: Priya Rani', registry: 'EFI/2020/KTH/0089', trainingLevel: 'Advanced Show Jumping' },
    },
    ['https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?w=800&auto=format&fit=crop'],
  );

  // ── Feed & Supplements ─────────────────────────────────────────────────────

  await upsertProduct(
    {
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
    ['https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&auto=format&fit=crop&q=80'],
  );

  await upsertProduct(
    {
      id: 'prod_feed_2',
      vendorId: vendor1.id,
      categoryId: feedCat.id,
      title: 'Electrolyte Replenisher Powder — 5kg',
      description: 'Complete electrolyte formula for horses in heavy work. Replaces sodium, potassium, chloride, and magnesium lost through sweat. Mixes easily in water or top-dressed on feed.',
      price: 2800,
      status: ListingStatus.ACTIVE,
      inventory: 200,
      lowStockAlert: 20,
      isFeatured: true,
      attributes: { brand: 'EquiLyte Pro', weight: 5, ingredients: 'Sodium Chloride, Potassium Chloride, Magnesium Sulphate, Dextrose' },
    },
    ['https://images.unsplash.com/photo-1450052590821-8bf91254a353?w=800&auto=format&fit=crop'],
  );

  await upsertProduct(
    {
      id: 'prod_feed_3',
      vendorId: vendor1.id,
      categoryId: feedCat.id,
      title: 'Performance Grain Mix — 20kg',
      description: 'Scientifically formulated grain mix for performance horses. Contains oats, corn, barley, and added vitamins A, D, E. Suitable for horses in moderate to heavy work.',
      price: 1850,
      status: ListingStatus.ACTIVE,
      inventory: 350,
      lowStockAlert: 30,
      isFeatured: false,
      attributes: { brand: 'EquiGrain', weight: 20, ingredients: 'Oats, Corn, Barley, Molasses, Vitamin Mix' },
    },
    ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop'],
  );

  // ── Tack & Accessories ─────────────────────────────────────────────────────

  await upsertProduct(
    {
      id: 'prod_tack_1',
      vendorId: vendor1.id,
      categoryId: tackCat.id,
      title: 'Leather English Saddle — Medium Tree',
      description: 'Handcrafted genuine leather English saddle. Medium tree width, suitable for most horses. Includes girth and stirrups. Traditional craftsmanship from Kanpur.',
      price: 28000,
      status: ListingStatus.ACTIVE,
      inventory: 8,
      isFeatured: true,
      attributes: { size: 'Medium', color: 'Havana Brown', discipline: 'English' },
    },
    ['https://images.unsplash.com/photo-1598974357801-cbca100e65d3?w=800&auto=format&fit=crop&q=80'],
  );

  await upsertProduct(
    {
      id: 'prod_tack_2',
      vendorId: vendor1.id,
      categoryId: tackCat.id,
      title: 'Biothane Western Bridle with Reins',
      description: 'Durable biothane Western bridle — waterproof, easy to clean, and long-lasting. Comes with matching split reins. Available in full and cob sizes. Perfect for trail and endurance riding.',
      price: 3500,
      status: ListingStatus.ACTIVE,
      inventory: 25,
      isFeatured: true,
      attributes: { size: 'Full', color: 'Black', discipline: 'Western' },
    },
    ['https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?w=800&auto=format&fit=crop'],
  );

  await upsertProduct(
    {
      id: 'prod_tack_3',
      vendorId: vendor1.id,
      categoryId: tackCat.id,
      title: 'Fleece Exercise Rug — 145cm',
      description: 'Soft anti-static fleece exercise rug. Ideal for cooling down after exercise or travelling. Machine washable. Surcingle loops and fillet string included.',
      price: 1800,
      status: ListingStatus.ACTIVE,
      inventory: 40,
      isFeatured: false,
      attributes: { size: '145cm', color: 'Navy Blue', discipline: 'Both' },
    },
    ['https://images.unsplash.com/photo-1450052590821-8bf91254a353?w=800&auto=format&fit=crop&q=80'],
  );

  // ── Grooming & Health ──────────────────────────────────────────────────────

  await upsertProduct(
    {
      id: 'prod_groom_1',
      vendorId: vendor1.id,
      categoryId: groomingCat.id,
      title: 'Professional Grooming Kit — 8 Piece',
      description: 'Complete grooming kit including hard brush, soft brush, mane comb, tail brush, hoof pick, curry comb, shedding blade, and carry bag. Suitable for all coat types.',
      price: 950,
      status: ListingStatus.ACTIVE,
      inventory: 120,
      lowStockAlert: 15,
      isFeatured: true,
      attributes: { size: 'One Size' },
    },
    ['https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&auto=format&fit=crop'],
  );

  await upsertProduct(
    {
      id: 'prod_groom_2',
      vendorId: vendor1.id,
      categoryId: groomingCat.id,
      title: 'Medicated Shampoo — 5L',
      description: 'Veterinary-grade medicated shampoo for horses. Controls skin conditions, removes sweat and grime. Contains tea tree oil and aloe vera. pH balanced for equine skin.',
      price: 1400,
      status: ListingStatus.ACTIVE,
      inventory: 80,
      lowStockAlert: 10,
      isFeatured: false,
      attributes: { size: '5L' },
    },
    ['https://images.unsplash.com/photo-1598974357801-cbca100e65d3?w=800&auto=format&fit=crop'],
  );

  await upsertProduct(
    {
      id: 'prod_groom_3',
      vendorId: vendor1.id,
      categoryId: groomingCat.id,
      title: 'First Aid Kit for Horses',
      description: 'Comprehensive equine first aid kit. Includes bandages, wound spray, antiseptic cream, thermometer, scissors, latex gloves, and vet-wrap rolls. Packed in a waterproof case.',
      price: 2200,
      status: ListingStatus.ACTIVE,
      inventory: 60,
      lowStockAlert: 8,
      isFeatured: true,
      attributes: { size: 'One Size' },
    },
    ['https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?w=800&auto=format&fit=crop'],
  );

  // ── Stable Equipment ───────────────────────────────────────────────────────

  await upsertProduct(
    {
      id: 'prod_stable_1',
      vendorId: vendor1.id,
      categoryId: stableCat.id,
      title: 'Heavy Duty Rubber Feed Bucket — 20L',
      description: 'Unbreakable heavy-duty rubber feed bucket. 20L capacity, suitable for feed and water. Features a flat back for wall mounting and a wide base for stability. Easy to clean.',
      price: 650,
      status: ListingStatus.ACTIVE,
      inventory: 300,
      lowStockAlert: 30,
      isFeatured: false,
      attributes: {},
    },
    ['https://images.unsplash.com/photo-1450052590821-8bf91254a353?w=800&auto=format&fit=crop'],
  );

  await upsertProduct(
    {
      id: 'prod_stable_2',
      vendorId: vendor1.id,
      categoryId: stableCat.id,
      title: 'Automatic Water Trough — 150L',
      description: 'Galvanised steel automatic water trough with float valve. 150L capacity, suitable for 4–6 horses. Corrosion resistant, easy installation. Ideal for paddock or stable use.',
      price: 8500,
      status: ListingStatus.ACTIVE,
      inventory: 15,
      lowStockAlert: 3,
      isFeatured: true,
      attributes: {},
    },
    ['https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&auto=format&fit=crop&q=80&sat=-30'],
  );

  await upsertProduct(
    {
      id: 'prod_stable_3',
      vendorId: vendor1.id,
      categoryId: stableCat.id,
      title: 'Hay Net — Large (Slow Feeder)',
      description: 'Heavy-duty slow-feeder hay net. Small holes encourage natural grazing behaviour and reduce hay wastage by up to 50%. UV-stabilised nylon, fits a full bale.',
      price: 480,
      status: ListingStatus.ACTIVE,
      inventory: 200,
      lowStockAlert: 20,
      isFeatured: false,
      attributes: {},
    },
    ['https://images.unsplash.com/photo-1598974357801-cbca100e65d3?w=800&auto=format&fit=crop&q=80&sat=-20'],
  );

  console.log('✅ Products seeded (15 total across 5 categories)');

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
  console.log('\n📦 Products: 3 Horses · 3 Feed · 3 Tack · 3 Grooming · 3 Stable (15 total)');
  console.log('   Featured: horse_1, horse_2, feed_1, feed_2, tack_1, tack_2, groom_1, groom_3, stable_2');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
