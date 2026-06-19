const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.events.findMany({
    where: { hasOpportunity: true }
  });
  
  const admins = await prisma.admins.findMany({ select: { id: true } });
  const adminIds = new Set(admins.map(a => a.id));
  
  const orphanedEvents = events.filter(e => !adminIds.has(e.adminId));
  console.log('Orphaned events:', JSON.stringify(orphanedEvents, null, 2));
  
  if (orphanedEvents.length > 0) {
    const deleted = await prisma.events.deleteMany({
      where: { id: { in: orphanedEvents.map(e => e.id) } }
    });
    console.log('Deleted orphaned events:', deleted);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
