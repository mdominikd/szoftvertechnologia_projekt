/*
  Warnings:

  - You are about to drop the column `quantity` on the `bin` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `pickitem` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `projectpart` table. All the data in the column will be lost.
  - Added the required column `quanity` to the `PickItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quanity` to the `ProjectPart` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bin` DROP COLUMN `quantity`,
    ADD COLUMN `quanity` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `pickitem` DROP COLUMN `quantity`,
    ADD COLUMN `quanity` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `projectpart` DROP COLUMN `quantity`,
    ADD COLUMN `quanity` INTEGER NOT NULL;
