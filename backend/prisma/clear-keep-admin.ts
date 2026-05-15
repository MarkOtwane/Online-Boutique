/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database while preserving admin login information...');

  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT IN ('_prisma_migrations', 'User')
  `;

  if (tables.length > 0) {
    const tableList = tables.map((table) => `"${table.tablename}"`).join(', ');
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE;`,
    );
    console.log(`Truncated ${tables.length} tables.`);
  } else {
    console.log('No data tables found to truncate.');
  }

  const removedUsers = await prisma.user.deleteMany({
    where: {
      role: {
        notIn: ['admin', 'ADMIN', 'Admin'],
      },
    },
  });

  const remainingAdmins = await prisma.user.findMany({
    where: {
      role: {
        in: ['admin', 'ADMIN', 'Admin'],
      },
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

  console.log(`Deleted ${removedUsers.count} non-admin user account(s).`);
  console.log(`Preserved ${remainingAdmins.length} admin account(s):`);
  remainingAdmins.forEach((admin) => {
    console.log(`- #${admin.id} ${admin.email} (${admin.role})`);
  });
}

main()
  .catch((error) => {
    console.error('Failed to clear database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
