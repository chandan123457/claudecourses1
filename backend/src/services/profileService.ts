import prisma from '../db/prisma';

export const profileService = {
  async getFullProfile(userId: number) {
    const [user, profile, certifications, skillBadges, eligibility, programStats] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, email: true, phone: true, createdAt: true },
        }),
        prisma.userProfile.findUnique({ where: { userId } }),
        prisma.certification.findMany({
          where: { userId },
          orderBy: { issuedAt: 'desc' },
          include: { program: { select: { title: true } } },
        }),
        prisma.skillBadge.findMany({
          where: { userId },
          orderBy: { earnedAt: 'desc' },
        }),
        prisma.portalEligibility.findUnique({ where: { userId } }),
        prisma.programEnrollment.aggregate({
          where: { userId },
          _count: true,
          _avg: { progress: true },
        }),
      ]);

    const technicalScore = eligibility?.technicalScore ?? 0;
    const softSkillScore = eligibility?.softSkillScore ?? 0;
    const avgProgress = Math.round(programStats._avg.progress ?? 0);
    const derivedOverallScore = Math.round(
      technicalScore * 0.45 + softSkillScore * 0.35 + avgProgress * 0.2
    );
    const overallScore = eligibility?.overallScore ?? derivedOverallScore;

    return {
      user,
      profile,
      certifications,
      skillBadges,
      eligibility,
      readiness: {
        totalEnrolled: programStats._count,
        avgProgress,
        technicalScore,
        softSkillScore,
        overallScore,
        derivedOverallScore,
      },
    };
  },

  async upsertProfile(userId: number, data: {
    bio?: string;
    location?: string;
    education?: string;
    avatar?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    githubConnected?: boolean;
    linkedinConnected?: boolean;
  }) {
    return prisma.userProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  },

  async updateUserName(userId: number, name: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { name },
      select: { id: true, name: true, email: true },
    });
  },

  // Admin: assign certification to user
  async assignCertification(data: {
    userId: number;
    programId?: number;
    title: string;
    issuedBy: string;
    issuedAt: Date;
    certificateUrl?: string;
  }) {
    return prisma.certification.create({ data });
  },

  // Admin: award skill badge
  async awardSkillBadge(userId: number, name: string, category: string) {
    return prisma.skillBadge.create({
      data: { userId, name, category },
    });
  },

  // Admin: set portal eligibility
  async setEligibility(userId: number, data: {
    status: string;
    technicalScore: number;
    softSkillScore: number;
    overallScore: number;
    eligibleTiers: string[];
  }) {
    return prisma.portalEligibility.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  },

  // Admin: get all users with profile data
  async getAllUsers(filters: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = filters;
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          _count: {
            select: {
              programEnrollments: true,
              certifications: true,
              mockInterviews: true,
            },
          },
          portalEligibility: {
            select: {
              status: true,
              technicalScore: true,
              softSkillScore: true,
              overallScore: true,
              eligibleTiers: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, totalPages: Math.ceil(total / limit) };
  },

  async getAllCertifications(filters: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = filters;
    const [certs, total] = await Promise.all([
      prisma.certification.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { issuedAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          program: { select: { title: true } },
        },
      }),
      prisma.certification.count(),
    ]);
    return { certifications: certs, total, page, totalPages: Math.ceil(total / limit) };
  },
};
