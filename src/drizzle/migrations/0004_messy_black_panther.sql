DO $$ BEGIN
 CREATE TYPE "public"."SyncMode" AS ENUM('Full', 'Delta', 'Selective');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."SyncSourceType" AS ENUM('LDAP', 'CSV', 'REST_API', 'WEBHOOK', 'MANUAL');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."SyncStatus" AS ENUM('Pending', 'InProgress', 'Completed', 'Failed', 'PartialSuccess');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."UserSyncAction" AS ENUM('Create', 'Update', 'Deactivate', 'Reactivate', 'Skip', 'Error');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ExternalUserMapping" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"sourceType" "SyncSourceType" NOT NULL,
	"externalId" varchar(255) NOT NULL,
	"externalEmail" varchar(255),
	"metadata" json,
	"lastSyncedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "HRSyncConfig" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"sourceType" "SyncSourceType" NOT NULL,
	"config" json NOT NULL,
	"fieldMapping" json NOT NULL,
	"syncMode" "SyncMode" DEFAULT 'Full' NOT NULL,
	"autoSync" boolean DEFAULT false,
	"syncSchedule" varchar(100),
	"syncFilter" json,
	"isActive" boolean DEFAULT true NOT NULL,
	"lastSyncAt" timestamp,
	"nextSyncAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"createdById" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "HRSyncLog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"configId" uuid,
	"sourceType" "SyncSourceType" NOT NULL,
	"syncMode" "SyncMode" NOT NULL,
	"status" "SyncStatus" DEFAULT 'Pending' NOT NULL,
	"totalRecords" integer DEFAULT 0,
	"successCount" integer DEFAULT 0,
	"failedCount" integer DEFAULT 0,
	"skippedCount" integer DEFAULT 0,
	"errorMessage" text,
	"errorDetails" json,
	"startedAt" timestamp,
	"completedAt" timestamp,
	"duration" integer,
	"metadata" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"triggeredBy" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserSyncRecord" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"syncLogId" uuid NOT NULL,
	"userId" uuid,
	"externalId" varchar(255),
	"action" "UserSyncAction" NOT NULL,
	"sourceData" json,
	"mappedData" json,
	"success" boolean NOT NULL,
	"errorMessage" text,
	"changes" json,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ExternalUserMapping" ADD CONSTRAINT "ExternalUserMapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "HRSyncConfig" ADD CONSTRAINT "HRSyncConfig_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "HRSyncLog" ADD CONSTRAINT "HRSyncLog_configId_fkey" FOREIGN KEY ("configId") REFERENCES "public"."HRSyncConfig"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "HRSyncLog" ADD CONSTRAINT "HRSyncLog_triggeredBy_fkey" FOREIGN KEY ("triggeredBy") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserSyncRecord" ADD CONSTRAINT "UserSyncRecord_syncLogId_fkey" FOREIGN KEY ("syncLogId") REFERENCES "public"."HRSyncLog"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserSyncRecord" ADD CONSTRAINT "UserSyncRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
