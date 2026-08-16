CREATE TABLE `propertyEnrichmentDrafts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`sourceId` int NOT NULL,
	`proposedFields` json NOT NULL,
	`evidence` json NOT NULL,
	`status` enum('draft','approved','rejected') NOT NULL DEFAULT 'draft',
	`createdByUserId` int NOT NULL,
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `propertyEnrichmentDrafts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `propertySources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`sourceUrl` text,
	`sourceTitle` varchar(256),
	`sourceType` varchar(64) NOT NULL DEFAULT 'pasted_text',
	`sourceText` text NOT NULL,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `propertySources_id` PRIMARY KEY(`id`)
);
