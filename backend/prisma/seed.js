import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const scrims = [
  // Battle Royale
  {
    title: "Night BR Scrim",
    mode: "BR",
    fee: 0,
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    time: "8:00 PM",
    image: "",
    maxTeams: 48,
    rules:
      "Emulator players not allowed\nHacks = permanent ban\nRoom ID released 15 minutes before match\nBe online before match starts\nNo teaming\nRespect organizers\nInternet issues are player's responsibility\nOrganizer decision is final",
  },
  {
    title: "Elite BR Clash",
    mode: "BR",
    fee: 20,
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    time: "9:00 PM",
    image: "",
    maxTeams: 48,
    rules:
      "Emulator players not allowed\nHacks = permanent ban\nRoom ID released 15 minutes before match\nSquad mode only\nOrganizer decision is final",
  },
  {
    title: "Weekly BR Championship",
    mode: "BR",
    fee: 0,
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    time: "7:30 PM",
    image: "",
    maxTeams: 48,
    rules:
      "Emulator players not allowed\nHacks = permanent ban\nTop 3 teams win cash prizes\nRoom ID released 15 minutes before match\nOrganizer decision is final",
  },
  // Clash Squad
  {
    title: "CS Ranked Ladder",
    mode: "CS",
    fee: 0,
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    time: "6:00 PM",
    image: "",
    maxTeams: 16,
    rules:
      "4v4 Clash Squad, best of 7 rounds\nHacks = permanent ban\nRoom ID released 15 minutes before match\nOrganizer decision is final",
  },
  {
    title: "Weekend CS Cup",
    mode: "CS",
    fee: 30,
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    time: "8:30 PM",
    image: "",
    maxTeams: 16,
    rules:
      "4v4 Clash Squad, best of 7 rounds\nHacks = permanent ban\nCash prizes for top 2 teams\nOrganizer decision is final",
  },
  {
    title: "CS Lone Wolf Duels",
    mode: "CS",
    fee: 0,
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    time: "7:00 PM",
    image: "",
    maxTeams: 16,
    rules:
      "1v1 Clash Squad duels\nHacks = permanent ban\nRoom ID released 15 minutes before match\nOrganizer decision is final",
  },
];

async function main() {
  await prisma.scrim.deleteMany();

  for (const scrim of scrims) {
    await prisma.scrim.create({ data: scrim });
  }

  console.log(`Seeded ${scrims.length} scrims.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });