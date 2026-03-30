-- AlterTable
ALTER TABLE "case_studies" ALTER COLUMN "projectId" DROP NOT NULL,
ADD COLUMN "architectureNotes" TEXT,
ADD COLUMN "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "slug" VARCHAR(150),
ADD COLUMN "title" VARCHAR(200);

UPDATE "case_studies" SET slug = 'case-study-' || id, title = 'Untitled' WHERE slug IS NULL;

ALTER TABLE "case_studies" ALTER COLUMN "slug" SET NOT NULL, ALTER COLUMN "title" SET NOT NULL;

CREATE UNIQUE INDEX "case_studies_slug_key" ON "case_studies"("slug");

-- CreateIndex
CREATE INDEX "case_studies_published_isVisible_displayOrder_idx" ON "case_studies"("published", "isVisible", "displayOrder" ASC);

-- AlterTable
ALTER TABLE "testimonials" ADD COLUMN "avatarUrl" VARCHAR(500),
ALTER COLUMN "authorCompany" DROP NOT NULL;

-- CreateTable
CREATE TABLE "case_study_metrics" (
    "id" TEXT NOT NULL,
    "caseStudyId" TEXT NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "value" VARCHAR(100) NOT NULL,
    "unit" VARCHAR(50),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "case_study_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "case_study_metrics_caseStudyId_displayOrder_idx" ON "case_study_metrics"("caseStudyId", "displayOrder" ASC);

-- AddForeignKey
ALTER TABLE "case_study_metrics" ADD CONSTRAINT "case_study_metrics_caseStudyId_fkey" FOREIGN KEY ("caseStudyId") REFERENCES "case_studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "cv_assets" (
    "id" TEXT NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "storageKey" VARCHAR(500) NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "cv_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "summary" TEXT NOT NULL,
    "externalUrl" VARCHAR(500) NOT NULL,
    "publishedAt" TIMESTAMPTZ,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "articles_published_isVisible_displayOrder_idx" ON "articles"("published", "isVisible", "displayOrder" ASC);

-- CreateTable
CREATE TABLE "open_source_contributions" (
    "id" TEXT NOT NULL,
    "projectName" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "contributionType" VARCHAR(100) NOT NULL,
    "repositoryUrl" VARCHAR(500),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "open_source_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "open_source_contributions_published_isVisible_displayOrder_idx" ON "open_source_contributions"("published", "isVisible", "displayOrder" ASC);

-- CreateTable
CREATE TABLE "talks" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "eventName" VARCHAR(200) NOT NULL,
    "talkDate" TIMESTAMPTZ NOT NULL,
    "summary" TEXT NOT NULL,
    "recordingUrl" VARCHAR(500),
    "slidesUrl" VARCHAR(500),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "talks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "talks_published_isVisible_displayOrder_idx" ON "talks"("published", "isVisible", "displayOrder" ASC);

-- CreateTable
CREATE TABLE "section_visibility" (
    "id" TEXT NOT NULL,
    "section" VARCHAR(50) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "section_visibility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "section_visibility_section_key" ON "section_visibility"("section");

-- Drop existing foreign key and recreate with SET NULL
ALTER TABLE "case_studies" DROP CONSTRAINT IF EXISTS "case_studies_projectId_fkey";
ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
