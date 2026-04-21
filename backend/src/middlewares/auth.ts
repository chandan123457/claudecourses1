import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import prisma from '../db/prisma';

// Authentication middleware - verifies Firebase UID from headers
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const firebaseUid = req.headers['x-firebase-uid'] as string;

    if (!firebaseUid) {
      throw new AppError('Authentication required', 401);
    }

    // Verify user exists in database using Prisma
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: {
        id: true,
        firebaseUid: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Attach user to request (convert camelCase to snake_case for compatibility)
    req.user = {
      id: user.id,
      firebase_uid: user.firebaseUid,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Admin middleware - checks if user is admin
export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminKey = req.headers['x-admin-key'] as string;

    // Simple admin key check (in production, use proper admin role system)
    if (adminKey !== 'gradtopro_admin_2024') {
      throw new AppError('Admin access required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Optional authentication - attaches user if header present, does not fail if missing
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const firebaseUid = req.headers['x-firebase-uid'] as string;
    if (firebaseUid) {
      const user = await prisma.user.findUnique({
        where: { firebaseUid },
        select: { id: true, firebaseUid: true, name: true, email: true },
      });
      if (user) {
        req.user = { id: user.id, firebase_uid: user.firebaseUid, name: user.name, email: user.email };
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        firebase_uid: string;
        name: string;
        email: string;
      };
    }
  }
}