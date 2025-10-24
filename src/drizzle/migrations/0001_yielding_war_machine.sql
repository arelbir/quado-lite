CREATE TABLE IF NOT EXISTS "Branch" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"type" varchar(50) DEFAULT 'Branch',
	"country" varchar(100),
	"city" varchar(100),
	"address" text,
	"phone" varchar(50),
	"managerId" uuid,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp,
	"createdById" uuid,
	"deletedById" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Company" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"legalName" varchar(500),
	"taxNumber" varchar(50),
	"country" varchar(100),
	"city" varchar(100),
	"address" text,
	"phone" varchar(50),
	"email" varchar(255),
	"website" varchar(255),
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp,
	"createdById" uuid,
	"deletedById" uuid,
	CONSTRAINT "Company_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Department" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branchId" uuid,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"parentDepartmentId" uuid,
	"managerId" uuid,
	"costCenter" varchar(50),
	"budget" varchar(100),
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp,
	"createdById" uuid,
	"deletedById" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Position" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"level" varchar(10),
	"category" varchar(100),
	"salaryGrade" varchar(50),
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp,
	"createdById" uuid,
	"deletedById" uuid,
	CONSTRAINT "Position_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "companyId" uuid;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "branchId" uuid;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "departmentId" uuid;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "positionId" uuid;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "managerId" uuid;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "employeeNumber" varchar(50);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "hireDate" timestamp;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "terminationDate" timestamp;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "employmentType" varchar(50);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "workLocation" varchar(50);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "phoneNumber" varchar(50);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "mobileNumber" varchar(50);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "emergencyContact" varchar(255);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "timezone" varchar(50);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "locale" varchar(10);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Branch" ADD CONSTRAINT "Branch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Branch" ADD CONSTRAINT "Branch_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Branch" ADD CONSTRAINT "Branch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Branch" ADD CONSTRAINT "Branch_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Company" ADD CONSTRAINT "Company_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Company" ADD CONSTRAINT "Company_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Department" ADD CONSTRAINT "Department_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Department" ADD CONSTRAINT "Department_parentId_fkey" FOREIGN KEY ("parentDepartmentId") REFERENCES "public"."Department"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Department" ADD CONSTRAINT "Department_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Department" ADD CONSTRAINT "Department_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Department" ADD CONSTRAINT "Department_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Position" ADD CONSTRAINT "Position_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Position" ADD CONSTRAINT "Position_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "User_employeeNumber_key" ON "User" ("employeeNumber");