-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPERADMIN';

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "company_id" TEXT;

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "company_id" TEXT;

-- AlterTable
ALTER TABLE "service_requests" ADD COLUMN     "company_id" TEXT;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "company_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "company_id" TEXT;

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inn" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "documents_company_id_idx" ON "documents"("company_id");

-- CreateIndex
CREATE INDEX "employees_company_id_idx" ON "employees"("company_id");

-- CreateIndex
CREATE INDEX "service_requests_company_id_idx" ON "service_requests"("company_id");

-- CreateIndex
CREATE INDEX "tasks_company_id_idx" ON "tasks"("company_id");

-- CreateIndex
CREATE INDEX "users_company_id_idx" ON "users"("company_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
