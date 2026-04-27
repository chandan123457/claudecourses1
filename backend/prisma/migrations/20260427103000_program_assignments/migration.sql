-- CreateTable
CREATE TABLE "program_assignments" (
    "id" SERIAL NOT NULL,
    "module_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "due_date" TIMESTAMP(3),
    "allow_file_upload" BOOLEAN NOT NULL DEFAULT true,
    "allow_github_link" BOOLEAN NOT NULL DEFAULT false,
    "allow_resubmission" BOOLEAN NOT NULL DEFAULT false,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_assignment_submissions" (
    "id" SERIAL NOT NULL,
    "assignment_id" INTEGER NOT NULL,
    "module_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "file_url" TEXT,
    "file_name" TEXT,
    "github_link" TEXT,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_assignment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_assignment_comments" (
    "id" SERIAL NOT NULL,
    "submission_id" INTEGER NOT NULL,
    "assignment_id" INTEGER NOT NULL,
    "module_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_assignment_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "program_assignments_module_id_key" ON "program_assignments"("module_id");

-- CreateIndex
CREATE INDEX "program_assignment_submissions_assignment_id_user_id_idx" ON "program_assignment_submissions"("assignment_id", "user_id");

-- CreateIndex
CREATE INDEX "program_assignment_submissions_module_id_idx" ON "program_assignment_submissions"("module_id");

-- CreateIndex
CREATE INDEX "program_assignment_submissions_user_id_idx" ON "program_assignment_submissions"("user_id");

-- CreateIndex
CREATE INDEX "program_assignment_comments_submission_id_idx" ON "program_assignment_comments"("submission_id");

-- CreateIndex
CREATE INDEX "program_assignment_comments_assignment_id_user_id_idx" ON "program_assignment_comments"("assignment_id", "user_id");

-- CreateIndex
CREATE INDEX "program_assignment_comments_module_id_idx" ON "program_assignment_comments"("module_id");

-- AddForeignKey
ALTER TABLE "program_assignments" ADD CONSTRAINT "program_assignments_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "program_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_assignment_submissions" ADD CONSTRAINT "program_assignment_submissions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "program_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_assignment_submissions" ADD CONSTRAINT "program_assignment_submissions_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "program_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_assignment_submissions" ADD CONSTRAINT "program_assignment_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_assignment_comments" ADD CONSTRAINT "program_assignment_comments_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "program_assignment_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_assignment_comments" ADD CONSTRAINT "program_assignment_comments_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "program_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_assignment_comments" ADD CONSTRAINT "program_assignment_comments_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "program_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_assignment_comments" ADD CONSTRAINT "program_assignment_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
