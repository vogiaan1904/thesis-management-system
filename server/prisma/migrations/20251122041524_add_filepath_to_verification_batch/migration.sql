/*
  Warnings:

  - Added the required column `filePath` to the `verification_batches` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "verification_batches" ADD COLUMN     "filePath" TEXT NOT NULL;
