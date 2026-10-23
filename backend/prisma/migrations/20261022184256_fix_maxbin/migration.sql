/*
  Warnings:

  - You are about to drop the column `MaxPerBin` on the `part` table. All the data in the column will be lost.
  - Added the required column `maxPerBin` to the `Part` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `part` DROP COLUMN `MaxPerBin`,
    ADD COLUMN `maxPerBin` INTEGER NOT NULL;
