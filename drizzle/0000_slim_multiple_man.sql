CREATE TABLE `employees` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`pin` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `time_entries` (
	`id` integer PRIMARY KEY NOT NULL,
	`employee_id` integer NOT NULL,
	`clock_in` integer NOT NULL,
	`clock_out` integer,
	`break_type` text,
	`break_minutes` integer DEFAULT 0,
	`total_hours` integer,
	`is_paid` integer DEFAULT false,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `employees_pin_unique` ON `employees` (`pin`);