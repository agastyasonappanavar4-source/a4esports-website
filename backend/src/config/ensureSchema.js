import prisma from "./prisma.js";

export async function ensureDatabaseSchema() {
    try {
        // Existing deployments may have schema changes applied by this updater
        // without matching records in Prisma's migration history. Add the new
        // tournament mode directly and only when it is absent.
        const modeColumns = await prisma.$queryRawUnsafe(
            "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Scrim' AND COLUMN_NAME = 'mode'"
        );
        if (modeColumns?.length && !modeColumns[0].COLUMN_TYPE.includes("'SPECIAL'")) {
            console.log("Adding SPECIAL to Scrim mode...");
            await prisma.$executeRawUnsafe(
                "ALTER TABLE `Scrim` MODIFY `mode` ENUM('BR', 'CS', 'SPECIAL') NOT NULL;"
            );
            console.log("✅ SPECIAL tournament mode added.");
        }

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

        // 5. Clean existing accidental duplicate registrations before adding unique constraint
        console.log("Checking for duplicate registrations (userId + scrimId + slotId)...");
        const duplicateGroups = await prisma.$queryRawUnsafe(`
            SELECT userId, scrimId, slotId, COUNT(*) as cnt
            FROM \`Registration\`
            WHERE userId IS NOT NULL
            GROUP BY userId, scrimId, slotId
            HAVING cnt > 1
        `);

        let totalDuplicatesRemoved = 0;

        if (duplicateGroups && duplicateGroups.length > 0) {
            console.log(`Found ${duplicateGroups.length} duplicate registration group(s). Cleaning safely...`);
            for (const group of duplicateGroups) {
                const uId = Number(group.userId);
                const sId = Number(group.scrimId);
                const slId = Number(group.slotId);

                // Fetch all registrations in this group
                const groupRegs = await prisma.registration.findMany({
                    where: { userId: uId, scrimId: sId, slotId: slId },
                    include: { payment: true, matchResults: true },
                    orderBy: { id: "asc" },
                });

                if (groupRegs.length <= 1) continue;

                // Sort: PAID first, then verification requested, then earliest created (lowest id)
                groupRegs.sort((a, b) => {
                    const aPaid = a.paymentStatus === "PAID" ? 1 : 0;
                    const bPaid = b.paymentStatus === "PAID" ? 1 : 0;
                    if (aPaid !== bPaid) return bPaid - aPaid;

                    const aReq = a.paymentVerificationRequestedAt ? 1 : 0;
                    const bReq = b.paymentVerificationRequestedAt ? 1 : 0;
                    if (aReq !== bReq) return bReq - aReq;

                    return a.id - b.id;
                });

                const canonical = groupRegs[0];
                const duplicates = groupRegs.slice(1);

                console.log(
                    `Group [User: ${uId}, Scrim: ${sId}, Slot: ${slId}]: keeping canonical Registration #${canonical.id} (${canonical.paymentStatus}), removing ${duplicates.length} duplicate(s)`
                );

                for (const dup of duplicates) {
                    // Safe handling of Payment relation
                    if (dup.payment) {
                        if (!canonical.payment) {
                            await prisma.payment.update({
                                where: { id: dup.payment.id },
                                data: { registrationId: canonical.id },
                            });
                        } else {
                            await prisma.payment.delete({
                                where: { id: dup.payment.id },
                            });
                        }
                    }

                    // Safe handling of MatchResult relation
                    if (dup.matchResults && dup.matchResults.length > 0) {
                        for (const mr of dup.matchResults) {
                            const canonicalHasResult = await prisma.matchResult.findFirst({
                                where: { matchId: mr.matchId, registrationId: canonical.id },
                            });
                            if (!canonicalHasResult) {
                                await prisma.matchResult.update({
                                    where: { id: mr.id },
                                    data: { registrationId: canonical.id },
                                });
                            } else {
                                await prisma.matchResult.delete({
                                    where: { id: mr.id },
                                });
                            }
                        }
                    }

                    // Delete the duplicate registration record
                    await prisma.registration.delete({
                        where: { id: dup.id },
                    });
                    totalDuplicatesRemoved++;
                }
            }
            console.log(`✅ Safely cleaned ${totalDuplicatesRemoved} duplicate registration(s).`);
        } else {
            console.log("No duplicate registrations found.");
        }

        // 6. Ensure unique index on Registration (userId, scrimId, slotId)
        const uniqueIndexCheck = await prisma.$queryRawUnsafe(`
            SELECT INDEX_NAME 
            FROM INFORMATION_SCHEMA.STATISTICS 
            WHERE TABLE_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'Registration' 
              AND INDEX_NAME = 'Registration_userId_scrimId_slotId_key'
        `);

        if (!uniqueIndexCheck || uniqueIndexCheck.length === 0) {
            console.log("Adding UNIQUE index Registration_userId_scrimId_slotId_key...");
            await prisma.$executeRawUnsafe(`
                ALTER TABLE \`Registration\` 
                ADD UNIQUE INDEX \`Registration_userId_scrimId_slotId_key\` (\`userId\`, \`scrimId\`, \`slotId\`);
            `);
            console.log("✅ Unique index Registration_userId_scrimId_slotId_key created.");
        }

        console.log("Database schema is synchronized.");
    } catch (error) {
        console.warn("Schema check warning (non-fatal):", error?.message || error);
    }

    // 7. Production-Safe Admin Synchronization
    await ensureAdminAccounts();
}

let adminSyncReport = { checked: false, found: false, email: null, isAdmin: false, error: null };

export function getAdminSyncReport() {
    return adminSyncReport;
}

export async function ensureAdminAccounts() {
    const targetEmail = "anandkarthik.kle@gmail.com";
    try {
        const user = await prisma.user.findUnique({
            where: { email: targetEmail },
            select: { id: true, email: true, username: true, isAdmin: true },
        });

        if (!user) {
            console.log(`[AdminSync] Target account "${targetEmail}" was not found in the database. No account created.`);
            adminSyncReport = {
                checked: true,
                found: false,
                email: targetEmail,
                isAdmin: false,
                message: "User account not found in database.",
            };
            return adminSyncReport;
        }

        console.log(`[AdminSync] Found account: id=${user.id}, username=${user.username}, email=${user.email}, current isAdmin=${user.isAdmin}`);

        if (!user.isAdmin) {
            const updated = await prisma.user.update({
                where: { email: targetEmail },
                data: { isAdmin: true },
                select: { id: true, email: true, username: true, isAdmin: true },
            });
            console.log(`[AdminSync] Successfully updated user "${updated.email}" to isAdmin=true.`);
            adminSyncReport = {
                checked: true,
                found: true,
                email: updated.email,
                username: updated.username,
                isAdmin: Boolean(updated.isAdmin),
                updatedNow: true,
            };
        } else {
            console.log(`[AdminSync] User "${user.email}" already has isAdmin=true.`);
            adminSyncReport = {
                checked: true,
                found: true,
                email: user.email,
                username: user.username,
                isAdmin: true,
                updatedNow: false,
            };
        }

        return adminSyncReport;
    } catch (error) {
        console.error("[AdminSync] Error during admin check:", error?.message || error);
        adminSyncReport = {
            checked: true,
            found: false,
            email: targetEmail,
            isAdmin: false,
            error: error?.message || String(error),
        };
        return adminSyncReport;
    }
}
