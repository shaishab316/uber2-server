-- DropIndex
DROP INDEX "public"."reviews_reviewer_id_user_id_key";

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "ref_parcel_id" TEXT;
