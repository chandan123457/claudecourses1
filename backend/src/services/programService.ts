import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../db/prisma';
import { verifyRazorpaySignature } from '../utils/razorpay';
import { uploadDocumentToCloudinary } from '../utils/imageUpload';
import { getProgramAccessMeta } from '../utils/programAccess';

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

const assignmentIncludeForStudent = (userId: number) => ({
  assignment: {
    include: {
      submissions: {
        where: { userId },
        orderBy: { submittedAt: 'desc' as const },
        take: 1,
        include: {
          comments: { orderBy: { createdAt: 'asc' as const } },
        },
      },
    },
  },
});

const mapAssignmentComment = (comment: any) => ({
  id: comment.id,
  comment: comment.comment,
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
});

const mapAssignmentSubmission = (submission: any) => {
  if (!submission) return null;

  return {
    id: submission.id,
    fileUrl: submission.fileUrl,
    fileName: submission.fileName,
    githubLink: submission.githubLink,
    status: submission.status,
    submittedAt: submission.submittedAt,
    updatedAt: submission.updatedAt,
    comments: (submission.comments || []).map(mapAssignmentComment),
  };
};

const mapAssignmentForStudent = (assignment: any) => {
  if (!assignment || !assignment.isEnabled) return null;

  return {
    id: assignment.id,
    moduleId: assignment.moduleId,
    title: assignment.title,
    description: assignment.description,
    dueDate: assignment.dueDate,
    allowFileUpload: assignment.allowFileUpload,
    allowGithubLink: assignment.allowGithubLink,
    allowResubmission: assignment.allowResubmission,
    submission: mapAssignmentSubmission(assignment.submissions?.[0] || null),
  };
};

const mapAssignmentForAdmin = (assignment: any) => {
  if (!assignment) return null;

  return {
    id: assignment.id,
    moduleId: assignment.moduleId,
    title: assignment.title,
    description: assignment.description,
    dueDate: assignment.dueDate,
    allowFileUpload: assignment.allowFileUpload,
    allowGithubLink: assignment.allowGithubLink,
    allowResubmission: assignment.allowResubmission,
    isEnabled: assignment.isEnabled,
  };
};

const normalizeAssignmentInput = (assignment?: any) => {
  if (!assignment) return null;

  const isEnabled = Boolean(assignment.isEnabled);
  const normalized = {
    isEnabled,
    title: assignment.title?.trim() || '',
    description: assignment.description?.trim() || '',
    dueDate: assignment.dueDate ? new Date(assignment.dueDate) : null,
    allowFileUpload: assignment.allowFileUpload !== false,
    allowGithubLink: Boolean(assignment.allowGithubLink),
    allowResubmission: Boolean(assignment.allowResubmission),
  };

  if (!isEnabled) {
    return normalized;
  }

  if (!normalized.title || !normalized.description) {
    throw new Error('Assignment title and description are required when assignment is enabled');
  }

  if (!normalized.allowFileUpload && !normalized.allowGithubLink) {
    throw new Error('Enable at least one assignment submission type');
  }

  if (normalized.dueDate && Number.isNaN(normalized.dueDate.getTime())) {
    throw new Error('Invalid assignment due date');
  }

  return normalized;
};

const withEnrollmentAccess = (enrollment: any, durationLabel?: string | null) => {
  if (!enrollment) return enrollment;
  return {
    ...enrollment,
    ...getProgramAccessMeta(enrollment.enrolledAt, durationLabel ?? enrollment.program?.duration),
  };
};

const ensureEnrollmentAccess = (enrollment: any, durationLabel?: string | null) => {
  if (!enrollment) return null;

  const accessMeta = getProgramAccessMeta(enrollment.enrolledAt, durationLabel ?? enrollment.program?.duration);
  if (!accessMeta.accessActive) {
    throw new Error('Program access has expired. Please enroll again to continue learning.');
  }

  return {
    ...enrollment,
    ...accessMeta,
  };
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

    let enrollmentMap = new Map<number, any>();
    if (userId) {
      const enrollments = await prisma.programEnrollment.findMany({
        where: { userId, programId: { in: programs.map(p => p.id) } },
        select: {
          id: true,
          programId: true,
          enrolledAt: true,
          progress: true,
          status: true,
          program: {
            select: {
              duration: true,
            },
          },
        },
      });
      enrollmentMap = new Map(enrollments.map((enrollment) => [enrollment.programId, withEnrollmentAccess(enrollment)]));
    }

    return {
      programs: programs.map((program) => {
        const enrollment = enrollmentMap.get(program.id);
        return {
          ...program,
          isEnrolled: Boolean(enrollment?.accessActive),
          hasEnrollmentHistory: Boolean(enrollment),
          accessActive: enrollment?.accessActive ?? false,
          accessExpired: enrollment?.accessExpired ?? false,
          accessEndDate: enrollment?.accessEndDate ?? null,
          accessDaysRemaining: enrollment?.accessDaysRemaining ?? null,
          enrollmentProgress: enrollment?.progress ?? 0,
        };
      }),
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
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: { orderBy: { order: 'asc' } },
            assignment: true,
          },
        },
      },
    });
    if (!program) return null;

    const enrollment = await prisma.programEnrollment.findUnique({
      where: { userId_programId: { userId, programId } },
    });
    const activeEnrollment = ensureEnrollmentAccess(enrollment, program.duration);
    if (!activeEnrollment) return null;

    const lessonIds = program.modules.flatMap(m => m.lessons.map(l => l.id));
    const progressRecords = await prisma.lessonProgress.findMany({
      where: { userId, lessonId: { in: lessonIds } },
    });
    const completedLessons = progressRecords.filter(p => p.completed).map(p => p.lessonId);
    return {
      program: {
        ...program,
        modules: program.modules.map((module) => ({
          ...module,
          assignment: mapAssignmentForAdmin(module.assignment),
        })),
      },
      enrollment: activeEnrollment,
      completedLessons,
    };
  },

  async getLessonById(lessonId: number, userId: number) {
    const lesson = await prisma.programLesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            program: true,
            ...assignmentIncludeForStudent(userId),
          },
        },
      },
    });
    if (!lesson) return null;
    const enrollment = await prisma.programEnrollment.findUnique({
      where: { userId_programId: { userId, programId: lesson.module.programId } },
    });
    const activeEnrollment = ensureEnrollmentAccess(enrollment, lesson.module.program.duration);
    if (!activeEnrollment) return null;
    const progress = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    return {
      lesson,
      assignment: mapAssignmentForStudent(lesson.module.assignment),
      completed: progress?.completed || false,
    };
  },

  async markLessonComplete(userId: number, lessonId: number, completed: boolean) {
    const lessonRecord = await prisma.programLesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            program: {
              select: {
                id: true,
                duration: true,
              },
            },
          },
        },
      },
    });
    if (!lessonRecord) {
      throw new Error('Lesson not found');
    }

    const existingEnrollment = await prisma.programEnrollment.findUnique({
      where: { userId_programId: { userId, programId: lessonRecord.module.programId } },
    });
    ensureEnrollmentAccess(existingEnrollment, lessonRecord.module.program.duration);

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
      include: { lessons: { orderBy: { order: 'asc' } }, assignment: true },
    });
  },

  async createModule(data: {
    programId: number; title: string; description?: string; order?: number; isLocked?: boolean; assignment?: any;
  }) {
    const assignment = normalizeAssignmentInput(data.assignment);
    const module = await prisma.programModule.create({
      data: {
        programId: data.programId,
        title: data.title,
        description: data.description,
        order: data.order,
        isLocked: data.isLocked,
      },
    });

    if (assignment?.isEnabled) {
      await prisma.programAssignment.create({
        data: {
          moduleId: module.id,
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate,
          allowFileUpload: assignment.allowFileUpload,
          allowGithubLink: assignment.allowGithubLink,
          allowResubmission: assignment.allowResubmission,
          isEnabled: true,
        },
      });
    }

    const createdModule = await prisma.programModule.findUnique({
      where: { id: module.id },
      include: { lessons: { orderBy: { order: 'asc' } }, assignment: true },
    });

    if (!createdModule) {
      throw new Error('Module could not be loaded after creation');
    }

    return createdModule;
  },

  async updateModule(id: number, data: Partial<{
    title: string; description: string; order: number; isLocked: boolean; assignment: any;
  }>) {
    const { assignment: assignmentInput, ...moduleData } = data;
    const assignment = assignmentInput !== undefined ? normalizeAssignmentInput(assignmentInput) : undefined;

    await prisma.programModule.update({ where: { id }, data: moduleData });

    if (assignment !== undefined) {
      const existingAssignment = await prisma.programAssignment.findUnique({ where: { moduleId: id } });

      if (assignment?.isEnabled) {
        if (existingAssignment) {
          await prisma.programAssignment.update({
            where: { moduleId: id },
            data: {
              title: assignment.title,
              description: assignment.description,
              dueDate: assignment.dueDate,
              allowFileUpload: assignment.allowFileUpload,
              allowGithubLink: assignment.allowGithubLink,
              allowResubmission: assignment.allowResubmission,
              isEnabled: true,
            },
          });
        } else {
          await prisma.programAssignment.create({
            data: {
              moduleId: id,
              title: assignment.title,
              description: assignment.description,
              dueDate: assignment.dueDate,
              allowFileUpload: assignment.allowFileUpload,
              allowGithubLink: assignment.allowGithubLink,
              allowResubmission: assignment.allowResubmission,
              isEnabled: true,
            },
          });
        }
      } else if (existingAssignment) {
        await prisma.programAssignment.update({
          where: { moduleId: id },
          data: { isEnabled: false },
        });
      }
    }

    const updatedModule = await prisma.programModule.findUnique({
      where: { id },
      include: { lessons: { orderBy: { order: 'asc' } }, assignment: true },
    });

    if (!updatedModule) {
      throw new Error('Module could not be loaded after update');
    }

    return updatedModule;
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

  async submitAssignment(userId: number, assignmentId: number, payload: {
    githubLink?: string;
    file?: Express.Multer.File;
  }) {
    const assignment = await prisma.programAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        module: {
          include: {
            program: {
              select: {
                duration: true,
              },
            },
          },
        },
        submissions: {
          where: { userId },
          orderBy: { submittedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!assignment || !assignment.isEnabled) {
      throw new Error('Assignment not found');
    }

    const enrollment = await prisma.programEnrollment.findUnique({
      where: {
        userId_programId: {
          userId,
          programId: assignment.module.programId,
        },
      },
    });

    if (!enrollment) {
      throw new Error('Not enrolled in this program');
    }
    ensureEnrollmentAccess(enrollment, assignment.module.program.duration);

    const githubLink = payload.githubLink?.trim() || '';
    const file = payload.file;

    if (assignment.allowFileUpload && !assignment.allowGithubLink && !file) {
      throw new Error('A file upload is required for this assignment');
    }

    if (!assignment.allowFileUpload && assignment.allowGithubLink && !githubLink) {
      throw new Error('A GitHub repository link is required for this assignment');
    }

    if (!assignment.allowFileUpload && file) {
      throw new Error('File upload is not enabled for this assignment');
    }

    if (!assignment.allowGithubLink && githubLink) {
      throw new Error('GitHub repository link is not enabled for this assignment');
    }

    if (!file && !githubLink) {
      throw new Error('Submit either a file, a GitHub repository link, or both');
    }

    if (githubLink && (!/^https?:\/\//i.test(githubLink) || !githubLink.includes('github.com'))) {
      throw new Error('Enter a valid GitHub repository link');
    }

    if (assignment.submissions.length > 0 && !assignment.allowResubmission) {
      throw new Error('This assignment has already been submitted');
    }

    let fileUrl: string | undefined;
    let fileName: string | undefined;

    if (file) {
      const safeName = `assignment-${assignmentId}-${userId}-${Date.now()}-${file.originalname}`;
      const upload = await uploadDocumentToCloudinary(file.buffer, 'programs/assignments', safeName);
      fileUrl = upload.secure_url;
      fileName = file.originalname;
    }

    const submission = await prisma.programAssignmentSubmission.create({
      data: {
        assignmentId,
        moduleId: assignment.moduleId,
        userId,
        fileUrl,
        fileName,
        githubLink: githubLink || null,
        status: 'submitted',
      },
      include: {
        comments: { orderBy: { createdAt: 'asc' } },
      },
    });

    return mapAssignmentSubmission(submission);
  },

  async getAssignmentSubmissionsForAdmin(programId: number, filters: { moduleId?: number; userId?: number }) {
    const where: any = {
      assignment: {
        module: {
          programId,
        },
      },
    };

    if (filters.moduleId) where.moduleId = filters.moduleId;
    if (filters.userId) where.userId = filters.userId;

    const submissions = await prisma.programAssignmentSubmission.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        assignment: {
          include: {
            module: {
              select: { id: true, title: true, programId: true },
            },
          },
        },
        comments: { orderBy: { createdAt: 'asc' } },
      },
    });

    return submissions.map((submission) => ({
      id: submission.id,
      moduleId: submission.moduleId,
      userId: submission.userId,
      assignmentId: submission.assignmentId,
      fileUrl: submission.fileUrl,
      fileName: submission.fileName,
      githubLink: submission.githubLink,
      submittedAt: submission.submittedAt,
      updatedAt: submission.updatedAt,
      status: submission.status,
      user: submission.user,
      assignment: {
        id: submission.assignment.id,
        title: submission.assignment.title,
        dueDate: submission.assignment.dueDate,
      },
      module: submission.assignment.module,
      comments: submission.comments.map(mapAssignmentComment),
    }));
  },

  async reviewAssignmentSubmission(submissionId: number, payload: { status: string; comment?: string }) {
    const submission = await prisma.programAssignmentSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new Error('Assignment submission not found');
    }

    const nextStatus = payload.status?.trim() || 'reviewed';
    const comment = payload.comment?.trim();

    await prisma.$transaction(async (tx) => {
      await tx.programAssignmentSubmission.update({
        where: { id: submissionId },
        data: { status: nextStatus },
      });

      if (comment) {
        await tx.programAssignmentComment.create({
          data: {
            submissionId,
            assignmentId: submission.assignmentId,
            moduleId: submission.moduleId,
            userId: submission.userId,
            comment,
          },
        });
      }
    });

    const updated = await prisma.programAssignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        assignment: {
          include: {
            module: { select: { id: true, title: true, programId: true } },
          },
        },
        comments: { orderBy: { createdAt: 'asc' } },
      },
    });

    return {
      id: updated!.id,
      moduleId: updated!.moduleId,
      userId: updated!.userId,
      assignmentId: updated!.assignmentId,
      fileUrl: updated!.fileUrl,
      fileName: updated!.fileName,
      githubLink: updated!.githubLink,
      submittedAt: updated!.submittedAt,
      updatedAt: updated!.updatedAt,
      status: updated!.status,
      user: updated!.user,
      assignment: {
        id: updated!.assignment.id,
        title: updated!.assignment.title,
        dueDate: updated!.assignment.dueDate,
      },
      module: updated!.assignment.module,
      comments: updated!.comments.map(mapAssignmentComment),
    };
  },

  // ── Enrollment ────────────────────────────────────────────────
  async enrollUser(userId: number, programId: number) {
    const existing = await prisma.programEnrollment.findUnique({
      where: { userId_programId: { userId, programId } },
      include: { program: true },
    });
    if (existing) {
      const accessMeta = getProgramAccessMeta(existing.enrolledAt, existing.program?.duration);
      if (accessMeta.accessActive) {
        return withEnrollmentAccess(existing);
      }

      const renewedEnrollment = await prisma.programEnrollment.update({
        where: { id: existing.id },
        data: {
          enrolledAt: new Date(),
          status: existing.progress >= 100 ? 'completed' : 'active',
        },
        include: { program: true },
      });
      return withEnrollmentAccess(renewedEnrollment);
    }
    return prisma.programEnrollment.create({
      data: { userId, programId }, include: { program: true },
    }).then((enrollment) => withEnrollmentAccess(enrollment));
  },

  async updateProgress(userId: number, programId: number, progress: number, currentModule?: string) {
    const enrollment = await prisma.programEnrollment.findUnique({
      where: { userId_programId: { userId, programId } },
      include: {
        program: {
          select: {
            duration: true,
          },
        },
      },
    });
    ensureEnrollmentAccess(enrollment);

    return prisma.programEnrollment.update({
      where: { userId_programId: { userId, programId } },
      data: { progress, currentModule, status: progress >= 100 ? 'completed' : 'active' },
    });
  },

  async getUserEnrollments(userId: number) {
    const enrollments = await prisma.programEnrollment.findMany({
      where: { userId }, include: { program: true }, orderBy: { enrolledAt: 'desc' },
    });
    return enrollments.map((enrollment) => withEnrollmentAccess(enrollment));
  },

  // ── Program Payment ───────────────────────────────────────────
  async createProgramOrder(userId: number | null, programId: number) {
    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program) throw new Error('Program not found');
    if (!program.price || program.price === 0) throw new Error('This program is free');

    if (userId) {
      const existing = await prisma.programEnrollment.findUnique({
        where: { userId_programId: { userId, programId } },
      });
      if (existing && getProgramAccessMeta(existing.enrolledAt, program.duration).accessActive) {
        throw new Error('Already enrolled in this program');
      }
    }

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

    if (order.status === 'paid') {
      if (!order.userId) {
        const claimToken = order.claimToken || crypto.randomUUID();
        if (!order.claimToken) {
          await prisma.programOrder.update({
            where: { id: order.id },
            data: { claimToken },
          });
        }
        return { success: true, programId: order.programId, requiresAccount: true, claimToken };
      }
      return { success: true, programId: order.programId, requiresAccount: false };
    }

    const claimToken = order.userId ? null : crypto.randomUUID();

    await prisma.$transaction(async (tx) => {
      await tx.programPayment.upsert({
        where: { orderId: order.id },
        update: { status: 'success' },
        create: { orderId: order.id, razorpayPaymentId: paymentId, razorpaySignature: signature, status: 'success' },
      });
      await tx.programOrder.update({
        where: { id: order.id },
        data: { status: 'paid', ...(claimToken ? { claimToken } : {}) },
      });
      if (order.userId) {
        await tx.programEnrollment.upsert({
          where: { userId_programId: { userId: order.userId, programId: order.programId } },
          update: {
            enrolledAt: new Date(),
            status: 'active',
          },
          create: { userId: order.userId, programId: order.programId },
        });
      }
    });

    return {
      success: true,
      programId: order.programId,
      requiresAccount: !order.userId,
      ...(claimToken ? { claimToken } : {}),
    };
  },

  async claimPaidProgramOrder(userId: number, claimToken: string) {
    const order = await prisma.programOrder.findUnique({
      where: { claimToken },
      include: { payment: true },
    });

    if (!order || order.status !== 'paid' || !order.payment) {
      throw new Error('Paid program order not found');
    }
    if (order.userId && order.userId !== userId) {
      throw new Error('This program order has already been claimed');
    }

    return prisma.$transaction(async (tx) => {
      await tx.programOrder.update({
        where: { id: order.id },
        data: { userId, claimToken: null, claimedAt: new Date() },
      });

      return tx.programEnrollment.upsert({
        where: { userId_programId: { userId, programId: order.programId } },
        update: {
          enrolledAt: new Date(),
          status: 'active',
        },
        create: { userId, programId: order.programId },
        include: { program: true },
      }).then((enrollment) => withEnrollmentAccess(enrollment));
    });
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
