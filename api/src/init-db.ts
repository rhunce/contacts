import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Run migrations
    console.log('Running database migrations...');
    const { execSync } = require('child_process');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    // Generate Prisma client
    console.log('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Check if we need to seed the database
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log('Seeding database with initial data...');
      
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

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

export { initializeDatabase };
