-- CreateEnum
CREATE TYPE "CameraMode" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('IN', 'OUT');

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "firstname" VARCHAR(50) NOT NULL,
    "lastname" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255),
    "telephone" VARCHAR(20),
    "status" VARCHAR(50),
    "role" VARCHAR(20) NOT NULL DEFAULT 'user',
    "provider" VARCHAR(50),
    "emailVerified" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Car" (
    "car_id" SERIAL NOT NULL,
    "car_brand" VARCHAR(20) NOT NULL,
    "car_model" VARCHAR(20) NOT NULL,
    "car_color" VARCHAR(20),
    "license_plate" VARCHAR(20) NOT NULL,
    "province_plate" VARCHAR(50),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("car_id")
);

-- CreateTable
CREATE TABLE "Camera" (
    "camera_id" SERIAL NOT NULL,
    "camera_name" VARCHAR(20) NOT NULL,
    "camera_mode" "CameraMode" NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Camera_pkey" PRIMARY KEY ("camera_id")
);

-- CreateTable
CREATE TABLE "DetectionLog" (
    "detection_id" SERIAL NOT NULL,
    "detection_license_plate" VARCHAR(20) NOT NULL,
    "detection_province_plate" VARCHAR(30),
    "detection_time" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "image" TEXT,
    "action" "ActionType" NOT NULL,
    "detection_status" VARCHAR(20),
    "camera_id" INTEGER NOT NULL,

    CONSTRAINT "DetectionLog_pkey" PRIMARY KEY ("detection_id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Car_license_plate_key" ON "Car"("license_plate");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetectionLog" ADD CONSTRAINT "DetectionLog_camera_id_fkey" FOREIGN KEY ("camera_id") REFERENCES "Camera"("camera_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
