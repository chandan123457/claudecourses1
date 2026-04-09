import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectPrisma, disconnectPrisma } from './db/prisma';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "development" ? 5000 : 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// API routes
app.use('/api', routes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'GradToPro API is running with Prisma ORM',
    version: '1.0.0',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT. Shutting down gracefully...');
  await disconnectPrisma();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM. Shutting down gracefully...');
  await disconnectPrisma();
  process.exit(0);
});

// Initialize Prisma and start server
const startServer = async () => {
  try {
    // Connect to database with Prisma
    await connectPrisma();

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} with Prisma ORM`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`\n✓ Server is running on http://localhost:${PORT}`);
      console.log(`✓ API endpoint: http://localhost:${PORT}/api`);
      console.log(`✓ Database: Prisma ORM connected to PostgreSQL`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();

export default app;