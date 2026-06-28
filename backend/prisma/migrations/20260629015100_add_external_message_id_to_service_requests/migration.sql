ALTER TABLE "service_requests"
ADD COLUMN "external_message_id" TEXT;

CREATE INDEX "service_requests_external_message_id_idx"
ON "service_requests"("external_message_id");
