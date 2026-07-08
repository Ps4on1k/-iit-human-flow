CREATE TABLE "interview_votes" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vote" TEXT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "interview_votes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "interview_votes_candidate_id_user_id_key" ON "interview_votes"("candidate_id", "user_id");
ALTER TABLE "interview_votes" ADD CONSTRAINT "interview_votes_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "interview_votes" ADD CONSTRAINT "interview_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
