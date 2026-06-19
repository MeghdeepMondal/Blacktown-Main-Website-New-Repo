const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.events.findMany({
    where: { hasOpportunity: true },
    include: { admin: true }
  });
  console.log(JSON.stringify(events, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
