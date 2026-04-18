import prisma from '../db/prisma';

export const programService = {
  // Get all programs with optional filters + pagination
  async getPrograms(filters: {
    domain?: string;
    level?: string;
    duration?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { domain, level, duration, search, page = 1, limit = 9 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (domain) where.domain = domain;
    if (level) where.level = level;
    if (duration) where.duration = duration;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [programs, total] = await Promise.all([
      prisma.program.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          domain: true,
          level: true,
          duration: true,
          thumbnail: true,
          instructor: true,
          isActive: true,
          createdAt: true,
          _count: { select: { enrollments: true } },
        },
      }),
      prisma.program.count({ where }),
    ]);

    return {
      programs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getProgramById(id: number) {
    return prisma.program.findUnique({
      where: { id },
      include: {
        _count: { select: { enrollments: true } },
      },
    });
  },

  async getAllProgramsForAdmin() {
    return prisma.program.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        domain: true,
        level: true,
        duration: true,
        thumbnail: true,
        instructor: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { enrollments: true } },
      },
    });
  },

  async getAdminProgramStats() {
    const [totalPrograms, activePrograms] = await Promise.all([
      prisma.program.count(),
      prisma.program.count({ where: { isActive: true } }),
    ]);

    return { totalPrograms, activePrograms };
  },

  async createProgram(data: {
    title: string;
    description: string;
    domain: string;
    level: string;
    duration: string;
    thumbnail?: string;
    instructor: string;
  }) {
    return prisma.program.create({ data });
  },

  async updateProgram(id: number, data: Partial<{
    title: string;
    description: string;
    domain: string;
    level: string;
    duration: string;
    thumbnail: string;
    instructor: string;
    isActive: boolean;
  }>) {
    return prisma.program.update({ where: { id }, data });
  },

  async deleteProgram(id: number) {
    return prisma.program.delete({ where: { id } });
  },

  async enrollUser(userId: number, programId: number) {
    const existing = await prisma.programEnrollment.findUnique({
      where: { userId_programId: { userId, programId } },
    });
    if (existing) return existing;

    return prisma.programEnrollment.create({
      data: { userId, programId },
      include: { program: true },
    });
  },

  async updateProgress(userId: number, programId: number, progress: number, currentModule?: string) {
    return prisma.programEnrollment.update({
      where: { userId_programId: { userId, programId } },
      data: {
        progress,
        currentModule,
        status: progress >= 100 ? 'completed' : 'active',
      },
    });
  },

  async getUserEnrollments(userId: number) {
    return prisma.programEnrollment.findMany({
      where: { userId },
      include: {
        program: true,
      },
      orderBy: { enrolledAt: 'desc' },
    });
  },

  // Unique filter options for frontend
  async getFilterOptions() {
    const [domains, levels, durations] = await Promise.all([
      prisma.program.findMany({
        where: { isActive: true },
        select: { domain: true },
        distinct: ['domain'],
      }),
      prisma.program.findMany({
        where: { isActive: true },
        select: { level: true },
        distinct: ['level'],
      }),
      prisma.program.findMany({
        where: { isActive: true },
        select: { duration: true },
        distinct: ['duration'],
      }),
    ]);
    return {
      domains: domains.map(d => d.domain),
      levels: levels.map(l => l.level),
      durations: durations.map(d => d.duration),
    };
  },
};
