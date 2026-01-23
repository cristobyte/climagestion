import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { users, tasks } from './schema';
import { USER_ROLES, TASK_STATUSES, SERVICE_TYPES, PRIORITIES } from '@hvac/shared';

dotenv.config();

async function main() {
  const url = process.env.DATABASE_URL || 'file:local.db';
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  const client = createClient({ url, authToken });
  const db = drizzle(client);

  console.log('Seeding database...');

  // Clear existing data (tasks first due to foreign keys)
  console.log('Clearing existing data...');
  await db.delete(tasks);
  await db.delete(users);

  const now = new Date().toISOString();
  const adminPassword = await bcrypt.hash('admin123', 10);
  const techPassword = await bcrypt.hash('tech123', 10);

  // Create admin user
  const adminId = uuidv4();
  await db.insert(users).values({
    id: adminId,
    email: 'admin@hvac.com',
    password: adminPassword,
    name: 'Admin User',
    role: USER_ROLES.ADMIN,
    phone: '555-0100',
    createdAt: now,
    updatedAt: now,
  });

  console.log('Created admin user: admin@hvac.com / admin123');

  // Create technician users
  const tech1Id = uuidv4();
  const tech2Id = uuidv4();

  await db.insert(users).values([
    {
      id: tech1Id,
      email: 'tech1@hvac.com',
      password: techPassword,
      name: 'John Technician',
      role: USER_ROLES.TECHNICIAN,
      phone: '555-0101',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: tech2Id,
      email: 'tech2@hvac.com',
      password: techPassword,
      name: 'Jane Technician',
      role: USER_ROLES.TECHNICIAN,
      phone: '555-0102',
      createdAt: now,
      updatedAt: now,
    },
  ]);

  console.log('Created technician users: tech1@hvac.com / tech123, tech2@hvac.com / tech123');

  // Create sample tasks
  const sampleTasks = [
    {
      id: uuidv4(),
      title: 'Install new AC unit',
      serviceType: SERVICE_TYPES.INSTALLATION,
      status: TASK_STATUSES.PENDING,
      priority: PRIORITIES.HIGH,
      customerName: 'Robert Smith',
      customerPhone: '555-1001',
      customerEmail: 'robert@example.com',
      address: '123 Main St, Springfield',
      scheduledDate: new Date(Date.now() + 86400000).toISOString(),
      notes: 'Customer requested morning appointment',
      createdBy: adminId,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      title: 'Annual HVAC maintenance',
      serviceType: SERVICE_TYPES.MAINTENANCE,
      status: TASK_STATUSES.ASSIGNED,
      priority: PRIORITIES.MEDIUM,
      customerName: 'Sarah Johnson',
      customerPhone: '555-1002',
      address: '456 Oak Ave, Springfield',
      scheduledDate: new Date(Date.now() + 172800000).toISOString(),
      notes: 'Regular annual checkup',
      assignedTo: tech1Id,
      createdBy: adminId,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      title: 'Repair heating system',
      serviceType: SERVICE_TYPES.REPAIR,
      status: TASK_STATUSES.IN_PROGRESS,
      priority: PRIORITIES.URGENT,
      customerName: 'Michael Brown',
      customerPhone: '555-1003',
      customerEmail: 'mbrown@example.com',
      address: '789 Pine Rd, Springfield',
      scheduledDate: now,
      notes: 'Heating not working - urgent',
      assignedTo: tech2Id,
      createdBy: adminId,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      title: 'Replace air filter',
      serviceType: SERVICE_TYPES.MAINTENANCE,
      status: TASK_STATUSES.COMPLETED,
      priority: PRIORITIES.LOW,
      customerName: 'Emily Davis',
      customerPhone: '555-1004',
      address: '321 Elm St, Springfield',
      scheduledDate: new Date(Date.now() - 86400000).toISOString(),
      notes: 'Standard filter replacement',
      completionNotes: 'Replaced with HEPA filter as requested',
      assignedTo: tech1Id,
      createdBy: adminId,
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.insert(tasks).values(sampleTasks);

  console.log('Created sample tasks');
  console.log('Seeding completed!');

  client.close();
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
