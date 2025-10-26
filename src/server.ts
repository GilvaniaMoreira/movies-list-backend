import app from './app';
import prisma from './config/prisma';
import { env } from './config/env';
import { logger } from './config/logger';

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connection established successfully.');

    // Start server
    app.listen(env.PORT, () => {
      logger.info(`Server is running on port ${env.PORT}`);
      logger.info(`API available at http://localhost:${env.PORT}`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
