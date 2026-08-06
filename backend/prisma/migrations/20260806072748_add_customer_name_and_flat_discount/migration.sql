-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FLAT');

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "discountFlatBdt" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENT',
ALTER COLUMN "organizationId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "InvoiceLineItem" ALTER COLUMN "quantity" DROP NOT NULL,
ALTER COLUMN "quantity" SET DATA TYPE TEXT;
