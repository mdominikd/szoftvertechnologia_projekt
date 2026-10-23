/*
  Warnings:

  - You are about to drop the column `quanity` on the `bin` table. All the data in the column will be lost.
  - You are about to drop the column `quanity` on the `pickitem` table. All the data in the column will be lost.
  - You are about to drop the column `quanity` on the `projectpart` table. All the data in the column will be lost.
  - Added the required column `quantity` to the `PickItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `ProjectPart` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bin` DROP COLUMN `quanity`,
    ADD COLUMN `quantity` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `pickitem` DROP COLUMN `quanity`,
    ADD COLUMN `quantity` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `projectpart` DROP COLUMN `quanity`,
    ADD COLUMN `quantity` INTEGER NOT NULL;
