-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "batchDate" TIMESTAMP(3),
ADD COLUMN     "batchQuantity" INTEGER,
ADD COLUMN     "isDailyDrop" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quantitySold" INTEGER NOT NULL DEFAULT 0;
