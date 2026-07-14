-- CreateEnum
CREATE TYPE "HostingOrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'REJECTED');

-- CreateTable
CREATE TABLE "HostingOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planSlug" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "vcpu" INTEGER NOT NULL,
    "ramGb" INTEGER NOT NULL,
    "storageGb" INTEGER NOT NULL,
    "bandwidthTb" INTEGER NOT NULL,
    "priceUsd" DECIMAL(65,30) NOT NULL,
    "priceBdt" DECIMAL(65,30) NOT NULL,
    "status" "HostingOrderStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostingOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HostingOrder_userId_idx" ON "HostingOrder"("userId");

-- CreateIndex
CREATE INDEX "HostingOrder_status_idx" ON "HostingOrder"("status");

-- AddForeignKey
ALTER TABLE "HostingOrder" ADD CONSTRAINT "HostingOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
