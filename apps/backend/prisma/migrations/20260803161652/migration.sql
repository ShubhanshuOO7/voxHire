/*
  Warnings:

  - A unique constraint covering the columns `[githubUrl]` on the table `Interview` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `githubUrl` to the `Interview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "githubUrl" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Interview_githubUrl_key" ON "Interview"("githubUrl");
