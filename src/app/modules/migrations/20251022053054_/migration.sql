-- CreateEnum
CREATE TYPE "public"."EParcelType" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "public"."EParcelStatus" AS ENUM ('REQUESTED', 'ACCEPTED', 'STARTED', 'DELIVERED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ETransactionType" AS ENUM ('TOPUP', 'EXPENSE', 'WITHDRAW');

-- CreateEnum
CREATE TYPE "public"."EUserRole" AS ENUM ('USER', 'DRIVER');

-- CreateEnum
CREATE TYPE "public"."EGender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateTable
CREATE TABLE "public"."parcels" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "driver_id" TEXT,
    "pickup_type" TEXT NOT NULL DEFAULT 'Point',
    "pickup_lat" DOUBLE PRECISION NOT NULL,
    "pickup_lng" DOUBLE PRECISION NOT NULL,
    "pickup_address" TEXT,
    "dropoff_type" TEXT NOT NULL DEFAULT 'Point',
    "dropoff_lat" DOUBLE PRECISION NOT NULL,
    "dropoff_lng" DOUBLE PRECISION NOT NULL,
    "dropoff_address" TEXT,
    "status" "public"."EParcelStatus" NOT NULL DEFAULT 'REQUESTED',
    "parcel_type" "public"."EParcelType" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "total_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "processing_driver_id" TEXT,
    "processing_at" TIMESTAMP(3),
    "is_processing" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "parcels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_parcels_helper" (
    "id" TEXT NOT NULL,
    "parcel_id" TEXT NOT NULL,
    "driver_ids" TEXT[],
    "search_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "_parcels_helper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "stripe_transaction_id" TEXT,
    "user_id" TEXT NOT NULL,
    "driver_id" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "public"."ETransactionType" NOT NULL DEFAULT 'TOPUP',
    "payment_method" TEXT NOT NULL DEFAULT 'unknown',

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "role" "public"."EUserRole" NOT NULL DEFAULT 'USER',
    "email" TEXT,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_verification_pending" BOOLEAN,
    "avatar" TEXT NOT NULL DEFAULT '/images/placeholder.png',
    "name" TEXT NOT NULL DEFAULT 'Pathao User',
    "date_of_birth" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gender" "public"."EGender" NOT NULL DEFAULT 'OTHER',
    "nid_photos" TEXT[],
    "driving_license_photos" TEXT[],
    "vehicle_type" TEXT,
    "vehicle_brand" TEXT,
    "vehicle_model" TEXT,
    "vehicle_plate_number" TEXT,
    "vehicle_registration_photos" TEXT[],
    "vehicle_photos" TEXT[],
    "trip_given_count" INTEGER NOT NULL DEFAULT 0,
    "trip_received_count" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "location_type" TEXT DEFAULT 'Point',
    "location_lat" DOUBLE PRECISION,
    "location_lng" DOUBLE PRECISION,
    "location_address" TEXT,
    "is_online" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 100000,
    "total_expend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_income" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parcels_slug_key" ON "public"."parcels"("slug");

-- CreateIndex
CREATE INDEX "parcels_pickup_lat_pickup_lng_idx" ON "public"."parcels"("pickup_lat", "pickup_lng");

-- CreateIndex
CREATE INDEX "parcels_dropoff_lat_dropoff_lng_idx" ON "public"."parcels"("dropoff_lat", "dropoff_lng");

-- CreateIndex
CREATE UNIQUE INDEX "_parcels_helper_parcel_id_key" ON "public"."_parcels_helper"("parcel_id");

-- CreateIndex
CREATE INDEX "users_location_lat_location_lng_idx" ON "public"."users"("location_lat", "location_lng");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_key" ON "public"."wallets"("user_id");

-- AddForeignKey
ALTER TABLE "public"."parcels" ADD CONSTRAINT "parcels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parcels" ADD CONSTRAINT "parcels_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_parcels_helper" ADD CONSTRAINT "_parcels_helper_parcel_id_fkey" FOREIGN KEY ("parcel_id") REFERENCES "public"."parcels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
