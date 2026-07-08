-- CreateEnum
CREATE TYPE "AuthScope" AS ENUM ('CLIENT', 'ADMIN');

-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "scope" "AuthScope" NOT NULL DEFAULT 'CLIENT';
