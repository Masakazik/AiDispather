-- Remove WAITING from RequestStatus enum.
-- Existing WAITING rows are migrated to ASSIGNED.

ALTER TABLE "service_requests"
ALTER COLUMN "status" DROP DEFAULT;

UPDATE "service_requests"
SET "status" = 'ASSIGNED'
WHERE "status" = 'WAITING';

ALTER TABLE "service_requests"
ALTER COLUMN "status" TYPE TEXT
USING "status"::TEXT;

DROP TYPE "RequestStatus";

CREATE TYPE "RequestStatus" AS ENUM (
  'NEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'DONE',
  'CLOSED'
);

ALTER TABLE "service_requests"
ALTER COLUMN "status" TYPE "RequestStatus"
USING "status"::"RequestStatus";

ALTER TABLE "service_requests"
ALTER COLUMN "status" SET DEFAULT 'NEW';
