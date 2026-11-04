import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.consultant.createMany({
    data: [
      { name: "Consultant One", field: "Field", phone: "+91 00000 00000", email: "one@example.com", sortOrder: 1 },
      { name: "Consultant Two", field: "Field", phone: "+91 00000 00000", email: "two@example.com", sortOrder: 2 },
    ],
  });
}

main().finally(() => prisma.$disconnect());