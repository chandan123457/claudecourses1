import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Connect to database
export const connectPrisma = async () => {
  try {
    await prisma.$connect();
    logger.info('✓ Prisma connected successfully');
  } catch (error) {
    logger.error('✗ Prisma connection failed:', error);
    throw error;
  }
};

// Disconnect from database
export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};

export default prisma;
