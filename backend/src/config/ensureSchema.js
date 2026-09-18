import prisma from "./prisma.js";

export async function ensureDatabaseSchema() {
    try {
        // 1. Check Slot table columns
        const slotCols = await prisma.$queryRawUnsafe(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Slot' AND COLUMN_NAME = 'customTime'"
        );
        if (!slotCols || slotCols.length === 0) {
            console.log("Adding missing column customTime to Slot table...");
            await prisma.$executeRawUnsafe("ALTER TABLE `Slot` ADD COLUMN `customTime` VARCHAR(191) NULL;");
            console.log("✅ Column customTime added to Slot table.");
        }

        // 2. Check Registration table columns
        const regCols = await prisma.$queryRawUnsafe(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Registration'"
        );
        const colNames = new Set((regCols || []).map((c) => c.COLUMN_NAME));

        if (!colNames.has("paymentVerificationRequestedAt")) {
            console.log("Adding paymentVerificationRequestedAt to Registration...");
            await prisma.$executeRawUnsafe(
                "ALTER TABLE `Registration` ADD COLUMN `paymentVerificationRequestedAt` DATETIME(3) NULL;"
            );
        }
        if (!colNames.has("paymentVerifiedAt")) {
            console.log("Adding paymentVerifiedAt to Registration...");
            await prisma.$executeRawUnsafe(
                "ALTER TABLE `Registration` ADD COLUMN `paymentVerifiedAt` DATETIME(3) NULL;"
            );
        }
        if (!colNames.has("verifiedByAdminId")) {
            console.log("Adding verifiedByAdminId to Registration...");
            await prisma.$executeRawUnsafe(
                "ALTER TABLE `Registration` ADD COLUMN `verifiedByAdminId` INT NULL;"
            );
        }
        if (!colNames.has("rejectionReason")) {
            console.log("Adding rejectionReason to Registration...");
            await prisma.$executeRawUnsafe(
                "ALTER TABLE `Registration` ADD COLUMN `rejectionReason` VARCHAR(191) NULL;"
            );
        }

        // 3. Check Match table
        const matchTable = await prisma.$queryRawUnsafe(
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Match'"
        );
        if (!matchTable || matchTable.length === 0) {
            console.log("Creating Match table...");
            await prisma.$executeRawUnsafe(`
                CREATE TABLE \`Match\` (
                    \`id\` INT NOT NULL AUTO_INCREMENT,
                    \`slotId\` INT NOT NULL,
                    \`matchNumber\` INT NOT NULL DEFAULT 1,
                    \`title\` VARCHAR(191) NULL,
                    \`status\` VARCHAR(191) NOT NULL DEFAULT 'COMPLETED',
                    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                    \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                    INDEX \`Match_slotId_idx\`(\`slotId\`),
                    PRIMARY KEY (\`id\`),
                    CONSTRAINT \`Match_slotId_fkey\` FOREIGN KEY (\`slotId\`) REFERENCES \`Slot\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
                ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
            `);
            console.log("✅ Match table created.");
        }

        // 4. Check MatchResult table
        const matchResultTable = await prisma.$queryRawUnsafe(
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'MatchResult'"
        );
        if (!matchResultTable || matchResultTable.length === 0) {
            console.log("Creating MatchResult table...");
            await prisma.$executeRawUnsafe(`
                CREATE TABLE \`MatchResult\` (
                    \`id\` INT NOT NULL AUTO_INCREMENT,
                    \`matchId\` INT NOT NULL,
                    \`registrationId\` INT NOT NULL,
                    \`rank\` INT NOT NULL,
                    \`won\` INT NOT NULL DEFAULT 0,
                    \`pp\` INT NOT NULL DEFAULT 0,
                    \`kp\` INT NOT NULL DEFAULT 0,
                    \`tp\` INT NOT NULL DEFAULT 0,
                    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                    \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                    INDEX \`MatchResult_matchId_idx\`(\`matchId\`),
                    INDEX \`MatchResult_registrationId_idx\`(\`registrationId\`),
                    UNIQUE INDEX \`MatchResult_matchId_registrationId_key\`(\`matchId\`, \`registrationId\`),
                    PRIMARY KEY (\`id\`),
                    CONSTRAINT \`MatchResult_matchId_fkey\` FOREIGN KEY (\`matchId\`) REFERENCES \`Match\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
                    CONSTRAINT \`MatchResult_registrationId_fkey\` FOREIGN KEY (\`registrationId\`) REFERENCES \`Registration\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
                ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
            `);
            console.log("✅ MatchResult table created.");
        }

        console.log("Database schema is synchronized.");
    } catch (error) {
        console.warn("Schema check warning (non-fatal):", error?.message || error);
    }
}
