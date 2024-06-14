/*
  Warnings:

  - The primary key for the `Ride` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dropoffLocation` on the `Ride` table. All the data in the column will be lost.
  - You are about to drop the column `fare` on the `Ride` table. All the data in the column will be lost.
  - You are about to drop the column `pickupLocation` on the `Ride` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `distance` to the `Ride` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dropoffAddress` to the `Ride` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimatedTime` to the `Ride` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupAddress` to the `Ride` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Ride` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Ride` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('PENDING', 'REJECTED', 'IN_PROGRESS', 'CANCELLED', 'FINISHED');

-- DropForeignKey
ALTER TABLE "Ride" DROP CONSTRAINT "Ride_driverId_fkey";

-- DropForeignKey
ALTER TABLE "Ride" DROP CONSTRAINT "Ride_userId_fkey";

-- AlterTable
ALTER TABLE "Ride" DROP CONSTRAINT "Ride_pkey",
DROP COLUMN "dropoffLocation",
DROP COLUMN "fare",
DROP COLUMN "pickupLocation",
ADD COLUMN     "distance" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "dropoffAddress" TEXT NOT NULL,
ADD COLUMN     "dropoffLat" DOUBLE PRECISION,
ADD COLUMN     "dropoffLong" DOUBLE PRECISION,
ADD COLUMN     "estimatedTime" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "pickupAddress" TEXT NOT NULL,
ADD COLUMN     "pickupLat" DOUBLE PRECISION,
ADD COLUMN     "pickupLong" DOUBLE PRECISION,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "driverId" DROP NOT NULL,
ALTER COLUMN "driverId" SET DATA TYPE TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "RideStatus" NOT NULL,
ADD CONSTRAINT "Ride_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Ride_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
