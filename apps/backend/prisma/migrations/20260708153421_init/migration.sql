-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('User', 'Assistant');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('Pre', 'InProgress', 'Done');

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "Status" "InterviewStatus" NOT NULL,
    "Score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "MessageType" NOT NULL,
    "InterviewId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_InterviewId_fkey" FOREIGN KEY ("InterviewId") REFERENCES "Interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
