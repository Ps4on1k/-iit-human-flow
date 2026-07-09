-- CreateTable
CREATE TABLE "user_tag_visibility" (
    "user_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "user_tag_visibility_pkey" PRIMARY KEY ("user_id","tag_id")
);

-- AddForeignKey
ALTER TABLE "user_tag_visibility" ADD CONSTRAINT "user_tag_visibility_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tag_visibility" ADD CONSTRAINT "user_tag_visibility_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
