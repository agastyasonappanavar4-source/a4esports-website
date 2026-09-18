import prisma from "../src/config/prisma.js";

async function main() {
    const rawEmail = process.argv[2];

    if (!rawEmail) {
        console.error("Usage: node scripts/make-admin.js you@example.com");
        process.exit(1);
    }

    const email = rawEmail.trim().toLowerCase();

    // 1. Check existing record
    const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true, username: true, email: true, isAdmin: true },
    });

    if (!existing) {
        console.error(`❌ User with email "${email}" does not exist in the database. STOPPING.`);
        process.exit(1);
    }

    console.log(`Found existing user: ID ${existing.id}, Username: "${existing.username}", Email: "${existing.email}", Current isAdmin: ${existing.isAdmin}`);

    // 2. Safely set isAdmin = true without touching other fields
    const updated = await prisma.user.update({
        where: { email },
        data: { isAdmin: true },
        select: { id: true, username: true, email: true, isAdmin: true },
    });

    console.log(`✅ Success: User "${updated.username}" (${updated.email}) now has isAdmin = ${updated.isAdmin}.`);
}

main()
    .catch((e) => {
        console.error("Script error:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());