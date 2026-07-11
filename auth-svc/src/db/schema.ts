import { pgTable, uuid, varchar, text, customType, timestamp, uniqueIndex, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const usersTable = pgTable("Users", {
	id: uuid().primaryKey().defaultRandom(),
	username: varchar({ length: 255 }).notNull(),
	password_hash: varchar("password_hash", { length: 2040 }).notNull(),
	provider: varchar({ length: 255 }).default("Local").notNull(),
	pid: text(),
	displayName: varchar({ length: 255 }),
	fullName: varchar({ length: 255 }).notNull(),
	firstName: varchar({ length: 255 }).notNull(),
	lastName: varchar({ length: 255 }),
	email: varchar({ length: 255 }).notNull(),
	photoURL: varchar({ length: 2024 }),
	photo: customType({ dataType: () => 'bytea' })(),
	photoType: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
	uniqueIndex("Users_email_key").using("btree", table.email.asc().nullsLast()),
	uniqueIndex("Users_pid_key").using("btree", table.pid.asc().nullsLast()),
	uniqueIndex("Users_username_key").using("btree", table.username.asc().nullsLast()),
]);
