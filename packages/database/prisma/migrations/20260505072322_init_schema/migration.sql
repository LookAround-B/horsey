-- CreateEnum
CREATE TYPE "Role" AS ENUM ('RIDER', 'ORGANIZER', 'JUDGE', 'STABLE_OWNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "Discipline" AS ENUM ('DRESSAGE', 'SHOW_JUMPING', 'EVENTING', 'TENT_PEGGING');

-- CreateEnum
CREATE TYPE "ArenaSize" AS ENUM ('SMALL_20x40', 'STANDARD_20x60');

-- CreateEnum
CREATE TYPE "CompetitionLevel" AS ENUM ('INTRODUCTORY', 'PRELIMINARY', 'NOVICE', 'ELEMENTARY', 'MEDIUM', 'ADVANCED', 'PRIX_ST_GEORGES', 'INTERMEDIATE_I', 'INTERMEDIATE_II', 'GRAND_PRIX');

-- CreateEnum
CREATE TYPE "AgeCategory" AS ENUM ('CHILDREN_II', 'CHILDREN_I', 'JUNIOR', 'YOUNG_RIDER', 'SENIOR');

-- CreateEnum
CREATE TYPE "RegionalZone" AS ENUM ('NORTH', 'EAST', 'WEST', 'SOUTH', 'CENTRAL', 'NORTH_EAST');

-- CreateEnum
CREATE TYPE "CompetitionStatus" AS ENUM ('PENDING', 'DRAW_PUBLISHED', 'IN_PROGRESS', 'SCORING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EntryStatus" AS ENUM ('ENTERED', 'CONFIRMED', 'WITHDRAWN', 'ELIMINATED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CompetitionFormat" AS ENUM ('TABLE_A', 'TABLE_C', 'TWO_PHASE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'RIDER',
    "avatarUrl" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "efiLicenseNo" TEXT,
    "feiId" TEXT,
    "regionalZone" "RegionalZone",
    "bio" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT,
    "refreshToken" TEXT,
    "googleId" TEXT,
    "fcmToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "discipline" "Discipline" NOT NULL,
    "ageCategory" "AgeCategory" NOT NULL,
    "competitionId" TEXT NOT NULL,
    "horseId" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "achievedMer" BOOLEAN NOT NULL DEFAULT false,
    "merDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Horse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "disciplines" "Discipline"[],
    "passportNo" TEXT,
    "color" TEXT,
    "gender" TEXT,
    "height" DOUBLE PRECISION,
    "registrationNo" TEXT,
    "ownerId" TEXT NOT NULL,
    "mediaUrls" TEXT[],
    "forSale" BOOLEAN NOT NULL DEFAULT false,
    "price" INTEGER,
    "description" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Horse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "organizerId" TEXT NOT NULL,
    "disciplines" "Discipline"[],
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "efiSanctioned" BOOLEAN NOT NULL DEFAULT false,
    "feiSanctioned" BOOLEAN NOT NULL DEFAULT false,
    "bannerUrl" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "maxEntries" INTEGER,
    "entryFee" INTEGER,
    "registrationDeadline" TIMESTAMP(3),
    "rules" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "discipline" "Discipline" NOT NULL,
    "level" "CompetitionLevel" NOT NULL,
    "ageCategory" "AgeCategory",
    "arenaSize" "ArenaSize",
    "format" "CompetitionFormat",
    "testSheetId" TEXT,
    "draw" JSONB,
    "maxJudges" INTEGER NOT NULL DEFAULT 1,
    "startTime" TIMESTAMP(3),
    "status" "CompetitionStatus" NOT NULL DEFAULT 'PENDING',
    "orderOfGo" INTEGER NOT NULL DEFAULT 0,
    "courseLength" INTEGER,
    "obstacles" INTEGER,
    "efforts" INTEGER,
    "speedMPerMin" INTEGER,
    "timeAllowed" INTEGER,
    "heightMin" INTEGER,
    "heightMax" INTEGER,
    "spread" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSheet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discipline" "Discipline" NOT NULL,
    "level" "CompetitionLevel" NOT NULL,
    "ageCategory" "AgeCategory",
    "arenaSize" "ArenaSize" NOT NULL,
    "movements" JSONB NOT NULL,
    "collectiveMarks" JSONB NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "timeAllowed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "horseId" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT,
    "drawNumber" INTEGER,
    "status" "EntryStatus" NOT NULL DEFAULT 'ENTERED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "judgePosition" TEXT,
    "movementMarks" JSONB,
    "collectiveMarks" JSONB,
    "qualityMarks" JSONB,
    "technicalScore" DOUBLE PRECISION,
    "qualityScore" DOUBLE PRECISION,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "errorDeductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "faults" INTEGER,
    "timeFaults" DOUBLE PRECISION,
    "jumpOffFaults" INTEGER,
    "jumpOffTime" DOUBLE PRECISION,
    "roundTime" DOUBLE PRECISION,
    "refusals" INTEGER NOT NULL DEFAULT 0,
    "pegPoints" INTEGER,
    "lanceRuns" JSONB,
    "swordRuns" JSONB,
    "rawScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentage" DOUBLE PRECISION,
    "penalties" DOUBLE PRECISION,
    "finalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isEliminated" BOOLEAN NOT NULL DEFAULT false,
    "eliminationReason" TEXT,
    "achievedMer" BOOLEAN NOT NULL DEFAULT false,
    "isSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "receiptUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stable" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "amenities" TEXT[],
    "capacity" INTEGER NOT NULL,
    "pricePerMonth" INTEGER NOT NULL,
    "mediaUrls" TEXT[],
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "stableId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "stableId" TEXT,
    "horseId" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "horseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "MerRecord_userId_discipline_idx" ON "MerRecord"("userId", "discipline");

-- CreateIndex
CREATE INDEX "MerRecord_userId_ageCategory_idx" ON "MerRecord"("userId", "ageCategory");

-- CreateIndex
CREATE UNIQUE INDEX "Horse_passportNo_key" ON "Horse"("passportNo");

-- CreateIndex
CREATE INDEX "Horse_ownerId_idx" ON "Horse"("ownerId");

-- CreateIndex
CREATE INDEX "Horse_forSale_idx" ON "Horse"("forSale");

-- CreateIndex
CREATE INDEX "Event_organizerId_idx" ON "Event"("organizerId");

-- CreateIndex
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_latitude_longitude_idx" ON "Event"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Competition_eventId_idx" ON "Competition"("eventId");

-- CreateIndex
CREATE INDEX "Competition_discipline_idx" ON "Competition"("discipline");

-- CreateIndex
CREATE INDEX "Competition_status_idx" ON "Competition"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TestSheet_name_level_ageCategory_key" ON "TestSheet"("name", "level", "ageCategory");

-- CreateIndex
CREATE INDEX "Entry_competitionId_idx" ON "Entry"("competitionId");

-- CreateIndex
CREATE INDEX "Entry_userId_idx" ON "Entry"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Entry_userId_horseId_competitionId_key" ON "Entry"("userId", "horseId", "competitionId");

-- CreateIndex
CREATE INDEX "Score_competitionId_idx" ON "Score"("competitionId");

-- CreateIndex
CREATE INDEX "Score_entryId_idx" ON "Score"("entryId");

-- CreateIndex
CREATE INDEX "Score_judgeId_idx" ON "Score"("judgeId");

-- CreateIndex
CREATE UNIQUE INDEX "Score_entryId_judgeId_key" ON "Score"("entryId", "judgeId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_razorpayOrderId_key" ON "Payment"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_razorpayPaymentId_key" ON "Payment"("razorpayPaymentId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Stable_ownerId_idx" ON "Stable"("ownerId");

-- CreateIndex
CREATE INDEX "Stable_latitude_longitude_idx" ON "Stable"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Stable_city_idx" ON "Stable"("city");

-- CreateIndex
CREATE UNIQUE INDEX "Review_stableId_userId_key" ON "Review"("stableId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_horseId_key" ON "Favorite"("userId", "horseId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- AddForeignKey
ALTER TABLE "MerRecord" ADD CONSTRAINT "MerRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerRecord" ADD CONSTRAINT "MerRecord_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerRecord" ADD CONSTRAINT "MerRecord_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "Horse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Horse" ADD CONSTRAINT "Horse_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_testSheetId_fkey" FOREIGN KEY ("testSheetId") REFERENCES "TestSheet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "Horse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stable" ADD CONSTRAINT "Stable_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_stableId_fkey" FOREIGN KEY ("stableId") REFERENCES "Stable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_stableId_fkey" FOREIGN KEY ("stableId") REFERENCES "Stable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "Horse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
