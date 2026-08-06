/*
  Warnings:

  - A unique constraint covering the columns `[featuredProductId]` on the table `Store` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "featuredProductId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Store_featuredProductId_key" ON "Store"("featuredProductId");

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_featuredProductId_fkey" FOREIGN KEY ("featuredProductId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
