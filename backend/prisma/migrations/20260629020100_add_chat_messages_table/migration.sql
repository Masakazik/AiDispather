CREATE TYPE "ChatMessageDirection" AS ENUM ('INCOMING', 'OUTGOING');

CREATE TABLE "chat_messages" (
  "id" TEXT NOT NULL,
  "company_id" TEXT,
  "building_id" TEXT,
  "external_chat_id" TEXT NOT NULL,
  "external_message_id" TEXT,
  "external_user_id" TEXT,
  "author_name" TEXT,
  "text" TEXT NOT NULL,
  "direction" "ChatMessageDirection" NOT NULL,
  "deleted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "chat_messages_company_id_idx" ON "chat_messages"("company_id");
CREATE INDEX "chat_messages_building_id_idx" ON "chat_messages"("building_id");
CREATE INDEX "chat_messages_external_chat_id_idx" ON "chat_messages"("external_chat_id");
CREATE INDEX "chat_messages_external_message_id_idx" ON "chat_messages"("external_message_id");
CREATE UNIQUE INDEX "chat_messages_external_chat_id_external_message_id_key"
ON "chat_messages"("external_chat_id", "external_message_id");

ALTER TABLE "chat_messages"
ADD CONSTRAINT "chat_messages_company_id_fkey"
FOREIGN KEY ("company_id") REFERENCES "companies"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_messages"
ADD CONSTRAINT "chat_messages_building_id_fkey"
FOREIGN KEY ("building_id") REFERENCES "buildings"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "chat_messages" (
  "id",
  "company_id",
  "building_id",
  "external_chat_id",
  "external_message_id",
  "external_user_id",
  "author_name",
  "text",
  "direction",
  "created_at",
  "updated_at"
)
SELECT
  md5(random()::text || clock_timestamp()::text || sr."id"),
  sr."company_id",
  sr."building_id",
  sr."external_chat_id",
  sr."external_message_id",
  sr."external_user_id",
  COALESCE(NULLIF(sr."resident_name", ''), 'Житель'),
  COALESCE(NULLIF(sr."description", ''), sr."title"),
  'INCOMING'::"ChatMessageDirection",
  sr."created_at",
  sr."updated_at"
FROM "service_requests" sr
WHERE sr."source" = 'MAX'
  AND sr."external_chat_id" IS NOT NULL;
