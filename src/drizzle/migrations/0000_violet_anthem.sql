DO $$ BEGIN
 CREATE TYPE "public"."aal_level" AS ENUM('aal1', 'aal2', 'aal3');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."action" AS ENUM('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'ERROR');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."code_challenge_method" AS ENUM('s256', 'plain');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."equality_op" AS ENUM('eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'in');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."factor_status" AS ENUM('unverified', 'verified');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."factor_type" AS ENUM('totp', 'webauthn');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."key_status" AS ENUM('default', 'valid', 'invalid', 'expired');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."key_type" AS ENUM('aead-ietf', 'aead-det', 'hmacsha512', 'hmacsha256', 'auth', 'shorthash', 'generichash', 'kdf', 'secretbox', 'secretstream', 'stream_xchacha20');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."Label" AS ENUM('bug', 'feature', 'enhancement', 'documentation');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."MenuStatus" AS ENUM('active', 'inactive');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."MenuType" AS ENUM('menu', 'button', 'dir');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."Priority" AS ENUM('low', 'medium', 'high');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."Status" AS ENUM('todo', 'inProgress', 'done', 'canceled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."Theme" AS ENUM('light', 'dark', 'system');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."UserRole" AS ENUM('user', 'admin', 'superAdmin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."audit_status" AS ENUM('Active', 'InReview', 'PendingClosure', 'Closed', 'Archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."finding_status" AS ENUM('New', 'Assigned', 'InProgress', 'PendingAuditorClosure', 'Completed', 'Rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."action_status" AS ENUM('Assigned', 'PendingManagerApproval', 'Completed', 'Rejected', 'Cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."action_type" AS ENUM('Simple', 'Corrective', 'Preventive');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."activity_type" AS ENUM('Düzeltici', 'Önleyici');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."dof_status" AS ENUM('Step1_Problem', 'Step2_TempMeasures', 'Step3_RootCause', 'Step4_Activities', 'Step5_Implementation', 'Step6_EffectivenessCheck', 'PendingManagerApproval', 'Completed', 'Rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."audit_schedule_status" AS ENUM('Pending', 'Created', 'Cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."audit_schedule_type" AS ENUM('Scheduled', 'Adhoc');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."question_category" AS ENUM('Kalite', 'Çevre', 'İSG', 'Bilgi Güvenliği', 'Gıda Güvenliği', 'Diğer');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."question_type" AS ENUM('YesNo', 'Scale', 'Text', 'SingleChoice', 'Checklist');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."recurrence_type" AS ENUM('None', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."notification_category" AS ENUM('finding_assigned', 'finding_updated', 'action_assigned', 'action_pending_approval', 'action_approved', 'action_rejected', 'dof_assigned', 'dof_pending_approval', 'dof_approved', 'dof_rejected', 'plan_created', 'audit_completed', 'audit_reminder');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."related_entity_type" AS ENUM('finding', 'action', 'dof', 'audit', 'plan');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "NewEmailVerificationToken" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"userId" uuid NOT NULL,
	"token" varchar NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "NewEmailVerificationToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"token" varchar NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "PasswordResetToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "RegisterVerificationToken" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"name" varchar NOT NULL,
	"adminId" uuid NOT NULL,
	"token" varchar NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "RegisterVerificationToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "VerificationToken" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"token" varchar NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "VerificationToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Menu" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" varchar NOT NULL,
	"path" varchar NOT NULL,
	"type" "MenuType" DEFAULT 'menu',
	"status" "MenuStatus" DEFAULT 'active',
	"icon" varchar,
	"parentId" uuid,
	"createBy" uuid,
	"updateBy" uuid,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_menu" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"menu_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar DEFAULT 'user',
	"userRole" "UserRole" DEFAULT 'user',
	"superAdmin" boolean DEFAULT false,
	"userId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar NOT NULL,
	"title" varchar NOT NULL,
	"status" "Status" DEFAULT 'todo' NOT NULL,
	"label" "Label" DEFAULT 'bug' NOT NULL,
	"priority" "Priority" DEFAULT 'low' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"type" varchar NOT NULL,
	"provider" varchar NOT NULL,
	"providerAccountId" varchar NOT NULL,
	"refresh_token" varchar,
	"access_token" varchar,
	"expires_at" integer,
	"token_type" varchar,
	"scope" varchar,
	"id_token" varchar,
	"session_state" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sessionToken" varchar NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar,
	"email" varchar,
	"emailVerified" timestamp,
	"password" varchar NOT NULL,
	"image" varchar,
	"theme" "Theme" DEFAULT 'system',
	"status" "MenuStatus" DEFAULT 'active',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp,
	"deletedById" uuid,
	"createdById" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"audit_date" timestamp,
	"status" "audit_status" DEFAULT 'Active' NOT NULL,
	"auditor_id" uuid,
	"created_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audit_id" uuid,
	"details" text NOT NULL,
	"status" "finding_status" DEFAULT 'New' NOT NULL,
	"risk_type" text,
	"rejection_reason" text,
	"assigned_to_id" uuid,
	"created_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"finding_id" uuid,
	"dof_id" uuid,
	"type" "action_type" DEFAULT 'Simple' NOT NULL,
	"details" text NOT NULL,
	"status" "action_status" DEFAULT 'Assigned' NOT NULL,
	"assigned_to_id" uuid,
	"manager_id" uuid,
	"created_by_id" uuid,
	"completion_notes" text,
	"rejection_reason" text,
	"evidence_urls" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "action_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action_id" uuid NOT NULL,
	"note" text NOT NULL,
	"created_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dof_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dof_id" uuid,
	"description" text NOT NULL,
	"type" "activity_type" NOT NULL,
	"due_date" timestamp,
	"responsible_id" uuid,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dofs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"finding_id" uuid,
	"problem_title" text NOT NULL,
	"problem_details" text,
	"temp_measures" text,
	"root_cause_analysis" text,
	"root_cause_file_url" text,
	"effectiveness_check" text,
	"effectiveness_check_date" timestamp,
	"status" "dof_status" DEFAULT 'Step1_Problem' NOT NULL,
	"assigned_to_id" uuid,
	"manager_id" uuid,
	"created_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"schedule_type" "audit_schedule_type" NOT NULL,
	"status" "audit_schedule_status" DEFAULT 'Pending' NOT NULL,
	"template_id" uuid,
	"auditor_id" uuid,
	"scheduled_date" timestamp,
	"recurrence_type" "recurrence_type" DEFAULT 'None',
	"recurrence_interval" integer DEFAULT 1,
	"next_scheduled_date" timestamp,
	"max_occurrences" integer,
	"occurrence_count" integer DEFAULT 0,
	"created_audit_id" uuid,
	"created_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audit_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"answer" text,
	"notes" text,
	"is_non_compliant" boolean DEFAULT false NOT NULL,
	"answered_by_id" uuid,
	"answered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" "question_category" NOT NULL,
	"question_bank_ids" text NOT NULL,
	"estimated_duration_minutes" text,
	"created_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question_banks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" "question_category" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bank_id" uuid NOT NULL,
	"question_text" text NOT NULL,
	"question_type" "question_type" NOT NULL,
	"help_text" text,
	"checklist_options" text,
	"is_mandatory" boolean DEFAULT true NOT NULL,
	"order_index" text DEFAULT '0' NOT NULL,
	"created_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email_enabled" boolean DEFAULT true NOT NULL,
	"in_app_enabled" boolean DEFAULT true NOT NULL,
	"finding_notifications" boolean DEFAULT true NOT NULL,
	"action_notifications" boolean DEFAULT true NOT NULL,
	"dof_notifications" boolean DEFAULT true NOT NULL,
	"plan_notifications" boolean DEFAULT true NOT NULL,
	"audit_notifications" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "notification_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category" "notification_category" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"related_entity_type" "related_entity_type",
	"related_entity_id" uuid,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"email_sent" boolean DEFAULT false NOT NULL,
	"email_sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Menu" ADD CONSTRAINT "Menu_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Menu"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_menu" ADD CONSTRAINT "user_menu_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_menu" ADD CONSTRAINT "user_menu_menu_id_Menu_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."Menu"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Role" ADD CONSTRAINT "Role_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "User" ADD CONSTRAINT "User_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "User" ADD CONSTRAINT "User_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audits" ADD CONSTRAINT "audits_auditor_id_User_id_fk" FOREIGN KEY ("auditor_id") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audits" ADD CONSTRAINT "audits_created_by_id_User_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "findings" ADD CONSTRAINT "findings_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "findings" ADD CONSTRAINT "findings_assigned_to_id_User_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "findings" ADD CONSTRAINT "findings_created_by_id_User_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "actions" ADD CONSTRAINT "actions_finding_id_findings_id_fk" FOREIGN KEY ("finding_id") REFERENCES "public"."findings"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "actions" ADD CONSTRAINT "actions_dof_id_dofs_id_fk" FOREIGN KEY ("dof_id") REFERENCES "public"."dofs"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "actions" ADD CONSTRAINT "actions_assigned_to_id_User_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "actions" ADD CONSTRAINT "actions_manager_id_User_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "actions" ADD CONSTRAINT "actions_created_by_id_User_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "action_progress" ADD CONSTRAINT "action_progress_action_id_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."actions"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "action_progress" ADD CONSTRAINT "action_progress_created_by_id_User_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dof_activities" ADD CONSTRAINT "dof_activities_dof_id_dofs_id_fk" FOREIGN KEY ("dof_id") REFERENCES "public"."dofs"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dof_activities" ADD CONSTRAINT "dof_activities_responsible_id_User_id_fk" FOREIGN KEY ("responsible_id") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dofs" ADD CONSTRAINT "dofs_finding_id_findings_id_fk" FOREIGN KEY ("finding_id") REFERENCES "public"."findings"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dofs" ADD CONSTRAINT "dofs_assigned_to_id_User_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dofs" ADD CONSTRAINT "dofs_manager_id_User_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dofs" ADD CONSTRAINT "dofs_created_by_id_User_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_plans" ADD CONSTRAINT "audit_plans_template_id_audit_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."audit_templates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_plans" ADD CONSTRAINT "audit_plans_auditor_id_User_id_fk" FOREIGN KEY ("auditor_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_plans" ADD CONSTRAINT "audit_plans_created_audit_id_audits_id_fk" FOREIGN KEY ("created_audit_id") REFERENCES "public"."audits"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_plans" ADD CONSTRAINT "audit_plans_created_by_id_User_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_questions" ADD CONSTRAINT "audit_questions_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_questions" ADD CONSTRAINT "audit_questions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_questions" ADD CONSTRAINT "audit_questions_answered_by_id_User_id_fk" FOREIGN KEY ("answered_by_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_templates" ADD CONSTRAINT "audit_templates_created_by_id_User_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_banks" ADD CONSTRAINT "question_banks_created_by_id_User_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "questions" ADD CONSTRAINT "questions_bank_id_question_banks_id_fk" FOREIGN KEY ("bank_id") REFERENCES "public"."question_banks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "questions" ADD CONSTRAINT "questions_created_by_id_User_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "NewEmailVerificationToken_token_key" ON "NewEmailVerificationToken" ("token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "NewEmailVerificationToken_email_token_key" ON "NewEmailVerificationToken" ("email","token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_token_key" ON "PasswordResetToken" ("token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_email_token_key" ON "PasswordResetToken" ("email","token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "RegisterVerificationToken_token_key" ON "RegisterVerificationToken" ("token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "RegisterVerificationToken_email_token_key" ON "RegisterVerificationToken" ("email","token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken" ("token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_email_token_key" ON "VerificationToken" ("email","token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Role_userId_key" ON "Role" ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Task_code_key" ON "Task" ("code");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account" ("provider","providerAccountId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session" ("sessionToken");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User" ("email");