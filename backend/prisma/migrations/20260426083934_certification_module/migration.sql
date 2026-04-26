-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'student';

-- CreateTable
CREATE TABLE "certification_projects" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "duration_weeks" INTEGER NOT NULL DEFAULT 4,
    "short_description" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnail" TEXT,
    "banner_label" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "eligibility" TEXT NOT NULL DEFAULT 'Certification Eligible',
    "base_price" INTEGER NOT NULL DEFAULT 0,
    "platform_fee" INTEGER NOT NULL DEFAULT 55,
    "popular_score" INTEGER NOT NULL DEFAULT 0,
    "certificate_eligible" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certification_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_plans" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT,
    "duration_label" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_recommended" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certification_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_section_items" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "section_key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "step_number" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certification_section_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_mentors" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "avatar_url" TEXT,
    "bio" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certification_mentors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_mentor_slots" (
    "id" SERIAL NOT NULL,
    "mentor_id" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certification_mentor_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_coupons" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER,
    "code" TEXT NOT NULL,
    "discount_type" TEXT NOT NULL DEFAULT 'fixed',
    "amount" INTEGER NOT NULL,
    "min_amount" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3),
    "usage_limit" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certification_coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_orders" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "coupon_id" INTEGER,
    "coupon_code" TEXT,
    "base_price" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "platform_fee" INTEGER NOT NULL DEFAULT 0,
    "total_amount" INTEGER NOT NULL,
    "razorpay_order_id" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'created',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certification_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_payments" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "razorpay_payment_id" TEXT NOT NULL,
    "razorpay_signature" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'success',
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certification_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_enrollments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "order_id" INTEGER,
    "coupon_code" TEXT,
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "status" TEXT NOT NULL DEFAULT 'enrolled',
    "base_price" INTEGER NOT NULL DEFAULT 0,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "platform_fee" INTEGER NOT NULL DEFAULT 0,
    "final_payable" INTEGER NOT NULL DEFAULT 0,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certification_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_submissions" (
    "id" SERIAL NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "design_doc_url" TEXT,
    "design_doc_name" TEXT,
    "requirements_doc_url" TEXT,
    "requirements_doc_name" TEXT,
    "github_link" TEXT,
    "demo_link" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "marks" INTEGER,
    "review_notes" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certification_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_evaluations" (
    "id" SERIAL NOT NULL,
    "submission_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "feedback" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "score" INTEGER,
    "reviewer_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certification_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_mentor_bookings" (
    "id" SERIAL NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "mentor_id" INTEGER NOT NULL,
    "slot_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'booked',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certification_mentor_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_certificates" (
    "id" SERIAL NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "certificate_url" TEXT,
    "verification_code" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certification_projects_slug_key" ON "certification_projects"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "certification_coupons_code_key" ON "certification_coupons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "certification_orders_razorpay_order_id_key" ON "certification_orders"("razorpay_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "certification_payments_order_id_key" ON "certification_payments"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "certification_payments_razorpay_payment_id_key" ON "certification_payments"("razorpay_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "certification_enrollments_order_id_key" ON "certification_enrollments"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "certification_enrollments_user_id_project_id_key" ON "certification_enrollments"("user_id", "project_id");

-- CreateIndex
CREATE UNIQUE INDEX "certification_mentor_bookings_slot_id_key" ON "certification_mentor_bookings"("slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_certificates_enrollment_id_key" ON "project_certificates"("enrollment_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_certificates_verification_code_key" ON "project_certificates"("verification_code");

-- AddForeignKey
ALTER TABLE "certification_plans" ADD CONSTRAINT "certification_plans_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "certification_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_section_items" ADD CONSTRAINT "certification_section_items_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "certification_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_mentors" ADD CONSTRAINT "certification_mentors_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "certification_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_mentor_slots" ADD CONSTRAINT "certification_mentor_slots_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "certification_mentors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_coupons" ADD CONSTRAINT "certification_coupons_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "certification_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_orders" ADD CONSTRAINT "certification_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_orders" ADD CONSTRAINT "certification_orders_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "certification_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_orders" ADD CONSTRAINT "certification_orders_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "certification_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_orders" ADD CONSTRAINT "certification_orders_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "certification_coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_payments" ADD CONSTRAINT "certification_payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "certification_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_enrollments" ADD CONSTRAINT "certification_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_enrollments" ADD CONSTRAINT "certification_enrollments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "certification_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_enrollments" ADD CONSTRAINT "certification_enrollments_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "certification_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_enrollments" ADD CONSTRAINT "certification_enrollments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "certification_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_submissions" ADD CONSTRAINT "certification_submissions_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "certification_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_submissions" ADD CONSTRAINT "certification_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_submissions" ADD CONSTRAINT "certification_submissions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "certification_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_evaluations" ADD CONSTRAINT "certification_evaluations_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "certification_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_mentor_bookings" ADD CONSTRAINT "certification_mentor_bookings_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "certification_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_mentor_bookings" ADD CONSTRAINT "certification_mentor_bookings_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "certification_mentors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_mentor_bookings" ADD CONSTRAINT "certification_mentor_bookings_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "certification_mentor_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_mentor_bookings" ADD CONSTRAINT "certification_mentor_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_certificates" ADD CONSTRAINT "project_certificates_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "certification_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_certificates" ADD CONSTRAINT "project_certificates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_certificates" ADD CONSTRAINT "project_certificates_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "certification_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
