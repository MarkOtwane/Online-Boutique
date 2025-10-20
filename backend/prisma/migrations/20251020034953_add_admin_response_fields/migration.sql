-- AlterTable
ALTER TABLE "public"."Comment" ADD COLUMN     "isAdminResponse" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOfficialResponse" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Comment_isAdminResponse_idx" ON "public"."Comment"("isAdminResponse");

-- CreateIndex
CREATE INDEX "Comment_isOfficialResponse_idx" ON "public"."Comment"("isOfficialResponse");
