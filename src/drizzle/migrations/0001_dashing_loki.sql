CREATE TABLE IF NOT EXISTS "RoleMenus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roleId" uuid NOT NULL,
	"menuId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"createdById" uuid,
	CONSTRAINT "RoleMenus_roleId_menuId_unique" UNIQUE("roleId","menuId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RoleMenus" ADD CONSTRAINT "RoleMenus_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Roles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RoleMenus" ADD CONSTRAINT "RoleMenus_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "public"."Menu"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RoleMenus" ADD CONSTRAINT "RoleMenus_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
