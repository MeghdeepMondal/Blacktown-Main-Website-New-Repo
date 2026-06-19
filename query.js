const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.events.findMany({
    select: {
      id: true,
      name: true,
      hasOpportunity: true,
      opportunity: true
    }
  });
  console.log(JSON.stringify(events, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
