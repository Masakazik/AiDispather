-- AlterTable
ALTER TABLE "service_requests" ADD COLUMN "external_user_id" TEXT;

-- CreateIndex
CREATE INDEX "service_requests_external_chat_id_external_user_id_idx" ON "service_requests"("external_chat_id", "external_user_id");
