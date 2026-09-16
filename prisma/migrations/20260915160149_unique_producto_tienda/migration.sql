/*
  Warnings:

  - A unique constraint covering the columns `[normalized,storeId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Product_normalized_storeId_key" ON "Product"("normalized", "storeId");
