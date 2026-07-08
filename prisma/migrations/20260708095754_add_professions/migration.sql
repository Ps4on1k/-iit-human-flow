-- AlterTable
ALTER TABLE "candidates" ADD COLUMN     "profession_id" TEXT;

-- AlterTable: Add description and updated_at with default for existing rows
ALTER TABLE "departments" ADD COLUMN     "description" TEXT;
ALTER TABLE "departments" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "professions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "professions_name_key" ON "professions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "professions_code_key" ON "professions"("code");

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_profession_id_fkey" FOREIGN KEY ("profession_id") REFERENCES "professions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
