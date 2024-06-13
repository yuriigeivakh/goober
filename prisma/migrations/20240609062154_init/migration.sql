/*
  Warnings:

  - Made the column `driverId` on table `Ride` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Ride" ALTER COLUMN "driverId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
