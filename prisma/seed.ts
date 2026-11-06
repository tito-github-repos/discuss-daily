import { PrismaClient, Scenario } from "@prisma/client";
const prisma = new PrismaClient();

// Sample consultants for an empty database: replace the names, fields and contacts with the real ones.
const samples = [
  { name: "Consultant One", field: "Teacher and subject expert", scenario: Scenario.STUDENT, phone: "+91 00000 00000", email: "one@example.com", sortOrder: 1 },
  { name: "Consultant Two", field: "Counselling psychologist", scenario: Scenario.STUDENT, phone: "+91 00000 00000", email: "two@example.com", sortOrder: 2 },
  { name: "Consultant Three", field: "Financial consultant", scenario: Scenario.FINANCE, phone: "+91 00000 00000", email: "three@example.com", sortOrder: 3 },
  { name: "Consultant Four", field: "HR consultant", scenario: Scenario.WORKPLACE, phone: "+91 00000 00000", email: "four@example.com", sortOrder: 4 },
  { name: "Consultant Five", field: "Retired mentor (70+)", scenario: Scenario.FAMILY, phone: "+91 00000 00000", email: "five@example.com", sortOrder: 5 },
];

async function main() {
  // Never touch a database that already has consultants (running it twice adds nothing)
  if ((await prisma.consultant.count()) > 0) {
    console.log("Consultants already exist: seed skipped.");
    return;
  }
  await prisma.consultant.createMany({ data: samples });
  console.log(`Added ${samples.length} sample consultants.`);
}

main().finally(() => prisma.$disconnect());