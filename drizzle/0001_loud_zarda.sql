CREATE TYPE "public"."organization_visibility" AS ENUM('shared', 'personal');--> statement-breakpoint
CREATE TYPE "public"."organization_recurrence_type" AS ENUM('none', 'daily', 'weekly', 'monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."organization_task_status" AS ENUM('pending', 'completed', 'archived');--> statement-breakpoint
CREATE TABLE "organization_labels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"space_id" uuid NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#64748B' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "organization_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"space_id" uuid NOT NULL,
	"project_id" uuid,
	"task_id" uuid,
	"title" text NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"visibility" "organization_visibility" DEFAULT 'shared' NOT NULL,
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "organization_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"space_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#10B981' NOT NULL,
	"icon" text DEFAULT 'folder' NOT NULL,
	"visibility" "organization_visibility" DEFAULT 'shared' NOT NULL,
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "organization_project_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "organization_task_labels" (
	"task_id" uuid NOT NULL,
	"label_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_task_labels_task_id_label_id_pk" PRIMARY KEY("task_id","label_id")
);
--> statement-breakpoint
CREATE TABLE "organization_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"space_id" uuid NOT NULL,
	"project_id" uuid,
	"section_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"status" "organization_task_status" DEFAULT 'pending' NOT NULL,
	"visibility" "organization_visibility" DEFAULT 'shared' NOT NULL,
	"created_by_id" uuid NOT NULL,
	"assignee_id" uuid,
	"due_date" date,
	"due_time" time,
	"reminder_at" timestamp,
	"recurrence_type" "organization_recurrence_type" DEFAULT 'none' NOT NULL,
	"recurrence_interval" integer DEFAULT 1 NOT NULL,
	"recurrence_days_of_week" integer[] DEFAULT '{}'::integer[] NOT NULL,
	"recurrence_day_of_month" integer,
	"recurrence_ends_at" date,
	"completed_at" timestamp,
	"last_completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"archived_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "organization_labels" ADD CONSTRAINT "organization_labels_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_notes" ADD CONSTRAINT "organization_notes_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_notes" ADD CONSTRAINT "organization_notes_project_id_organization_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."organization_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_notes" ADD CONSTRAINT "organization_notes_task_id_organization_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."organization_tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_notes" ADD CONSTRAINT "organization_notes_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_projects" ADD CONSTRAINT "organization_projects_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_projects" ADD CONSTRAINT "organization_projects_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_project_sections" ADD CONSTRAINT "organization_project_sections_project_id_organization_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."organization_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_task_labels" ADD CONSTRAINT "organization_task_labels_task_id_organization_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."organization_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_task_labels" ADD CONSTRAINT "organization_task_labels_label_id_organization_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."organization_labels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_tasks" ADD CONSTRAINT "organization_tasks_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_tasks" ADD CONSTRAINT "organization_tasks_project_id_organization_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."organization_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_tasks" ADD CONSTRAINT "organization_tasks_section_id_organization_project_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."organization_project_sections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_tasks" ADD CONSTRAINT "organization_tasks_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_tasks" ADD CONSTRAINT "organization_tasks_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;