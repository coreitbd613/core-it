/*
  Warnings:

  - You are about to drop the `HostingOrder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "HostingOrder" DROP CONSTRAINT "HostingOrder_userId_fkey";

-- DropTable
DROP TABLE "HostingOrder";

-- DropEnum
DROP TYPE "HostingOrderStatus";
