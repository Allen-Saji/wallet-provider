/*
  Warnings:

  - You are about to drop the `EthWallet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SolWallet` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EthWallet" DROP CONSTRAINT "EthWallet_userId_fkey";

-- DropForeignKey
ALTER TABLE "SolWallet" DROP CONSTRAINT "SolWallet_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "seedPhrase" TEXT;

-- DropTable
DROP TABLE "EthWallet";

-- DropTable
DROP TABLE "SolWallet";

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "derivationPath" TEXT NOT NULL,
    "solPublicKey" TEXT,
    "ethPublicKey" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
