-- CreateTable
CREATE TABLE "ProjectSequence" (
    "year" INTEGER NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectSequence_pkey" PRIMARY KEY ("year")
);

-- AlterTable: add projectCode as nullable first so existing rows can be backfilled
ALTER TABLE "Project" ADD COLUMN "projectCode" TEXT;

-- Backfill existing rows with a per-year sequential code, ordered by createdAt
WITH numbered AS (
    SELECT "id",
           EXTRACT(YEAR FROM "createdAt")::int AS "year",
           ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM "createdAt") ORDER BY "createdAt") AS "rn"
    FROM "Project"
)
UPDATE "Project" p
SET "projectCode" = 'PRJ-' || numbered."year"::text || '-' || LPAD(numbered."rn"::text, 3, '0')
FROM numbered
WHERE p."id" = numbered."id";

-- Seed ProjectSequence so future codes continue from the highest backfilled number per year
INSERT INTO "ProjectSequence" ("year", "lastNumber")
SELECT EXTRACT(YEAR FROM "createdAt")::int, COUNT(*)::int
FROM "Project"
GROUP BY EXTRACT(YEAR FROM "createdAt")::int
ON CONFLICT ("year") DO UPDATE SET "lastNumber" = EXCLUDED."lastNumber";

-- Now that every row has a value, enforce NOT NULL + uniqueness
ALTER TABLE "Project" ALTER COLUMN "projectCode" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Project_projectCode_key" ON "Project"("projectCode");
