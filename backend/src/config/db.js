import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client singleton to avoid multiple instances in development
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
