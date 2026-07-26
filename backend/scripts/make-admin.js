import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error("Usage: node scripts/make-admin.js you@example.com");
        process.exit(1);
    }

    const user = await prisma.user.update({
        where: { email },
        data: { isAdmin: true },
    });

    console.log(`${user.username} (${user.email}) is now an admin.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());