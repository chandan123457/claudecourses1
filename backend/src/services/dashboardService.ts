import prisma from '../db/prisma';

export const dashboardService = {
  async getDashboardData(userId: number) {
    const [
      programEnrollments,
      certifications,
      eligibility,
      upcomingInterviews,
      interviewStats,
    ] = await Promise.all([
      // Enrolled programs with progress
      prisma.programEnrollment.findMany({
        where: { userId },
        include: {
          program: {
            select: {
              id: true,
              title: true,
              domain: true,
              thumbnail: true,
              instructor: true,
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
        take: 6,
      }),

      // User certifications
      prisma.certification.findMany({
        where: { userId },
        include: {
          program: { select: { title: true } },
        },
        orderBy: { issuedAt: 'desc' },
        take: 4,
      }),

      // Portal eligibility
      prisma.portalEligibility.findUnique({
        where: { userId },
      }),

      // Upcoming interviews
      prisma.mockInterview.findMany({
        where: {
          userId,
          status: 'scheduled',
          sessionDate: { gte: new Date() },
        },
        orderBy: { sessionDate: 'asc' },
        take: 3,
      }),

      // Interview summary stats
      prisma.mockInterview.aggregate({
        where: { userId, status: 'completed' },
        _avg: { score: true, rating: true },
        _count: true,
      }),
    ]);

    return {
      enrolledPrograms: programEnrollments,
      certifications,
      eligibility,
      upcomingInterviews,
      interviewStats: {
        totalCompleted: interviewStats._count,
        avgScore: interviewStats._avg.score ?? 0,
        avgRating: interviewStats._avg.rating ?? 0,
      },
    };
  },
};
