-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('NEW', 'MATCHED', 'CLOSED');

-- AlterTable
ALTER TABLE "TutoringRequest"
ADD COLUMN "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN "sourceListingId" TEXT,
ADD COLUMN "assignedListingId" TEXT;

-- AddForeignKey
ALTER TABLE "TutoringRequest" ADD CONSTRAINT "TutoringRequest_sourceListingId_fkey" FOREIGN KEY ("sourceListingId") REFERENCES "TutorListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutoringRequest" ADD CONSTRAINT "TutoringRequest_assignedListingId_fkey" FOREIGN KEY ("assignedListingId") REFERENCES "TutorListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
