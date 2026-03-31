-- Phase 5: Production Hardening and Launch
-- Add canonical URL to SEO metadata, contact submissions, analytics, and error monitoring

-- AlterTable: Add canonicalUrl to seo_metadata
ALTER TABLE "seo_metadata" ADD COLUMN "canonicalUrl" VARCHAR(500);

-- CreateEnum: ContactSubmissionStatus
CREATE TYPE "ContactSubmissionStatus" AS ENUM ('DELIVERED', 'FAILED', 'RATE_LIMITED');

-- CreateTable: contact_submissions
CREATE TABLE "contact_submissions" (
    "id" TEXT NOT NULL,
    "senderName" VARCHAR(120) NOT NULL,
    "senderEmail" VARCHAR(254) NOT NULL,
    "message" TEXT NOT NULL,
    "sourceIpHash" VARCHAR(64) NOT NULL,
    "userAgentHash" VARCHAR(64),
    "status" "ContactSubmissionStatus" NOT NULL DEFAULT 'DELIVERED',
    "failureReason" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "contact_submissions_sourceIpHash_createdAt_idx" ON "contact_submissions"("sourceIpHash", "createdAt");
CREATE INDEX "contact_submissions_status_createdAt_idx" ON "contact_submissions"("status", "createdAt");

-- CreateTable: analytics_events
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "pagePath" VARCHAR(300) NOT NULL,
    "referrerHost" VARCHAR(255),
    "sessionHash" VARCHAR(64) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "analytics_events_createdAt_idx" ON "analytics_events"("createdAt");
CREATE INDEX "analytics_events_pagePath_createdAt_idx" ON "analytics_events"("pagePath", "createdAt");
CREATE INDEX "analytics_events_referrerHost_createdAt_idx" ON "analytics_events"("referrerHost", "createdAt");
CREATE INDEX "analytics_events_sessionHash_createdAt_idx" ON "analytics_events"("sessionHash", "createdAt");

-- CreateEnum: ErrorSurface
CREATE TYPE "ErrorSurface" AS ENUM ('PUBLIC', 'ADMIN', 'API');

-- CreateTable: error_events
CREATE TABLE "error_events" (
    "id" TEXT NOT NULL,
    "surface" "ErrorSurface" NOT NULL,
    "pagePath" VARCHAR(300),
    "message" TEXT NOT NULL,
    "stackPreview" TEXT,
    "fingerprint" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "error_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "error_events_surface_createdAt_idx" ON "error_events"("surface", "createdAt");
CREATE INDEX "error_events_createdAt_idx" ON "error_events"("createdAt");
CREATE INDEX "error_events_fingerprint_createdAt_idx" ON "error_events"("fingerprint", "createdAt");

-- CreateEnum: AlertDeliveryStatus
CREATE TYPE "AlertDeliveryStatus" AS ENUM ('SENT', 'FAILED');

-- CreateTable: error_alerts
CREATE TABLE "error_alerts" (
    "id" TEXT NOT NULL,
    "surface" "ErrorSurface" NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "eventCount" INTEGER NOT NULL,
    "deliveryStatus" "AlertDeliveryStatus" NOT NULL,
    "failureReason" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "error_alerts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "error_alerts_surface_createdAt_idx" ON "error_alerts"("surface", "createdAt");
CREATE INDEX "error_alerts_windowStart_windowEnd_idx" ON "error_alerts"("windowStart", "windowEnd");
CREATE INDEX "error_alerts_deliveryStatus_createdAt_idx" ON "error_alerts"("deliveryStatus", "createdAt");
