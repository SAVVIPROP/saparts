CREATE TABLE `cities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`country` varchar(128) NOT NULL,
	`region` varchar(64) NOT NULL,
	`tagline` text,
	`heroImageUrl` text,
	`coverImageUrl` text,
	`dossier` text,
	`businessDistricts` text,
	`neighborhoods` json,
	`avgMonthlyRateUsd` int,
	`avgDailyRateUsd` int,
	`currencyCode` varchar(8) DEFAULT 'USD',
	`latitude` decimal(10,6),
	`longitude` decimal(10,6),
	`timezone` varchar(64),
	`featured` boolean NOT NULL DEFAULT false,
	`published` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cities_id` PRIMARY KEY(`id`),
	CONSTRAINT `cities_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`title` varchar(256) NOT NULL,
	`dek` text,
	`body` text,
	`heroImageUrl` text,
	`category` varchar(64),
	`cityId` int,
	`readMinutes` int,
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	`featured` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `insights_id` PRIMARY KEY(`id`),
	CONSTRAINT `insights_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `newsletterSubscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`source` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsletterSubscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletterSubscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`cityId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`brand` varchar(128),
	`category` enum('Serviced Apartment','Aparthotel','Residence','Penthouse') NOT NULL,
	`tagline` text,
	`description` text,
	`neighborhood` varchar(128),
	`address` text,
	`latitude` decimal(10,6),
	`longitude` decimal(10,6),
	`heroImageUrl` text,
	`unitTypes` json,
	`amenities` json,
	`minStayNights` int DEFAULT 1,
	`ratingScore` decimal(3,1),
	`ratingSource` varchar(64),
	`priceFromDailyUsd` int,
	`priceToDailyUsd` int,
	`priceFromMonthlyUsd` int,
	`priceToMonthlyUsd` int,
	`bookingUrl` text,
	`expediaUrl` text,
	`tripUrl` text,
	`officialUrl` text,
	`virtualTourUrl` text,
	`bestForTags` json,
	`wfaScore` int,
	`transitScore` int,
	`lifestyleScore` int,
	`quietnessScore` int,
	`valueScore` int,
	`featured` boolean NOT NULL DEFAULT false,
	`published` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`),
	CONSTRAINT `properties_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `propertyImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`url` text NOT NULL,
	`caption` text,
	`alt` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `propertyImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shortlistItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shortlistId` int NOT NULL,
	`propertyId` int NOT NULL,
	`note` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shortlistItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shortlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`title` varchar(256) NOT NULL,
	`note` text,
	`shareToken` varchar(64) NOT NULL,
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shortlists_id` PRIMARY KEY(`id`),
	CONSTRAINT `shortlists_shareToken_unique` UNIQUE(`shareToken`)
);
