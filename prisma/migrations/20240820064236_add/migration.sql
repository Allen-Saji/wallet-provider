/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `EthWallet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `SolWallet` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "EthWallet" ADD COLUMN     "name" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "SolWallet" ADD COLUMN     "name" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "EthWallet_name_key" ON "EthWallet"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SolWallet_name_key" ON "SolWallet"("name");
