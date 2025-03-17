/*
  Warnings:

  - You are about to drop the column `image` on the `DetectionLog` table. All the data in the column will be lost.
  - Changed the type of `camera_mode` on the `Camera` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `action` on the `DetectionLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Camera" DROP COLUMN "camera_mode",
ADD COLUMN     "camera_mode" VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE "DetectionLog" DROP COLUMN "image",
ADD COLUMN     "image_base64" TEXT,
DROP COLUMN "action",
ADD COLUMN     "action" VARCHAR(20) NOT NULL;

-- DropEnum
DROP TYPE "ActionType";

-- DropEnum
DROP TYPE "CameraMode";
