-- Current sql file was generated after introspecting the database
-- If you want to run this migration if will destroy all data! please uncomment this code before executing migrations
-- These Migration was automaticlly applied durring drizzle-kit pull --init
-- The best way to apply this it to run  drizzle-kit pull --init
/*
CREATE TABLE "Users" (
	"id" uuid PRIMARY KEY,
	"username" varchar(255) NOT NULL,
	"password_hash" varchar(2040) NOT NULL,
	"provider" varchar(255) DEFAULT 'Local' NOT NULL,
	"pid" text,
	"displayName" varchar(255),
	"fullName" varchar(255) NOT NULL,
	"firstName" varchar(255) NOT NULL,
	"lastName" varchar(255),
	"email" varchar(255) NOT NULL,
	"photoURL" varchar(2024),
	"photo" bytea,
	"photoType" varchar(255),
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(6) with time zone NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "Users_email_key" ON "Users" ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "Users_pid_key" ON "Users" ("pid");--> statement-breakpoint
CREATE UNIQUE INDEX "Users_username_key" ON "Users" ("username");