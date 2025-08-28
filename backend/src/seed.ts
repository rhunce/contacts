import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: hashedPassword,
    },
  });

  console.log('Created user:', user.email);

  // Create some test contacts
  const contacts = await Promise.all([
    prisma.contact.upsert({
      where: { 
        ownerId_email: {
          ownerId: user.id,
          email: 'john.smith@example.com'
        }
      },
      update: {},
      create: {
        ownerId: user.id,
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '+1-555-0101',
      },
    }),
    prisma.contact.upsert({
      where: { 
        ownerId_email: {
          ownerId: user.id,
          email: 'jane.doe@example.com'
        }
      },
      update: {},
      create: {
        ownerId: user.id,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '+1-555-0102',
      },
    }),
    prisma.contact.upsert({
      where: { 
        ownerId_email: {
          ownerId: user.id,
          email: 'bob.wilson@example.com'
        }
      },
      update: {},
      create: {
        ownerId: user.id,
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob.wilson@example.com',
        phone: '+1-555-0103',
      },
    }),
  ]);

  console.log('Created contacts:', contacts.length);

  // Create some test contact history
  const contactHistory = await prisma.contactHistory.create({
    data: {
      contactId: contacts[0].id,
      firstName: { before: 'John', after: 'Jonathan' },
      email: { before: 'john.smith@example.com', after: 'jonathan.smith@example.com' },
    },
  });

  console.log('Created contact history entry');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
