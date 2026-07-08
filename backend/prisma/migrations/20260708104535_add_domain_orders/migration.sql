-- CreateEnum
CREATE TYPE "DomainOrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'REJECTED');

-- CreateTable
CREATE TABLE "DomainOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domainName" TEXT NOT NULL,
    "tld" TEXT NOT NULL,
    "years" INTEGER NOT NULL DEFAULT 1,
    "priceUsd" DECIMAL(65,30) NOT NULL,
    "priceBdt" DECIMAL(65,30) NOT NULL,
    "exchangeRate" DECIMAL(65,30) NOT NULL,
    "status" "DomainOrderStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "registrantFirstName" TEXT NOT NULL,
    "registrantLastName" TEXT NOT NULL,
    "registrantAddress1" TEXT NOT NULL,
    "registrantAddress2" TEXT,
    "registrantCity" TEXT NOT NULL,
    "registrantStateProvince" TEXT NOT NULL,
    "registrantPostalCode" TEXT NOT NULL,
    "registrantCountry" TEXT NOT NULL,
    "registrantPhone" TEXT NOT NULL,
    "registrantEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomainOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DomainOrder_userId_idx" ON "DomainOrder"("userId");

-- CreateIndex
CREATE INDEX "DomainOrder_status_idx" ON "DomainOrder"("status");

-- AddForeignKey
ALTER TABLE "DomainOrder" ADD CONSTRAINT "DomainOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
