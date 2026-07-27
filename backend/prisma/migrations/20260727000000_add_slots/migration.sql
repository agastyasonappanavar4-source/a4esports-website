-- CreateEnum equivalent for MySQL (enums are inlined per column)

-- CreateTable
CREATE TABLE `Slot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `time` ENUM('PM_3', 'PM_6', 'PM_9', 'AM_12') NOT NULL,
    `status` ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `maxTeams` INTEGER NULL,
    `roomId` VARCHAR(191) NULL,
    `roomPassword` VARCHAR(191) NULL,
    `roomReleased` BOOLEAN NOT NULL DEFAULT false,
    `scrimId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Slot_scrimId_time_key`(`scrimId`, `time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4;

-- AddForeignKey
ALTER TABLE `Slot` ADD CONSTRAINT `Slot_scrimId_fkey` FOREIGN KEY (`scrimId`) REFERENCES `Scrim`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: create one Slot per existing Scrim, carrying over its old time/room fields.
-- We map old free-text `time` to the closest fixed slot, defaulting to PM_3 if it can't be matched.
INSERT INTO `Slot` (`time`, `status`, `roomId`, `roomPassword`, `roomReleased`, `scrimId`, `createdAt`, `updatedAt`)
SELECT
    CASE
        WHEN `time` LIKE '%12%' OR LOWER(`time`) LIKE '%00:00%' OR LOWER(`time`) LIKE '%midnight%' THEN 'AM_12'
        WHEN `time` LIKE '%9%' THEN 'PM_9'
        WHEN `time` LIKE '%6%' THEN 'PM_6'
        ELSE 'PM_3'
    END,
    `status`,
    `roomId`,
    `roomPassword`,
    `roomReleased`,
    `id`,
    NOW(),
    NOW()
FROM `Scrim`;

-- AlterTable: add slotId to Registration, nullable first for backfill
ALTER TABLE `Registration` ADD COLUMN `slotId` INTEGER NULL;

-- Backfill Registration.slotId from the single Slot created per Scrim above
UPDATE `Registration` r
JOIN `Slot` s ON s.`scrimId` = r.`scrimId`
SET r.`slotId` = s.`id`;

-- Now enforce NOT NULL and add FK
ALTER TABLE `Registration` MODIFY COLUMN `slotId` INTEGER NOT NULL;
ALTER TABLE `Registration` ADD CONSTRAINT `Registration_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `Slot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop old per-scrim time/room columns now that they live on Slot
ALTER TABLE `Scrim` DROP COLUMN `time`;
ALTER TABLE `Scrim` DROP COLUMN `roomId`;
ALTER TABLE `Scrim` DROP COLUMN `roomPassword`;
ALTER TABLE `Scrim` DROP COLUMN `roomReleased`;
