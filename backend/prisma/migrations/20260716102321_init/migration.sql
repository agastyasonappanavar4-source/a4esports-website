-- CreateTable
CREATE TABLE `Scrim` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `mode` ENUM('BR', 'CS') NOT NULL,
    `fee` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `rules` TEXT NOT NULL,
    `maxTeams` INTEGER NOT NULL,
    `status` ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `roomId` VARCHAR(191) NULL,
    `roomPassword` VARCHAR(191) NULL,
    `roomReleased` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Registration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `registrationCode` VARCHAR(191) NOT NULL,
    `teamName` VARCHAR(191) NOT NULL,
    `iglName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(15) NOT NULL,
    `slotNumber` INTEGER NOT NULL,
    `paymentStatus` ENUM('PENDING', 'PAID', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `scrimId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Registration_registrationCode_key`(`registrationCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `registrationId` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'FAILED') NOT NULL,
    `paidAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Payment_registrationId_key`(`registrationId`),
    UNIQUE INDEX `Payment_transactionId_key`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Registration` ADD CONSTRAINT `Registration_scrimId_fkey` FOREIGN KEY (`scrimId`) REFERENCES `Scrim`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_registrationId_fkey` FOREIGN KEY (`registrationId`) REFERENCES `Registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
