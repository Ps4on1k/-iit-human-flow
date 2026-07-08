-- Add source_id column to candidates
ALTER TABLE "candidates" ADD COLUMN "source_id" TEXT;

-- Add source relation
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;
