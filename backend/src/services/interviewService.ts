import prisma from '../db/prisma';

export const interviewService = {
  // Get interviews page data
  async getInterviewData(userId: number) {
    const [sessions, bookings, remainingSessions] = await Promise.all([
      prisma.mockInterview.findMany({
        where: { userId },
        orderBy: { sessionDate: 'desc' },
      }),
      prisma.interviewBooking.findMany({
        where: { userId, status: { in: ['pending', 'confirmed'] } },
        orderBy: { preferredDate: 'asc' },
      }),
      // Count how many on-demand sessions remaining (e.g. max 5 per user minus used)
      prisma.interviewBooking.count({
        where: { userId, status: { in: ['pending', 'confirmed'] } },
      }),
    ]);

    const completedSessions = sessions.filter(s => s.status === 'completed');
    const avgRating =
      completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => sum + (s.rating ?? 0), 0) / completedSessions.length
        : 0;

    // Aggregate strengths and improvement areas from latest sessions
    const recentSessions = completedSessions.slice(0, 5);
    const allStrengths = recentSessions.flatMap(s => s.strengths);
    const allImprovements = recentSessions.flatMap(s => s.improvements);

    const strengthCount: Record<string, number> = {};
    allStrengths.forEach(s => { strengthCount[s] = (strengthCount[s] || 0) + 1; });
    const improvementCount: Record<string, number> = {};
    allImprovements.forEach(s => { improvementCount[s] = (improvementCount[s] || 0) + 1; });

    const topStrengths = Object.entries(strengthCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);
    const topImprovements = Object.entries(improvementCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    const latestFeedback = completedSessions[0]?.feedback ?? null;

    return {
      sessions,
      pendingBookings: bookings,
      remainingOnDemand: Math.max(0, 5 - remainingSessions),
      performanceReport: {
        overallRating: parseFloat(avgRating.toFixed(1)),
        totalSessions: completedSessions.length,
        topStrengths,
        topImprovements,
        latestFeedback,
      },
    };
  },

  async bookInterview(userId: number, domain: string, preferredDate: Date) {
    return prisma.interviewBooking.create({
      data: { userId, domain, preferredDate },
    });
  },

  async cancelBooking(bookingId: number, userId: number) {
    return prisma.interviewBooking.updateMany({
      where: { id: bookingId, userId },
      data: { status: 'cancelled' },
    });
  },

  // Admin: create interview session for a user
  async createSession(data: {
    userId: number;
    topic: string;
    interviewer: string;
    sessionDate: Date;
    type?: string;
  }) {
    return prisma.mockInterview.create({ data: { ...data, status: 'scheduled' } });
  },

  // Admin: record completed session with score
  async recordResult(interviewId: number, data: {
    score: number;
    rating: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  }) {
    return prisma.mockInterview.update({
      where: { id: interviewId },
      data: { ...data, status: 'completed' },
    });
  },

  async getAllSessions(filters: { userId?: number; page?: number; limit?: number }) {
    const { userId, page = 1, limit = 20 } = filters;
    const where: any = {};
    if (userId) where.userId = userId;

    const [sessions, total] = await Promise.all([
      prisma.mockInterview.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { sessionDate: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.mockInterview.count({ where }),
    ]);

    return { sessions, total, page, totalPages: Math.ceil(total / limit) };
  },

  async getAllBookings(filters: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = filters;
    const where: any = {};
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.interviewBooking.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.interviewBooking.count({ where }),
    ]);

    return { bookings, total, page, totalPages: Math.ceil(total / limit) };
  },

  async confirmBooking(bookingId: number, sessionLink?: string) {
    return prisma.interviewBooking.update({
      where: { id: bookingId },
      data: { status: 'confirmed', sessionLink },
    });
  },
};
