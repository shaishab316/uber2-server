-- AlterTable
ALTER TABLE "public"."parcels" ADD COLUMN     "location_address" TEXT,
ADD COLUMN     "location_lat" DOUBLE PRECISION,
ADD COLUMN     "location_lng" DOUBLE PRECISION,
ADD COLUMN     "location_type" TEXT DEFAULT 'Point';
