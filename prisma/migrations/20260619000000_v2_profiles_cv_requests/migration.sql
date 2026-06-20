-- AlterTable
ALTER TABLE "TeacherProfile"
ADD COLUMN "phone" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "experienceYears" INTEGER,
ADD COLUMN "diploma" TEXT,
ADD COLUMN "cvFileName" TEXT,
ADD COLUMN "cvMimeType" TEXT,
ADD COLUMN "cvSize" INTEGER,
ADD COLUMN "cvReceivedAt" TIMESTAMP(3),
ADD COLUMN "applicationEmailSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ParentProfile"
ADD COLUMN "phone" TEXT;

-- AlterTable
ALTER TABLE "TutoringRequest"
ADD COLUMN "studentName" TEXT,
ADD COLUMN "contactPhone" TEXT,
ADD COLUMN "preferredContact" TEXT;
