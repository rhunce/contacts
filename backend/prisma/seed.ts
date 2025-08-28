/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Check if we already have users
  const userCount = await prisma.user.count();
  
  if (userCount === 0) {
    console.log('Creating default user...');
    
    // Create a default user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
      },
    });

    console.log('Created default user:', user.email);

    // Create some sample contacts
    console.log('Creating sample contacts...');
    
    const contacts = await Promise.all([
      prisma.contact.create({
        data: {
          ownerId: user.id,
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@example.com',
          phone: '+1-555-0101',
        },
      }),
      prisma.contact.create({
        data: {
          ownerId: user.id,
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@example.com',
          phone: '+1-555-0102',
        },
      }),
    ]);

    console.log('Created sample contacts:', contacts.length);
  } else {
    console.log('Database already has data, skipping seed...');
  }

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });