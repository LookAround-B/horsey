/**
 * Horsey Platform — Seed Script
 *
 * Creates realistic demo data following EFI REL 2026 Guidelines:
 * - Users across all roles (Riders, Judges, Organizers, Stable Owners)
 * - Horses with Indian breeds and EFI-compliant ages
 * - EFI Dressage Test Sheets (Appendix A-E) per REL 2026
 * - REL events across 6 regional zones
 * - Competitions for JNEC (SJ + Dressage) and NEC (Tent Pegging)
 * - Entries with draw numbers
 * - Scores with MER tracking
 * - Stables with amenities
 * - MER records per Appendix K requirements
 */

import {
  PrismaClient,
  Role,
  Discipline,
  CompetitionLevel,
  AgeCategory,
  RegionalZone,
  CompetitionStatus,
  EntryStatus,
  EventStatus,
  PaymentStatus,
  ArenaSize,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🐴 Seeding Horsey database...');

  // ─── Clean existing data ───────────────────────────────────────────────
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.review.deleteMany();
  await prisma.merRecord.deleteMany();
  await prisma.score.deleteMany();
  await prisma.entry.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.testSheet.deleteMany();
  await prisma.event.deleteMany();
  await prisma.horse.deleteMany();
  await prisma.stable.deleteMany();
  await prisma.user.deleteMany();

  console.log('  ✓ Cleaned existing data');

  // ─── Users ─────────────────────────────────────────────────────────────

  const admin = await prisma.user.create({
    data: {
      name: 'Admin Horsey',
      email: 'admin@horsey.in',
      phone: '+919999999999',
      role: Role.ADMIN,
      isVerified: true,
      regionalZone: RegionalZone.NORTH,
      googleId: 'google-admin-placeholder',
    },
  });

  const organizer1 = await prisma.user.create({
    data: {
      name: 'Col. Rajesh Sharma',
      email: 'rajesh.sharma@armyeq.in',
      phone: '+919876543210',
      role: Role.ORGANIZER,
      isVerified: true,
      regionalZone: RegionalZone.NORTH,
      efiLicenseNo: 'EFI-2024-ORG-0012',
      bio: 'Retired Army Colonel with 25+ years in equestrian sports. Former NEC organizer.',
    },
  });

  const organizer2 = await prisma.user.create({
    data: {
      name: 'Mrs. Priya Mehta',
      email: 'priya@cavalryclub.com',
      phone: '+919876543211',
      role: Role.ORGANIZER,
      isVerified: true,
      regionalZone: RegionalZone.WEST,
      efiLicenseNo: 'EFI-2025-ORG-0034',
      bio: 'President, Cavalry Club Pune. Organizes Western Zone RELs.',
    },
  });

  const judge1 = await prisma.user.create({
    data: {
      name: 'Mr. Vikram Singh',
      email: 'vikram.judge@efi.in',
      phone: '+919876543220',
      role: Role.JUDGE,
      isVerified: true,
      regionalZone: RegionalZone.NORTH,
      efiLicenseNo: 'EFI-2023-JDG-0005',
      feiId: '10089234',
      bio: 'FEI Level 2 Dressage Judge. 15 years national-level judging experience.',
    },
  });

  const judge2 = await prisma.user.create({
    data: {
      name: 'Mrs. Anita Kapoor',
      email: 'anita.judge@efi.in',
      phone: '+919876543221',
      role: Role.JUDGE,
      isVerified: true,
      regionalZone: RegionalZone.SOUTH,
      efiLicenseNo: 'EFI-2024-JDG-0018',
      bio: 'EFI National List Judge — Show Jumping & Tent Pegging specialist.',
    },
  });

  const judge3 = await prisma.user.create({
    data: {
      name: 'Mr. Ravi Menon',
      email: 'ravi.judge@efi.in',
      phone: '+919876543222',
      role: Role.JUDGE,
      isVerified: true,
      regionalZone: RegionalZone.SOUTH,
      efiLicenseNo: 'EFI-2025-JDG-0022',
      bio: 'EFI National Judge — Dressage specialist. 10+ years experience.',
    },
  });

  // Riders — 8 riders across age categories & zones
  const riders = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Arjun Thapa',
        email: 'arjun@rider.com',
        phone: '+919876500001',
        role: Role.RIDER,
        isVerified: true,
        regionalZone: RegionalZone.NORTH,
        efiLicenseNo: 'EFI-2025-RDR-0101',
        dateOfBirth: new Date('2008-03-15'), // Junior (17 yrs)
        bio: 'Junior rider from Dehradun. Specializes in Dressage and Show Jumping.',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Kavya Reddy',
        email: 'kavya@rider.com',
        phone: '+919876500002',
        role: Role.RIDER,
        isVerified: true,
        regionalZone: RegionalZone.SOUTH,
        efiLicenseNo: 'EFI-2025-RDR-0102',
        dateOfBirth: new Date('2012-07-22'), // Children-I (13 yrs)
        bio: 'Young talent from Bangalore. Dressage enthusiast.',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Rohan Deshmukh',
        email: 'rohan@rider.com',
        phone: '+919876500003',
        role: Role.RIDER,
        isVerified: true,
        regionalZone: RegionalZone.WEST,
        efiLicenseNo: 'EFI-2025-RDR-0103',
        dateOfBirth: new Date('2005-11-01'), // Young Rider (20 yrs)
        bio: 'Show Jumping specialist from Pune. 3x Regional champion.',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Neha Chauhan',
        email: 'neha@rider.com',
        phone: '+919876500004',
        role: Role.RIDER,
        isVerified: true,
        regionalZone: RegionalZone.CENTRAL,
        efiLicenseNo: 'EFI-2025-RDR-0104',
        dateOfBirth: new Date('2014-01-10'), // Children-II (11 yrs)
        bio: 'Youngest rider from Lucknow. Learning dressage.',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Maj. Deepak Kumar',
        email: 'deepak@army.in',
        phone: '+919876500005',
        role: Role.RIDER,
        isVerified: true,
        regionalZone: RegionalZone.NORTH,
        efiLicenseNo: 'EFI-2024-RDR-0055',
        dateOfBirth: new Date('1990-05-20'), // Senior (35 yrs)
        bio: 'Army officer. Tent pegging champion. 5x NEC medalist.',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Simran Grewal',
        email: 'simran@rider.com',
        phone: '+919876500006',
        role: Role.RIDER,
        isVerified: true,
        regionalZone: RegionalZone.NORTH,
        efiLicenseNo: 'EFI-2025-RDR-0106',
        dateOfBirth: new Date('2009-08-12'), // Junior (16 yrs)
        bio: 'Junior eventing rider from Chandigarh.',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Aditya Patil',
        email: 'aditya@rider.com',
        phone: '+919876500007',
        role: Role.RIDER,
        isVerified: true,
        regionalZone: RegionalZone.WEST,
        efiLicenseNo: 'EFI-2025-RDR-0107',
        dateOfBirth: new Date('1992-02-28'), // Senior (33 yrs)
        bio: 'Senior rider from Mumbai. Tent pegging specialist.',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Preet Kaur',
        email: 'preet@rider.com',
        phone: '+919876500008',
        role: Role.RIDER,
        isVerified: true,
        regionalZone: RegionalZone.NORTH,
        efiLicenseNo: 'EFI-2025-RDR-0108',
        dateOfBirth: new Date('2013-04-05'), // Children-I (12 yrs)
        bio: 'Budding rider from Patiala. Loves dressage.',
      },
    }),
  ]);

  const stableOwner = await prisma.user.create({
    data: {
      name: 'Mr. Sanjay Rathore',
      email: 'sanjay@stables.com',
      phone: '+919876543230',
      role: Role.STABLE_OWNER,
      isVerified: true,
      regionalZone: RegionalZone.NORTH,
    },
  });

  console.log(`  ✓ Created ${4 + 3 + riders.length + 1} users`);

  // ─── Horses ────────────────────────────────────────────────────────────

  const horses = await Promise.all([
    prisma.horse.create({
      data: {
        name: 'Sultan',
        breed: 'Marwari',
        age: 9,
        gender: 'Stallion',
        color: 'Bay',
        height: 15.2,
        ownerId: riders[0].id,
        disciplines: [Discipline.DRESSAGE, Discipline.SHOW_JUMPING],
        passportNo: 'EFI-HRS-2020-0451',
        registrationNo: 'IND-MW-2020-451',
        location: 'Dehradun, Uttarakhand',
      },
    }),
    prisma.horse.create({
      data: {
        name: 'Meera',
        breed: 'Thoroughbred',
        age: 7,
        gender: 'Mare',
        color: 'Chestnut',
        height: 16.0,
        ownerId: riders[1].id,
        disciplines: [Discipline.DRESSAGE],
        passportNo: 'EFI-HRS-2021-0512',
        registrationNo: 'IND-TB-2021-512',
        location: 'Bangalore, Karnataka',
      },
    }),
    prisma.horse.create({
      data: {
        name: 'Thunder',
        breed: 'Warmblood',
        age: 10,
        gender: 'Gelding',
        color: 'Dark Bay',
        height: 16.2,
        ownerId: riders[2].id,
        disciplines: [Discipline.SHOW_JUMPING],
        passportNo: 'EFI-HRS-2019-0398',
        registrationNo: 'IND-WB-2019-398',
        forSale: true,
        price: 1200000_00,
        description:
          'Experienced show jumper. Multiple REL Winner. Suitable for Young Rider level. FEI passport holder.',
        location: 'Pune, Maharashtra',
      },
    }),
    prisma.horse.create({
      data: {
        name: 'Bijli',
        breed: 'Kathiawari',
        age: 6,
        gender: 'Mare',
        color: 'Grey',
        height: 14.3,
        ownerId: riders[3].id,
        disciplines: [Discipline.DRESSAGE],
        passportNo: 'EFI-HRS-2022-0623',
        registrationNo: 'IND-KW-2022-623',
        location: 'Lucknow, UP',
      },
    }),
    prisma.horse.create({
      data: {
        name: 'Bahadur',
        breed: 'Marwari',
        age: 12,
        gender: 'Stallion',
        color: 'Black',
        height: 15.0,
        ownerId: riders[4].id,
        disciplines: [Discipline.TENT_PEGGING],
        passportNo: 'EFI-HRS-2018-0215',
        registrationNo: 'IND-MW-2018-215',
        location: 'Delhi Cantt',
      },
    }),
    prisma.horse.create({
      data: {
        name: 'Rani',
        breed: 'Arabian',
        age: 8,
        gender: 'Mare',
        color: 'Grey',
        height: 15.1,
        ownerId: riders[5].id,
        disciplines: [Discipline.DRESSAGE, Discipline.SHOW_JUMPING],
        passportNo: 'EFI-HRS-2020-0467',
        registrationNo: 'IND-AR-2020-467',
        location: 'Chandigarh',
      },
    }),
    prisma.horse.create({
      data: {
        name: 'Warrior',
        breed: 'Marwari',
        age: 11,
        gender: 'Stallion',
        color: 'Bay',
        height: 15.3,
        ownerId: riders[6].id,
        disciplines: [Discipline.TENT_PEGGING],
        passportNo: 'EFI-HRS-2019-0312',
        registrationNo: 'IND-MW-2019-312',
        location: 'Mumbai, Maharashtra',
      },
    }),
    prisma.horse.create({
      data: {
        name: 'Star',
        breed: 'Thoroughbred',
        age: 6,
        gender: 'Gelding',
        color: 'Chestnut',
        height: 15.3,
        ownerId: riders[7].id,
        disciplines: [Discipline.DRESSAGE],
        passportNo: 'EFI-HRS-2023-0701',
        registrationNo: 'IND-TB-2023-701',
        forSale: true,
        price: 800000_00,
        description:
          'Well-schooled TB. Ideal for Children-I dressage. Calm temperament. Snaffle-bit trained.',
        location: 'Patiala, Punjab',
      },
    }),
    // Extra horses for marketplace
    prisma.horse.create({
      data: {
        name: 'Lightning',
        breed: 'Hanoverian',
        age: 8,
        gender: 'Gelding',
        color: 'Dark Bay',
        height: 16.3,
        ownerId: riders[2].id,
        disciplines: [Discipline.SHOW_JUMPING, Discipline.EVENTING],
        passportNo: 'EFI-HRS-2021-0555',
        registrationNo: 'FEI-DE-2021-555',
        forSale: true,
        price: 2500000_00,
        description:
          'Import from Germany. FEI passport. Competed at 1.20m level. Ideal for Young Rider Show Jumping.',
        location: 'Pune, Maharashtra',
      },
    }),
    prisma.horse.create({
      data: {
        name: 'Shaktiman',
        breed: 'Marwari',
        age: 14,
        gender: 'Stallion',
        color: 'Piebald',
        height: 15.0,
        ownerId: riders[4].id,
        disciplines: [Discipline.TENT_PEGGING],
        passportNo: 'EFI-HRS-2016-0144',
        registrationNo: 'IND-MW-2016-144',
        forSale: true,
        price: 600000_00,
        description:
          'Veteran tent pegger. 3x NEC Gold. Ideal for experienced senior riders. Lance & sword trained.',
        location: 'Delhi Cantt',
      },
    }),
  ]);

  console.log(`  ✓ Created ${horses.length} horses`);

  // ─── EFI Dressage Test Sheets (REL 2026 — Appendix A-E) ───────────────

  const testSheetYR = await prisma.testSheet.create({
    data: {
      name: 'EFI REL 2026 — Appendix A (Young Rider)',
      discipline: Discipline.DRESSAGE,
      level: CompetitionLevel.MEDIUM,
      ageCategory: AgeCategory.YOUNG_RIDER,
      arenaSize: ArenaSize.STANDARD_20x60,
      timeAllowed: "6'30\"",
      maxScore: 290,
      movements: [
        { number: 1, description: 'Enter at A, collected trot. Halt, salute. Proceed collected trot.', letter: 'A-X', coefficient: 1, maxMark: 10 },
        { number: 2, description: 'Track right. Collected trot.', letter: 'C', coefficient: 1, maxMark: 10 },
        { number: 3, description: 'Circle right 10m diameter.', letter: 'M', coefficient: 2, maxMark: 10 },
        { number: 4, description: 'Shoulder-in right.', letter: 'H-E', coefficient: 2, maxMark: 10 },
        { number: 5, description: 'Half-pass right.', letter: 'E-K', coefficient: 2, maxMark: 10 },
        { number: 6, description: 'Collected trot.', letter: 'K-A', coefficient: 1, maxMark: 10 },
        { number: 7, description: 'Half-pass left.', letter: 'A-F', coefficient: 2, maxMark: 10 },
        { number: 8, description: 'Shoulder-in left.', letter: 'B-M', coefficient: 2, maxMark: 10 },
        { number: 9, description: 'Circle left 10m diameter.', letter: 'H', coefficient: 2, maxMark: 10 },
        { number: 10, description: 'Collected walk.', letter: 'C', coefficient: 1, maxMark: 10 },
        { number: 11, description: 'Extended walk.', letter: 'H-B', coefficient: 2, maxMark: 10 },
        { number: 12, description: 'Collected walk.', letter: 'B', coefficient: 1, maxMark: 10 },
        { number: 13, description: 'Collected canter right lead.', letter: 'F', coefficient: 1, maxMark: 10 },
        { number: 14, description: 'Flying change of lead.', letter: 'X', coefficient: 2, maxMark: 10 },
        { number: 15, description: 'Counter canter.', letter: 'M-B', coefficient: 1, maxMark: 10 },
        { number: 16, description: 'Simple change of lead through walk.', letter: 'B', coefficient: 2, maxMark: 10 },
        { number: 17, description: 'Extended canter on diagonal.', letter: 'H-F', coefficient: 1, maxMark: 10 },
        { number: 18, description: 'Collected canter.', letter: 'F', coefficient: 1, maxMark: 10 },
        { number: 19, description: 'Medium trot.', letter: 'A-C', coefficient: 1, maxMark: 10 },
        { number: 20, description: 'Collected trot.', letter: 'C', coefficient: 1, maxMark: 10 },
        { number: 21, description: 'Turn down centre line.', letter: 'A-D', coefficient: 1, maxMark: 10 },
        { number: 22, description: 'Halt, salute.', letter: 'X', coefficient: 1, maxMark: 10 },
      ],
      collectiveMarks: [
        { name: 'Gaits (Paces)', coefficient: 2, maxMark: 10 },
        { name: 'Impulsion', coefficient: 2, maxMark: 10 },
        { name: 'Submission', coefficient: 2, maxMark: 10 },
        { name: "Rider's Position & Seat", coefficient: 1, maxMark: 10 },
        { name: "Rider's Use of Aids", coefficient: 1, maxMark: 10 },
      ],
    },
  });

  const testSheetJr = await prisma.testSheet.create({
    data: {
      name: 'EFI REL 2026 — Appendix C (Junior)',
      discipline: Discipline.DRESSAGE,
      level: CompetitionLevel.NOVICE,
      ageCategory: AgeCategory.JUNIOR,
      arenaSize: ArenaSize.SMALL_20x40,
      timeAllowed: "3'55\"",
      maxScore: 250,
      movements: [
        { number: 1, description: 'Enter at A, working trot. Halt, salute. Proceed working trot.', letter: 'A-X', coefficient: 1, maxMark: 10 },
        { number: 2, description: 'Track right.', letter: 'C', coefficient: 1, maxMark: 10 },
        { number: 3, description: 'Circle right 20m diameter.', letter: 'B', coefficient: 1, maxMark: 10 },
        { number: 4, description: '20m circle in rising trot.', letter: 'E', coefficient: 1, maxMark: 10 },
        { number: 5, description: 'Medium walk.', letter: 'K', coefficient: 1, maxMark: 10 },
        { number: 6, description: 'Free walk on long rein.', letter: 'H-B', coefficient: 2, maxMark: 10 },
        { number: 7, description: 'Medium walk.', letter: 'B', coefficient: 1, maxMark: 10 },
        { number: 8, description: 'Working trot.', letter: 'F', coefficient: 1, maxMark: 10 },
        { number: 9, description: 'Circle left 20m.', letter: 'E', coefficient: 1, maxMark: 10 },
        { number: 10, description: 'Leg yield from centre line to track.', letter: 'D-H', coefficient: 2, maxMark: 10 },
        { number: 11, description: 'Working canter left lead.', letter: 'A', coefficient: 1, maxMark: 10 },
        { number: 12, description: 'Circle left 20m in canter.', letter: 'E', coefficient: 1, maxMark: 10 },
        { number: 13, description: 'Working trot.', letter: 'B', coefficient: 1, maxMark: 10 },
        { number: 14, description: 'Working canter right lead.', letter: 'A', coefficient: 1, maxMark: 10 },
        { number: 15, description: 'Circle right 20m in canter.', letter: 'B', coefficient: 1, maxMark: 10 },
        { number: 16, description: 'Working trot.', letter: 'E', coefficient: 1, maxMark: 10 },
        { number: 17, description: 'Lengthened trot on diagonal.', letter: 'F-H', coefficient: 1, maxMark: 10 },
        { number: 18, description: 'Turn down centre line.', letter: 'A', coefficient: 1, maxMark: 10 },
        { number: 19, description: 'Halt, salute.', letter: 'X', coefficient: 1, maxMark: 10 },
      ],
      collectiveMarks: [
        { name: 'Gaits (Paces)', coefficient: 2, maxMark: 10 },
        { name: 'Impulsion', coefficient: 2, maxMark: 10 },
        { name: 'Submission', coefficient: 2, maxMark: 10 },
        { name: "Rider's Position & Seat", coefficient: 1, maxMark: 10 },
        { name: "Rider's Use of Aids", coefficient: 1, maxMark: 10 },
      ],
    },
  });

  const testSheetCh1 = await prisma.testSheet.create({
    data: {
      name: 'EFI REL 2026 — Appendix D (Children-I)',
      discipline: Discipline.DRESSAGE,
      level: CompetitionLevel.PRELIMINARY,
      ageCategory: AgeCategory.CHILDREN_I,
      arenaSize: ArenaSize.SMALL_20x40,
      timeAllowed: "5'00\"",
      maxScore: 290,
      movements: [
        { number: 1, description: 'Enter at A, working trot rising. Halt, salute. Proceed working trot sitting.', letter: 'A-X', coefficient: 1, maxMark: 10 },
        { number: 2, description: 'Track right.', letter: 'C', coefficient: 1, maxMark: 10 },
        { number: 3, description: 'Circle right 20m diameter.', letter: 'B', coefficient: 1, maxMark: 10 },
        { number: 4, description: 'Working trot across diagonal.', letter: 'H-F', coefficient: 1, maxMark: 10 },
        { number: 5, description: 'Circle left 20m diameter.', letter: 'E', coefficient: 1, maxMark: 10 },
        { number: 6, description: 'Medium walk.', letter: 'K', coefficient: 1, maxMark: 10 },
        { number: 7, description: 'Free walk on long rein.', letter: 'B-M', coefficient: 2, maxMark: 10 },
        { number: 8, description: 'Medium walk.', letter: 'M', coefficient: 1, maxMark: 10 },
        { number: 9, description: 'Working trot.', letter: 'C', coefficient: 1, maxMark: 10 },
        { number: 10, description: '10m half circle right returning to track.', letter: 'H', coefficient: 2, maxMark: 10 },
        { number: 11, description: '10m half circle left returning to track.', letter: 'K', coefficient: 2, maxMark: 10 },
        { number: 12, description: 'Working canter right lead.', letter: 'A', coefficient: 1, maxMark: 10 },
        { number: 13, description: 'Circle right 20m in canter.', letter: 'B', coefficient: 1, maxMark: 10 },
        { number: 14, description: 'Working trot through corner.', letter: 'F', coefficient: 1, maxMark: 10 },
        { number: 15, description: 'Working canter left lead.', letter: 'A', coefficient: 1, maxMark: 10 },
        { number: 16, description: 'Circle left 20m in canter.', letter: 'E', coefficient: 1, maxMark: 10 },
        { number: 17, description: 'Working trot.', letter: 'K', coefficient: 1, maxMark: 10 },
        { number: 18, description: 'Lengthened trot on diagonal.', letter: 'F-H', coefficient: 1, maxMark: 10 },
        { number: 19, description: 'Working trot.', letter: 'H', coefficient: 1, maxMark: 10 },
        { number: 20, description: 'Turn down centre line.', letter: 'A', coefficient: 1, maxMark: 10 },
        { number: 21, description: 'Working trot.', letter: 'D-X', coefficient: 1, maxMark: 10 },
        { number: 22, description: 'Halt, salute.', letter: 'X', coefficient: 1, maxMark: 10 },
      ],
      collectiveMarks: [
        { name: 'Gaits (Paces)', coefficient: 2, maxMark: 10 },
        { name: 'Impulsion', coefficient: 2, maxMark: 10 },
        { name: 'Submission', coefficient: 2, maxMark: 10 },
        { name: "Rider's Position & Seat", coefficient: 1, maxMark: 10 },
        { name: "Rider's Use of Aids", coefficient: 1, maxMark: 10 },
      ],
    },
  });

  const testSheetCh2 = await prisma.testSheet.create({
    data: {
      name: 'EFI REL 2026 — Appendix E (Children-II)',
      discipline: Discipline.DRESSAGE,
      level: CompetitionLevel.INTRODUCTORY,
      ageCategory: AgeCategory.CHILDREN_II,
      arenaSize: ArenaSize.SMALL_20x40,
      timeAllowed: "4'00\"",
      maxScore: 210,
      movements: [
        { number: 1, description: 'Enter at A, working trot rising. Halt, salute. Proceed working trot.', letter: 'A-X', coefficient: 1, maxMark: 10 },
        { number: 2, description: 'Track right.', letter: 'C', coefficient: 1, maxMark: 10 },
        { number: 3, description: 'Circle right 20m diameter.', letter: 'B', coefficient: 1, maxMark: 10 },
        { number: 4, description: 'Medium walk.', letter: 'E', coefficient: 1, maxMark: 10 },
        { number: 5, description: 'Free walk on long rein.', letter: 'K-B', coefficient: 2, maxMark: 10 },
        { number: 6, description: 'Medium walk.', letter: 'B', coefficient: 1, maxMark: 10 },
        { number: 7, description: 'Working trot rising.', letter: 'F', coefficient: 1, maxMark: 10 },
        { number: 8, description: 'Circle left 20m diameter.', letter: 'E', coefficient: 1, maxMark: 10 },
        { number: 9, description: 'Working trot across diagonal.', letter: 'H-F', coefficient: 1, maxMark: 10 },
        { number: 10, description: 'Working canter right lead.', letter: 'A', coefficient: 1, maxMark: 10 },
        { number: 11, description: 'Circle right 20m in canter.', letter: 'B', coefficient: 1, maxMark: 10 },
        { number: 12, description: 'Working trot.', letter: 'E', coefficient: 1, maxMark: 10 },
        { number: 13, description: 'Working canter left lead.', letter: 'A', coefficient: 1, maxMark: 10 },
        { number: 14, description: 'Circle left 20m in canter.', letter: 'E', coefficient: 1, maxMark: 10 },
        { number: 15, description: 'Working trot.', letter: 'B', coefficient: 1, maxMark: 10 },
        { number: 16, description: 'Turn down centre line.', letter: 'A', coefficient: 1, maxMark: 10 },
        { number: 17, description: 'Working trot to X.', letter: 'D-X', coefficient: 1, maxMark: 10 },
        { number: 18, description: 'Halt, salute.', letter: 'X', coefficient: 1, maxMark: 10 },
      ],
      collectiveMarks: [
        { name: 'Gaits (Paces)', coefficient: 2, maxMark: 10 },
        { name: 'Impulsion', coefficient: 2, maxMark: 10 },
        { name: 'Submission', coefficient: 2, maxMark: 10 },
        { name: "Rider's Position & Seat", coefficient: 1, maxMark: 10 },
        { name: "Rider's Use of Aids", coefficient: 1, maxMark: 10 },
      ],
    },
  });

  console.log(`  ✓ Created 4 EFI Dressage Test Sheets (Appendix A, C, D, E)`);

  // ─── Events (REL compliant) ────────────────────────────────────────────

  const event1 = await prisma.event.create({
    data: {
      name: 'North Zone REL — Dressage & Show Jumping (JNEC Qualifier)',
      description:
        'Regional Equestrian League for JNEC qualification.\n\nDisciplines: Dressage & Show Jumping for Juniors, Children-I, and Children-II.\n\nAs per EFI REL 2026 Guidelines — Riders must achieve 2 MERs to qualify for JNEC.\n\nVenue: Army Polo & Riding Club, Delhi Cantt.\n\nJury: Min 2 officials from EFI National List.\nEFI Rep will be detailed by NF.',
      startDate: new Date('2026-05-15'),
      endDate: new Date('2026-05-17'),
      venue: 'Army Polo & Riding Club',
      address: 'Cariappa Marg, Delhi Cantt',
      city: 'New Delhi',
      state: 'Delhi',
      latitude: 28.5855,
      longitude: 77.1493,
      organizerId: organizer1.id,
      disciplines: [Discipline.DRESSAGE, Discipline.SHOW_JUMPING],
      status: EventStatus.PUBLISHED,
      isPublished: true,
      efiSanctioned: true,
      contactEmail: 'rajesh.sharma@armyeq.in',
      contactPhone: '+919876543210',
      maxEntries: 50,
      entryFee: 5000_00, // ₹5,000
      registrationDeadline: new Date('2026-05-10'),
      rules:
        'EFI REL 2026 Guidelines apply. Indian passport mandatory. Snaffle bits only for all categories. MER: Dressage min 57%, SJ max 8 jumping faults.',
    },
  });

  const event2 = await prisma.event.create({
    data: {
      name: 'West Zone REL — Tent Pegging (NEC Qualifier)',
      description:
        'Senior Tent Pegging REL for NEC qualification.\n\nAs per EFI REL 2026 Guidelines — Min score of 24 including time penalties.\n3 lance runs (2×6cm + 1×4cm) and 3 sword runs (2×6cm + 1×4cm).\n\n2 MERs required on two different horses or same horse at two different venues.\n\nVenue: Cavalry Club, Pune.',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-02'),
      venue: 'Cavalry Club',
      address: 'Pune Cantonment',
      city: 'Pune',
      state: 'Maharashtra',
      latitude: 18.5204,
      longitude: 73.8567,
      organizerId: organizer2.id,
      disciplines: [Discipline.TENT_PEGGING],
      status: EventStatus.PUBLISHED,
      isPublished: true,
      efiSanctioned: true,
      contactEmail: 'priya@cavalryclub.com',
      contactPhone: '+919876543211',
      entryFee: 3000_00,
      registrationDeadline: new Date('2026-05-25'),
      rules:
        'EFI REL 2026 & ITPF Technical Guidelines. Indian passport mandatory.',
    },
  });

  const event3 = await prisma.event.create({
    data: {
      name: 'South Zone REL — Dressage (JNEC Qualifier)',
      description:
        "Regional Equestrian League — Southern Zone.\n\nDressage tests as per Appendix A-F of EFI REL 2026.\nBitting: Snaffle only for all categories.\nHorse age restrictions per REL 2026:\n- Young Rider: 7+ years\n- Junior: 6+ years\n- Children-I/II: 6+ years (children), 5+ years (adults)",
      startDate: new Date('2026-07-10'),
      endDate: new Date('2026-07-12'),
      venue: 'Embassy Riding School',
      city: 'Bangalore',
      state: 'Karnataka',
      latitude: 12.9716,
      longitude: 77.5946,
      organizerId: organizer2.id,
      disciplines: [Discipline.DRESSAGE],
      status: EventStatus.DRAFT,
      efiSanctioned: true,
      contactEmail: 'contact@embassy.in',
      entryFee: 4000_00,
      rules:
        'EFI REL 2026 Guidelines. Snaffle bits only. Young Rider horses must be 7+ years.',
    },
  });

  const event4 = await prisma.event.create({
    data: {
      name: 'East Zone REL — Show Jumping & Dressage (JNEC Qualifier)',
      description:
        'Regional Equestrian League — Eastern Zone.\n\nOpen to Children-II, Children-I, Junior, and Young Rider categories.\n\nSJ Course Specs per REL 2026:\n- Jr: 1.00-1.05m, 350m/min\n- Ch-I: 80-90cm, 325m/min\n- Ch-II: 70-80cm, 325m/min\n\nAll entries subject to 50-entry cap per category for JNEC.\nMerit list prepared by EFI based on highest scores.',
      startDate: new Date('2026-08-20'),
      endDate: new Date('2026-08-22'),
      venue: 'Tolly Club Riding Arena',
      address: '3 Tollygunge Club Road',
      city: 'Kolkata',
      state: 'West Bengal',
      latitude: 22.5726,
      longitude: 88.3639,
      organizerId: organizer1.id,
      disciplines: [Discipline.DRESSAGE, Discipline.SHOW_JUMPING],
      status: EventStatus.PUBLISHED,
      isPublished: true,
      efiSanctioned: true,
      contactEmail: 'rajesh.sharma@armyeq.in',
      contactPhone: '+919876543210',
      maxEntries: 50,
      entryFee: 4500_00,
      registrationDeadline: new Date('2026-08-15'),
      rules:
        'EFI REL 2026 Guidelines. Indian passport mandatory. Horse usage: max 2× Dressage + 1× Jumping OR 2× Jumping + 1× Dressage per day.',
    },
  });

  console.log(`  ✓ Created 4 events`);

  // ─── Competitions ──────────────────────────────────────────────────────

  // Event 1: Dressage + SJ for JNEC
  const compDressageJr = await prisma.competition.create({
    data: {
      name: 'Junior Dressage — REL Individual Test (Appendix C)',
      eventId: event1.id,
      discipline: Discipline.DRESSAGE,
      level: CompetitionLevel.NOVICE,
      ageCategory: AgeCategory.JUNIOR,
      arenaSize: ArenaSize.SMALL_20x40,
      testSheetId: testSheetJr.id,
      maxJudges: 2,
      status: CompetitionStatus.IN_PROGRESS,
      startTime: new Date('2026-05-15T09:00:00'),
      orderOfGo: 1,
    },
  });

  const compDressageCh1 = await prisma.competition.create({
    data: {
      name: 'Children-I Dressage — REL Individual Test (Appendix D)',
      eventId: event1.id,
      discipline: Discipline.DRESSAGE,
      level: CompetitionLevel.PRELIMINARY,
      ageCategory: AgeCategory.CHILDREN_I,
      arenaSize: ArenaSize.SMALL_20x40,
      testSheetId: testSheetCh1.id,
      maxJudges: 2,
      status: CompetitionStatus.PENDING,
      startTime: new Date('2026-05-15T14:00:00'),
      orderOfGo: 2,
    },
  });

  const compSJJr = await prisma.competition.create({
    data: {
      name: 'Junior Show Jumping — REL Table A',
      eventId: event1.id,
      discipline: Discipline.SHOW_JUMPING,
      level: CompetitionLevel.NOVICE,
      ageCategory: AgeCategory.JUNIOR,
      format: 'TABLE_A',
      heightMin: 100,
      heightMax: 105,
      spread: 125,
      speedMPerMin: 350,
      timeAllowed: 78,
      obstacles: 11,
      efforts: 13,
      courseLength: 455,
      maxJudges: 1,
      status: CompetitionStatus.IN_PROGRESS,
      startTime: new Date('2026-05-16T09:00:00'),
      orderOfGo: 3,
    },
  });

  const compSJCh2 = await prisma.competition.create({
    data: {
      name: 'Children-II Show Jumping — REL Table A',
      eventId: event1.id,
      discipline: Discipline.SHOW_JUMPING,
      level: CompetitionLevel.INTRODUCTORY,
      ageCategory: AgeCategory.CHILDREN_II,
      format: 'TABLE_A',
      heightMin: 70,
      heightMax: 80,
      spread: 90,
      speedMPerMin: 325,
      timeAllowed: 84,
      obstacles: 11,
      efforts: 12,
      courseLength: 455,
      maxJudges: 1,
      status: CompetitionStatus.PENDING,
      startTime: new Date('2026-05-16T14:00:00'),
      orderOfGo: 4,
    },
  });

  // Event 2: Tent Pegging for Seniors
  const compTP = await prisma.competition.create({
    data: {
      name: 'Senior Tent Pegging — REL Individual',
      eventId: event2.id,
      discipline: Discipline.TENT_PEGGING,
      level: CompetitionLevel.ADVANCED,
      ageCategory: AgeCategory.SENIOR,
      maxJudges: 1,
      status: CompetitionStatus.IN_PROGRESS,
      startTime: new Date('2026-06-01T08:00:00'),
      orderOfGo: 1,
    },
  });

  // Event 4: East Zone
  const compDressageYR = await prisma.competition.create({
    data: {
      name: 'Young Rider Dressage — REL Individual Test (Appendix A)',
      eventId: event4.id,
      discipline: Discipline.DRESSAGE,
      level: CompetitionLevel.MEDIUM,
      ageCategory: AgeCategory.YOUNG_RIDER,
      arenaSize: ArenaSize.STANDARD_20x60,
      testSheetId: testSheetYR.id,
      maxJudges: 3,
      status: CompetitionStatus.PENDING,
      startTime: new Date('2026-08-20T09:00:00'),
      orderOfGo: 1,
    },
  });

  console.log(`  ✓ Created 6 competitions`);

  // ─── Entries ───────────────────────────────────────────────────────────

  // Dressage Jr entries
  const entry1 = await prisma.entry.create({
    data: {
      userId: riders[0].id,
      horseId: horses[0].id,
      competitionId: compDressageJr.id,
      drawNumber: 1,
      status: EntryStatus.CONFIRMED,
      paymentStatus: PaymentStatus.COMPLETED,
    },
  });
  const entry2 = await prisma.entry.create({
    data: {
      userId: riders[5].id,
      horseId: horses[5].id,
      competitionId: compDressageJr.id,
      drawNumber: 2,
      status: EntryStatus.CONFIRMED,
      paymentStatus: PaymentStatus.COMPLETED,
    },
  });

  // Dressage Ch-I entries
  const entry3 = await prisma.entry.create({
    data: {
      userId: riders[1].id,
      horseId: horses[1].id,
      competitionId: compDressageCh1.id,
      drawNumber: 1,
      status: EntryStatus.CONFIRMED,
      paymentStatus: PaymentStatus.COMPLETED,
    },
  });
  const entry4 = await prisma.entry.create({
    data: {
      userId: riders[7].id,
      horseId: horses[7].id,
      competitionId: compDressageCh1.id,
      drawNumber: 2,
      status: EntryStatus.CONFIRMED,
      paymentStatus: PaymentStatus.COMPLETED,
    },
  });

  // SJ Jr entries
  const entry5 = await prisma.entry.create({
    data: {
      userId: riders[0].id,
      horseId: horses[0].id,
      competitionId: compSJJr.id,
      drawNumber: 1,
      status: EntryStatus.CONFIRMED,
      paymentStatus: PaymentStatus.COMPLETED,
    },
  });
  const entry6 = await prisma.entry.create({
    data: {
      userId: riders[2].id,
      horseId: horses[2].id,
      competitionId: compSJJr.id,
      drawNumber: 2,
      status: EntryStatus.CONFIRMED,
      paymentStatus: PaymentStatus.COMPLETED,
    },
  });

  // SJ Ch-II entries
  const entry7 = await prisma.entry.create({
    data: {
      userId: riders[3].id,
      horseId: horses[3].id,
      competitionId: compSJCh2.id,
      drawNumber: 1,
      status: EntryStatus.ENTERED,
    },
  });

  // Tent Pegging entries
  const entry8 = await prisma.entry.create({
    data: {
      userId: riders[4].id,
      horseId: horses[4].id,
      competitionId: compTP.id,
      drawNumber: 1,
      status: EntryStatus.CONFIRMED,
      paymentStatus: PaymentStatus.COMPLETED,
    },
  });
  const entry9 = await prisma.entry.create({
    data: {
      userId: riders[6].id,
      horseId: horses[6].id,
      competitionId: compTP.id,
      drawNumber: 2,
      status: EntryStatus.CONFIRMED,
      paymentStatus: PaymentStatus.COMPLETED,
    },
  });

  // Young Rider Dressage entry (East Zone)
  const entry10 = await prisma.entry.create({
    data: {
      userId: riders[2].id,
      horseId: horses[2].id,
      competitionId: compDressageYR.id,
      drawNumber: 1,
      status: EntryStatus.CONFIRMED,
      paymentStatus: PaymentStatus.COMPLETED,
    },
  });

  console.log(`  ✓ Created 10 entries across 6 competitions`);

  // ─── Scores ────────────────────────────────────────────────────────────

  // Dressage Jr Score — Arjun on Sultan (Judge 1): 62.5% (MER achieved ≥57%)
  await prisma.score.create({
    data: {
      entryId: entry1.id,
      competitionId: compDressageJr.id,
      judgeId: judge1.id,
      judgePosition: 'C',
      movementMarks: Array.from({ length: 19 }, (_, i) => ({
        movementNumber: i + 1,
        mark: 6.5,
        coefficient: i < 3 ? 2 : 1,
        points: i < 3 ? 13 : 6.5,
      })),
      collectiveMarks: [
        { name: 'Gaits', mark: 7, coefficient: 2, points: 14 },
        { name: 'Impulsion', mark: 6.5, coefficient: 2, points: 13 },
        { name: 'Submission', mark: 6, coefficient: 2, points: 12 },
        { name: "Rider's Position", mark: 6.5, coefficient: 1, points: 6.5 },
        { name: "Rider's Aids", mark: 6, coefficient: 1, points: 6 },
      ],
      technicalScore: 155.5,
      rawScore: 155.5,
      percentage: 62.5,
      finalScore: 62.5,
      errorCount: 0,
      errorDeductions: 0,
      achievedMer: true, // 62.5% ≥ 57% MER threshold
      isSubmitted: true,
      submittedAt: new Date('2026-05-15T10:30:00'),
    },
  });

  // Dressage Jr Score — Arjun on Sultan (Judge 2): 63.8%
  await prisma.score.create({
    data: {
      entryId: entry1.id,
      competitionId: compDressageJr.id,
      judgeId: judge3.id,
      judgePosition: 'B',
      movementMarks: Array.from({ length: 19 }, (_, i) => ({
        movementNumber: i + 1,
        mark: 6.5,
        coefficient: i < 3 ? 2 : 1,
        points: i < 3 ? 13 : 6.5,
      })),
      collectiveMarks: [
        { name: 'Gaits', mark: 7.5, coefficient: 2, points: 15 },
        { name: 'Impulsion', mark: 7, coefficient: 2, points: 14 },
        { name: 'Submission', mark: 6, coefficient: 2, points: 12 },
        { name: "Rider's Position", mark: 6.5, coefficient: 1, points: 6.5 },
        { name: "Rider's Aids", mark: 6, coefficient: 1, points: 6 },
      ],
      technicalScore: 159,
      rawScore: 159,
      percentage: 63.8,
      finalScore: 63.8,
      errorCount: 0,
      errorDeductions: 0,
      achievedMer: true,
      isSubmitted: true,
      submittedAt: new Date('2026-05-15T10:30:00'),
    },
  });

  // Dressage Jr Score — Simran on Rani (Judge 1): 58.2% (MER achieved)
  await prisma.score.create({
    data: {
      entryId: entry2.id,
      competitionId: compDressageJr.id,
      judgeId: judge1.id,
      judgePosition: 'C',
      movementMarks: Array.from({ length: 19 }, (_, i) => ({
        movementNumber: i + 1,
        mark: 6,
        coefficient: i < 3 ? 2 : 1,
        points: i < 3 ? 12 : 6,
      })),
      collectiveMarks: [
        { name: 'Gaits', mark: 6, coefficient: 2, points: 12 },
        { name: 'Impulsion', mark: 5.5, coefficient: 2, points: 11 },
        { name: 'Submission', mark: 6, coefficient: 2, points: 12 },
        { name: "Rider's Position", mark: 6, coefficient: 1, points: 6 },
        { name: "Rider's Aids", mark: 5.5, coefficient: 1, points: 5.5 },
      ],
      technicalScore: 142,
      rawScore: 142,
      percentage: 58.2,
      finalScore: 58.2,
      errorCount: 0,
      errorDeductions: 0,
      achievedMer: true, // 58.2% ≥ 57% MER
      isSubmitted: true,
      submittedAt: new Date('2026-05-15T11:00:00'),
    },
  });

  // SJ Jr — Arjun on Sultan: 4 faults (MER achieved ≤8)
  await prisma.score.create({
    data: {
      entryId: entry5.id,
      competitionId: compSJJr.id,
      judgeId: judge2.id,
      faults: 4,
      timeFaults: 0,
      refusals: 0,
      roundTime: 72.5,
      rawScore: 4,
      finalScore: 4,
      achievedMer: true, // 4 ≤ 8 max jumping faults
      isSubmitted: true,
      submittedAt: new Date('2026-05-16T09:30:00'),
    },
  });

  // SJ Jr — Rohan on Thunder: 0 faults, clear round!
  await prisma.score.create({
    data: {
      entryId: entry6.id,
      competitionId: compSJJr.id,
      judgeId: judge2.id,
      faults: 0,
      timeFaults: 0,
      refusals: 0,
      roundTime: 68.3,
      rawScore: 0,
      finalScore: 0,
      achievedMer: true, // 0 ≤ 8
      isSubmitted: true,
      submittedAt: new Date('2026-05-16T09:45:00'),
    },
  });

  // TP — Deepak on Bahadur: 32 points (MER achieved ≥24)
  await prisma.score.create({
    data: {
      entryId: entry8.id,
      competitionId: compTP.id,
      judgeId: judge2.id,
      pegPoints: 32,
      lanceRuns: [
        { runNumber: 1, pegSize: 6, points: 10, carried: true },
        { runNumber: 2, pegSize: 6, points: 5, carried: false },
        { runNumber: 3, pegSize: 4, points: 10, carried: true },
      ],
      swordRuns: [
        { runNumber: 1, pegSize: 6, points: 5, carried: false },
        { runNumber: 2, pegSize: 6, points: 0, carried: false },
        { runNumber: 3, pegSize: 4, points: 2, carried: false },
      ],
      rawScore: 32,
      finalScore: 32,
      achievedMer: true, // 32 ≥ 24
      isSubmitted: true,
      submittedAt: new Date('2026-06-01T09:00:00'),
    },
  });

  // TP — Aditya on Warrior: 20 points (MER NOT achieved <24)
  await prisma.score.create({
    data: {
      entryId: entry9.id,
      competitionId: compTP.id,
      judgeId: judge2.id,
      pegPoints: 20,
      lanceRuns: [
        { runNumber: 1, pegSize: 6, points: 5, carried: false },
        { runNumber: 2, pegSize: 6, points: 5, carried: false },
        { runNumber: 3, pegSize: 4, points: 0, carried: false },
      ],
      swordRuns: [
        { runNumber: 1, pegSize: 6, points: 5, carried: false },
        { runNumber: 2, pegSize: 6, points: 5, carried: false },
        { runNumber: 3, pegSize: 4, points: 0, carried: false },
      ],
      rawScore: 20,
      finalScore: 20,
      achievedMer: false, // 20 < 24
      isSubmitted: true,
      submittedAt: new Date('2026-06-01T09:30:00'),
    },
  });

  console.log(`  ✓ Created 7 scores with MER tracking (including multi-judge)`);

  // ─── MER Records ───────────────────────────────────────────────────────
  // Per Appendix K: 2 MERs required from different horses/venues

  await prisma.merRecord.create({
    data: {
      userId: riders[0].id,
      discipline: Discipline.DRESSAGE,
      ageCategory: AgeCategory.JUNIOR,
      competitionId: compDressageJr.id,
      horseId: horses[0].id,
      venue: 'Army Polo & Riding Club, Delhi Cantt',
      score: 63.15, // Average of 62.5% + 63.8% across 2 judges
      achievedMer: true,
      merDate: new Date('2026-05-15'),
    },
  });

  await prisma.merRecord.create({
    data: {
      userId: riders[5].id,
      discipline: Discipline.DRESSAGE,
      ageCategory: AgeCategory.JUNIOR,
      competitionId: compDressageJr.id,
      horseId: horses[5].id,
      venue: 'Army Polo & Riding Club, Delhi Cantt',
      score: 58.2,
      achievedMer: true,
      merDate: new Date('2026-05-15'),
    },
  });

  await prisma.merRecord.create({
    data: {
      userId: riders[0].id,
      discipline: Discipline.SHOW_JUMPING,
      ageCategory: AgeCategory.JUNIOR,
      competitionId: compSJJr.id,
      horseId: horses[0].id,
      venue: 'Army Polo & Riding Club, Delhi Cantt',
      score: 4,
      achievedMer: true,
      merDate: new Date('2026-05-16'),
    },
  });

  await prisma.merRecord.create({
    data: {
      userId: riders[2].id,
      discipline: Discipline.SHOW_JUMPING,
      ageCategory: AgeCategory.YOUNG_RIDER,
      competitionId: compSJJr.id,
      horseId: horses[2].id,
      venue: 'Army Polo & Riding Club, Delhi Cantt',
      score: 0,
      achievedMer: true,
      merDate: new Date('2026-05-16'),
    },
  });

  await prisma.merRecord.create({
    data: {
      userId: riders[4].id,
      discipline: Discipline.TENT_PEGGING,
      ageCategory: AgeCategory.SENIOR,
      competitionId: compTP.id,
      horseId: horses[4].id,
      venue: 'Cavalry Club, Pune',
      score: 32,
      achievedMer: true,
      merDate: new Date('2026-06-01'),
    },
  });

  console.log(`  ✓ Created 5 MER records`);

  // ─── Stables ───────────────────────────────────────────────────────────

  const stable1 = await prisma.stable.create({
    data: {
      name: 'Rathore Equestrian Academy',
      ownerId: stableOwner.id,
      description:
        'Premier training facility with FEI-standard arenas. 60×75m show jumping arena with soft footing, 20×60m standard dressage arena with markers, 20×40m small arena. Farrier and veterinary cover available. Located near Delhi Cantt.',
      address: 'GT Road, Near Army Cantonment',
      city: 'New Delhi',
      state: 'Delhi',
      latitude: 28.6,
      longitude: 77.15,
      amenities: [
        'Show Jumping Arena (60×75m)',
        'Dressage Arena (20×60m)',
        'Small Practice Arena (20×40m)',
        'Farrier',
        'Vet On-Call',
        'Feed Room',
        'Tack Room',
        'Wash Bay',
        'Horse Walker',
        'Accommodation',
      ],
      capacity: 40,
      pricePerMonth: 25000_00, // ₹25,000
      contactPhone: '+919876543230',
      contactEmail: 'sanjay@stables.com',
      rating: 4.5,
      reviewCount: 12,
    },
  });

  const stable2 = await prisma.stable.create({
    data: {
      name: 'Cavalry Club Stables',
      ownerId: organizer2.id,
      description:
        'Historic stable facility at Pune Cantonment. 150m tent pegging ground. Well-maintained stables with 4×3m per horse as per EFI standards. Jump sets with FEI-spec safety cups available.',
      address: 'Pune Cantonment',
      city: 'Pune',
      state: 'Maharashtra',
      latitude: 18.52,
      longitude: 73.86,
      amenities: [
        'Tent Pegging Ground (150m)',
        'Show Jumping Arena',
        'Good Footing',
        'Grooming Station',
        'Farrier',
        'Feed Available',
        'Security',
        'Flood Lighting',
      ],
      capacity: 30,
      pricePerMonth: 18000_00,
      contactPhone: '+919876543211',
      rating: 4.2,
      reviewCount: 8,
    },
  });

  const stable3 = await prisma.stable.create({
    data: {
      name: 'South Star Equine Center',
      ownerId: stableOwner.id,
      description:
        'Modern equestrian center in Bangalore. Both small (20×40m) and standard (20×60m) dressage arenas with regulation letter markers. Practice jump sets with FEI-spec safety cups. Ideal for Children-I/II and Junior training.',
      city: 'Bangalore',
      state: 'Karnataka',
      latitude: 12.97,
      longitude: 77.59,
      amenities: [
        'Standard Dressage Arena (20×60m)',
        'Small Dressage Arena (20×40m)',
        'Jump Course',
        'Horse Walker',
        'Tack Room',
        'Farrier',
        'Vet Clinic On-Site',
        'Rider Accommodation',
        'Parking',
      ],
      capacity: 25,
      pricePerMonth: 20000_00,
      rating: 4.7,
      reviewCount: 15,
    },
  });

  console.log(`  ✓ Created 3 stables`);

  // ─── Reviews ───────────────────────────────────────────────────────────

  await prisma.review.create({
    data: {
      stableId: stable1.id,
      userId: riders[0].id,
      rating: 5,
      comment:
        'Excellent facilities! The show jumping arena has world-class footing. My horse Sultan loves the 20×60m dressage arena — proper FEI regulation markers.',
    },
  });
  await prisma.review.create({
    data: {
      stableId: stable1.id,
      userId: riders[5].id,
      rating: 4,
      comment:
        'Great coaching staff. My horse loves it here. Only wish they had an indoor arena for monsoon training.',
    },
  });
  await prisma.review.create({
    data: {
      stableId: stable2.id,
      userId: riders[4].id,
      rating: 5,
      comment:
        'Best tent pegging ground in Western Zone. 150m straight track with good footing. Bahadur performs beautifully here.',
    },
  });
  await prisma.review.create({
    data: {
      stableId: stable3.id,
      userId: riders[1].id,
      rating: 5,
      comment:
        'Perfect for young riders! Both arena sizes available. The vet clinic on-site is a huge plus. Meera is well looked after.',
    },
  });

  console.log(`  ✓ Created 4 reviews`);

  // ─── Payments ──────────────────────────────────────────────────────────

  await prisma.payment.create({
    data: {
      userId: riders[0].id,
      amount: 10000_00, // ₹10,000 (2 entries × ₹5,000)
      currency: 'INR',
      status: PaymentStatus.COMPLETED,
      razorpayOrderId: 'order_sample_001',
      razorpayPaymentId: 'pay_sample_001',
      metadata: {
        description: 'Entry fee for Junior Dressage + Junior SJ — North Zone REL',
        entries: [entry1.id, entry5.id],
      },
    },
  });

  await prisma.payment.create({
    data: {
      userId: riders[4].id,
      amount: 3000_00,
      currency: 'INR',
      status: PaymentStatus.COMPLETED,
      razorpayOrderId: 'order_sample_002',
      razorpayPaymentId: 'pay_sample_002',
      metadata: {
        description: 'Entry fee for Senior Tent Pegging — West Zone REL',
        entries: [entry8.id],
      },
    },
  });

  console.log(`  ✓ Created 2 payments`);

  // ─── Notifications ─────────────────────────────────────────────────────

  await prisma.notification.createMany({
    data: [
      {
        userId: riders[0].id,
        title: 'Draw Published — Junior Dressage',
        body: 'The draw for Junior Dressage at North Zone REL has been published. Your draw number is 1.',
        type: 'DRAW',
        metadata: { competitionId: compDressageJr.id, drawNumber: 1 },
      },
      {
        userId: riders[0].id,
        title: 'Score Published — Junior Dressage',
        body: 'Your dressage score has been published: 63.15% (average). MER achieved! ✅',
        type: 'RESULT',
        metadata: { competitionId: compDressageJr.id, percentage: 63.15, merAchieved: true },
      },
      {
        userId: riders[2].id,
        title: 'Registration Confirmed — East Zone REL',
        body: 'Your entry for Young Rider Dressage at East Zone REL has been confirmed.',
        type: 'ENTRY_DEADLINE',
        metadata: { eventId: event4.id, competitionId: compDressageYR.id },
      },
      {
        userId: riders[4].id,
        title: 'MER Achieved — Tent Pegging',
        body: 'Congratulations! You scored 32 points at the West Zone REL, meeting the MER requirement of 24 points.',
        type: 'RESULT',
        metadata: { competitionId: compTP.id, score: 32, merThreshold: 24 },
      },
    ],
  });

  console.log(`  ✓ Created 4 notifications`);

  // ─── Summary ───────────────────────────────────────────────────────────

  console.log('\n🎉 Seeding complete!\n');
  console.log('Summary:');
  console.log(`  Users:         ${await prisma.user.count()}`);
  console.log(`  Horses:        ${await prisma.horse.count()}`);
  console.log(`  Test Sheets:   ${await prisma.testSheet.count()}`);
  console.log(`  Events:        ${await prisma.event.count()}`);
  console.log(`  Competitions:  ${await prisma.competition.count()}`);
  console.log(`  Entries:       ${await prisma.entry.count()}`);
  console.log(`  Scores:        ${await prisma.score.count()}`);
  console.log(`  MER Records:   ${await prisma.merRecord.count()}`);
  console.log(`  Payments:      ${await prisma.payment.count()}`);
  console.log(`  Stables:       ${await prisma.stable.count()}`);
  console.log(`  Reviews:       ${await prisma.review.count()}`);
  console.log(`  Notifications: ${await prisma.notification.count()}`);
  console.log('\n📋 Auth: Sign in with Google OAuth');
  console.log('   Any Google account will be auto-registered on first login.');
  console.log('\n📋 Seeded Test Accounts (use Google auth to link):');
  console.log('  Admin:      admin@horsey.in');
  console.log('  Organizer:  rajesh.sharma@armyeq.in');
  console.log('  Judge:      vikram.judge@efi.in');
  console.log('  Rider:      arjun@rider.com');
  console.log('\n');

}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
