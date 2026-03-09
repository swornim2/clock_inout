CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY NOT NULL,
	`employee_id` integer NOT NULL,
	`time_entry_id` integer NOT NULL,
	`message` text NOT NULL,
	`resolved_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`time_entry_id`) REFERENCES `time_entries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP INDEX "employees_pin_unique";--> statement-breakpoint
ALTER TABLE `time_entries` ALTER COLUMN "total_hours" TO "total_hours" real;--> statement-breakpoint
CREATE UNIQUE INDEX `employees_pin_unique` ON `employees` (`pin`);