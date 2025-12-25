-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "edx_course_id" TEXT;

-- AlterTable
ALTER TABLE "enrollments" ADD COLUMN     "edx_course_id" TEXT,
ADD COLUMN     "edx_enrolled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "edx_enrolled_at" TIMESTAMP(3),
ADD COLUMN     "edx_enrollment_mode" TEXT DEFAULT 'honor';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "edx_registered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "edx_registered_at" TIMESTAMP(3),
ADD COLUMN     "edx_username" TEXT;
