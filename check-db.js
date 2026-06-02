const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log('Admins:', await prisma.admins.count());
  console.log('Requests:', await prisma.adminrequests.count());
}
main().catch(console.error).finally(()=>prisma.$disconnect());
