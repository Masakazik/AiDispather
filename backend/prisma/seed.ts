import { PrismaClient, RequestPriority, RequestStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@homedispatcher.local' },
    update: {},
    create: {
      email: 'admin@homedispatcher.local',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    },
  });

  const dispatcher = await prisma.user.upsert({
    where: { email: 'dispatcher@homedispatcher.local' },
    update: {},
    create: {
      email: 'dispatcher@homedispatcher.local',
      passwordHash,
      firstName: 'Dana',
      lastName: 'Dispatcher',
      role: UserRole.DISPATCHER,
    },
  });

  const building = await prisma.building.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Maple Court',
      address: '12 Maple Street',
      city: 'Springfield',
      apartments: {
        create: [
          { number: '101', floor: 1 },
          { number: '202', floor: 2 },
        ],
      },
    },
    include: { apartments: true },
  });

  await prisma.serviceRequest.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Leaking radiator in apartment 101',
        description: 'Water pooling under the radiator.',
        status: RequestStatus.NEW,
        priority: RequestPriority.HIGH,
        buildingId: building.id,
        apartmentId: building.apartments[0]?.id,
        assignedToId: dispatcher.id,
        createdById: admin.id,
      },
      {
        title: 'Elevator inspection due',
        description: 'Annual safety inspection.',
        status: RequestStatus.IN_PROGRESS,
        priority: RequestPriority.MEDIUM,
        buildingId: building.id,
        createdById: admin.id,
      },
    ],
  });

  console.log('Seed complete.');
  console.log('Login with: admin@homedispatcher.local / password123');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
