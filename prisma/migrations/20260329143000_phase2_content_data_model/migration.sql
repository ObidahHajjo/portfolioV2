DROP TABLE IF EXISTS "case_studies";
DROP TABLE IF EXISTS "project_skills";
DROP TABLE IF EXISTS "testimonials";
DROP TABLE IF EXISTS "social_links";
DROP TABLE IF EXISTS "experiences";
DROP TABLE IF EXISTS "seo_metadata";
DROP TABLE IF EXISTS "contact_settings";
DROP TABLE IF EXISTS "profiles";
DROP TABLE IF EXISTS "projects";
DROP TABLE IF EXISTS "skills";
DROP TABLE IF EXISTS "media_assets";
DROP TABLE IF EXISTS "heroes";
DROP TABLE IF EXISTS "abouts";
DROP TABLE IF EXISTS "contact_references";
DROP TABLE IF EXISTS "experience_entries";

CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "singletonKey" TEXT NOT NULL DEFAULT 'singleton',
    "fullName" VARCHAR(100) NOT NULL,
    "tagline" VARCHAR(200) NOT NULL,
    "bio" TEXT NOT NULL,
    "contactEmail" VARCHAR(254) NOT NULL,
    "avatarUrl" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "heroes" (
    "id" TEXT NOT NULL,
    "singletonKey" TEXT NOT NULL DEFAULT 'singleton',
    "headline" VARCHAR(150) NOT NULL,
    "subHeadline" VARCHAR(300) NOT NULL,
    "ctaText" VARCHAR(50) NOT NULL,
    "ctaHref" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "heroes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "contact_settings" (
    "id" TEXT NOT NULL,
    "singletonKey" TEXT NOT NULL DEFAULT 'singleton',
    "contactEmail" VARCHAR(254) NOT NULL,
    "formEnabled" BOOLEAN NOT NULL DEFAULT true,
    "ctaMessage" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "social_links" (
    "id" TEXT NOT NULL,
    "platform" VARCHAR(50) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_links_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "experiences" (
    "id" TEXT NOT NULL,
    "company" VARCHAR(150) NOT NULL,
    "role" VARCHAR(150) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "highlights" TEXT[],
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "proficiency" VARCHAR(50),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "storageUrl" VARCHAR(500) NOT NULL,
    "fileType" VARCHAR(50) NOT NULL,
    "ownerType" VARCHAR(50) NOT NULL,
    "ownerId" VARCHAR(36) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "summary" TEXT NOT NULL,
    "repoUrl" VARCHAR(500),
    "demoUrl" VARCHAR(500),
    "mediaAssetId" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "project_skills" (
    "projectId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "project_skills_pkey" PRIMARY KEY ("projectId", "skillId")
);

CREATE TABLE "case_studies" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "outcomes" TEXT NOT NULL,
    "mediaAssetIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_studies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "authorName" VARCHAR(100) NOT NULL,
    "authorRole" VARCHAR(150) NOT NULL,
    "authorCompany" VARCHAR(150) NOT NULL,
    "quote" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seo_metadata" (
    "id" TEXT NOT NULL,
    "pageSlug" VARCHAR(100) NOT NULL,
    "pageTitle" VARCHAR(70) NOT NULL,
    "metaDescription" VARCHAR(160) NOT NULL,
    "keywords" TEXT[],
    "ogTitle" VARCHAR(70),
    "ogDescription" VARCHAR(200),
    "ogImageUrl" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_metadata_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "profiles_singletonKey_key" ON "profiles"("singletonKey");
CREATE UNIQUE INDEX "heroes_singletonKey_key" ON "heroes"("singletonKey");
CREATE UNIQUE INDEX "contact_settings_singletonKey_key" ON "contact_settings"("singletonKey");
CREATE UNIQUE INDEX "skills_name_category_key" ON "skills"("name", "category");
CREATE UNIQUE INDEX "case_studies_projectId_key" ON "case_studies"("projectId");
CREATE UNIQUE INDEX "seo_metadata_pageSlug_key" ON "seo_metadata"("pageSlug");

CREATE INDEX "social_links_published_isVisible_displayOrder_idx" ON "social_links"("published", "isVisible", "displayOrder");
CREATE INDEX "experiences_published_isVisible_displayOrder_idx" ON "experiences"("published", "isVisible", "displayOrder");
CREATE INDEX "skills_published_isVisible_displayOrder_idx" ON "skills"("published", "isVisible", "displayOrder");
CREATE INDEX "projects_published_isVisible_displayOrder_idx" ON "projects"("published", "isVisible", "displayOrder");
CREATE INDEX "testimonials_published_isVisible_displayOrder_idx" ON "testimonials"("published", "isVisible", "displayOrder");

ALTER TABLE "projects"
    ADD CONSTRAINT "projects_mediaAssetId_fkey"
    FOREIGN KEY ("mediaAssetId") REFERENCES "media_assets"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "project_skills"
    ADD CONSTRAINT "project_skills_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "project_skills"
    ADD CONSTRAINT "project_skills_skillId_fkey"
    FOREIGN KEY ("skillId") REFERENCES "skills"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "case_studies"
    ADD CONSTRAINT "case_studies_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
