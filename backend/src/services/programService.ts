import Razorpay from 'razorpay';
import prisma from '../db/prisma';
import { verifyRazorpaySignature } from '../utils/razorpay';

let razorpay: Razorpay | null = null;
const getRazorpay = () => {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return razorpay;
};

export const programService = {
  async getPrograms(filters: {
    domain?: string; level?: string; duration?: string; search?: string;
    page?: number; limit?: number; userId?: number;
  }) {
    const { domain, level, duration, search, page = 1, limit = 9, userId } = filters;
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
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        select: {
          id: true, title: true, description: true, domain: true,
          level: true, duration: true, thumbnail: true, instructor: true,
          price: true, isActive: true, createdAt: true,
          _count: { select: { enrollments: true } },
        },
      }),
      prisma.program.count({ where }),
    ]);

    let enrolledProgramIds = new Set<number>();
    if (userId) {
      const enrollments = await prisma.programEnrollment.findMany({
        where: { userId, programId: { in: programs.map(p => p.id) } },
        select: { programId: true },
      });
      enrolledProgramIds = new Set(enrollments.map(e => e.programId));
    }

    return {
      programs: programs.map(p => ({ ...p, isEnrolled: enrolledProgramIds.has(p.id) })),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getProgramById(id: number) {
    return prisma.program.findUnique({
      where: { id },
      include: {
        _count: { select: { enrollments: true } },
        modules: {
          orderBy: { order: 'asc' },
          include: { lessons: { orderBy: { order: 'asc' }, select: { id: true, title: true, duration: true, order: true } } },
        },
      },
    });
  },

  async getProgramContent(programId: number, userId: number) {
    const enrollment = await prisma.programEnrollment.findUnique({
      where: { userId_programId: { userId, programId } },
    });
    if (!enrollment) return null;

    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: { modules: { orderBy: { order: 'asc' }, include: { lessons: { orderBy: { order: 'asc' } } } } },
    });
    if (!program) return null;

    const lessonIds = program.modules.flatMap(m => m.lessons.map(l => l.id));
    const progressRecords = await prisma.lessonProgress.findMany({
      where: { userId, lessonId: { in: lessonIds } },
    });
    const completedLessons = progressRecords.filter(p => p.completed).map(p => p.lessonId);
    return { program, enrollment, completedLessons };
  },

  async getLessonById(lessonId: number, userId: number) {
    const lesson = await prisma.programLesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { program: true } } },
    });
    if (!lesson) return null;
    const enrollment = await prisma.programEnrollment.findUnique({
      where: { userId_programId: { userId, programId: lesson.module.programId } },
    });
    if (!enrollment) return null;
    const progress = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
    return { lesson, completed: progress?.completed || false };
  },

  async markLessonComplete(userId: number, lessonId: number, completed: boolean) {
    const result = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completed, watchedAt: new Date() },
      create: { userId, lessonId, completed },
    });

    const lesson = await prisma.programLesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { program: { include: { modules: { include: { lessons: true } } } } } } },
    });
    if (lesson) {
      const programId = lesson.module.programId;
      const allLessons = lesson.module.program.modules.flatMap(m => m.lessons);
      const completedCount = await prisma.lessonProgress.count({
        where: { userId, lessonId: { in: allLessons.map(l => l.id) }, completed: true },
      });
      const progress = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;
      await prisma.programEnrollment.update({
        where: { userId_programId: { userId, programId } },
        data: { progress, status: progress >= 100 ? 'completed' : 'active' },
      });
    }
    return result;
  },

  async getAllProgramsForAdmin() {
    return prisma.program.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, description: true, domain: true, level: true,
        duration: true, thumbnail: true, instructor: true, price: true,
        isActive: true, createdAt: true, updatedAt: true,
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
    title: string; description: string; domain: string; level: string;
    duration: string; thumbnail?: string; instructor: string; price?: number;
  }) {
    return prisma.program.create({ data });
  },

  async updateProgram(id: number, data: Partial<{
    title: string; description: string; domain: string; level: string;
    duration: string; thumbnail: string; instructor: string; price: number; isActive: boolean;
  }>) {
    return prisma.program.update({ where: { id }, data });
  },

  async deleteProgram(id: number) {
    return prisma.program.delete({ where: { id } });
  },

  // ── Module / Lesson CRUD ──────────────────────────────────────
  async getModules(programId: number) {
    return prisma.programModule.findMany({
      where: { programId }, orderBy: { order: 'asc' },
      include: { lessons: { orderBy: { order: 'asc' } } },
    });
  },

  async createModule(data: { programId: number; title: string; description?: string; order?: number; isLocked?: boolean }) {
    return prisma.programModule.create({ data });
  },

  async updateModule(id: number, data: Partial<{ title: string; description: string; order: number; isLocked: boolean }>) {
    return prisma.programModule.update({ where: { id }, data });
  },

  async deleteModule(id: number) {
    return prisma.programModule.delete({ where: { id } });
  },

  async createLesson(data: {
    moduleId: number; title: string; description?: string; duration?: string;
    videoUrl?: string; videoUrl360p?: string; videoUrl480p?: string; videoUrl720p?: string;
    order?: number; resources?: any; keyTakeaway?: string;
  }) {
    return prisma.programLesson.create({ data });
  },

  async updateLesson(id: number, data: Partial<{
    title: string; description: string; duration: string;
    videoUrl: string; videoUrl360p: string; videoUrl480p: string; videoUrl720p: string;
    order: number; resources: any; keyTakeaway: string;
  }>) {
    return prisma.programLesson.update({ where: { id }, data });
  },

  async deleteLesson(id: number) {
    return prisma.programLesson.delete({ where: { id } });
  },

  // ── Enrollment ────────────────────────────────────────────────
  async enrollUser(userId: number, programId: number) {
    const existing = await prisma.programEnrollment.findUnique({
      where: { userId_programId: { userId, programId } },
    });
    if (existing) return existing;
    return prisma.programEnrollment.create({
      data: { userId, programId }, include: { program: true },
    });
  },

  async updateProgress(userId: number, programId: number, progress: number, currentModule?: string) {
    return prisma.programEnrollment.update({
      where: { userId_programId: { userId, programId } },
      data: { progress, currentModule, status: progress >= 100 ? 'completed' : 'active' },
    });
  },

  async getUserEnrollments(userId: number) {
    return prisma.programEnrollment.findMany({
      where: { userId }, include: { program: true }, orderBy: { enrolledAt: 'desc' },
    });
  },

  // ── Program Payment ───────────────────────────────────────────
  async createProgramOrder(userId: number, programId: number) {
    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program) throw new Error('Program not found');
    if (!program.price || program.price === 0) throw new Error('This program is free');

    const existing = await prisma.programEnrollment.findUnique({
      where: { userId_programId: { userId, programId } },
    });
    if (existing) throw new Error('Already enrolled in this program');

    const razorpayOrder = await getRazorpay().orders.create({
      amount: program.price * 100,
      currency: 'INR',
      receipt: `prog_${programId}_${Date.now()}`,
    });

    await prisma.programOrder.create({
      data: { userId, programId, razorpayOrderId: razorpayOrder.id, amount: program.price, currency: 'INR', status: 'created' },
    });

    return {
      orderId: razorpayOrder.id,
      amount: program.price,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      program: { id: program.id, title: program.title, price: program.price },
    };
  },

  async verifyProgramPayment(orderId: string, paymentId: string, signature: string) {
    const isValid = verifyRazorpaySignature(orderId, paymentId, signature, process.env.RAZORPAY_KEY_SECRET!);
    if (!isValid) throw new Error('Invalid payment signature');

    const order = await prisma.programOrder.findUnique({ where: { razorpayOrderId: orderId } });
    if (!order) throw new Error('Order not found');

    await prisma.$transaction(async (tx) => {
      await tx.programPayment.create({
        data: { orderId: order.id, razorpayPaymentId: paymentId, razorpaySignature: signature, status: 'success' },
      });
      await tx.programOrder.update({ where: { id: order.id }, data: { status: 'paid' } });
      await tx.programEnrollment.upsert({
        where: { userId_programId: { userId: order.userId, programId: order.programId } },
        update: {},
        create: { userId: order.userId, programId: order.programId },
      });
    });

    return { success: true, programId: order.programId };
  },

  async getFilterOptions() {
    const [domains, levels, durations] = await Promise.all([
      prisma.program.findMany({ where: { isActive: true }, select: { domain: true }, distinct: ['domain'] }),
      prisma.program.findMany({ where: { isActive: true }, select: { level: true }, distinct: ['level'] }),
      prisma.program.findMany({ where: { isActive: true }, select: { duration: true }, distinct: ['duration'] }),
    ]);
    return {
      domains: domains.map(d => d.domain),
      levels: levels.map(l => l.level),
      durations: durations.map(d => d.duration),
    };
  },
};
