/*
  Warnings:

  - Added the required column `last_edited` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "last_edited" TIMESTAMP(3) NOT NULL;
