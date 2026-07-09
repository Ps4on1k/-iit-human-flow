-- Add interview_id to attachments
ALTER TABLE "attachments" ADD COLUMN "interview_id" TEXT;

-- Add FK for interview attachment
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create activity_logs table
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "context" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "activity_logs_candidate_id_idx" ON "activity_logs"("candidate_id");
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at");
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
