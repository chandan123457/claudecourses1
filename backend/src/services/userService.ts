import prisma from '../db/prisma';

// Enhanced User service methods using Prisma ORM
export const userService = {
  // Create new user (upsert - create or update if exists)
  async createUser(firebaseUid: string, phone: string, name: string, email: string) {
    const user = await prisma.user.upsert({
      where: { firebaseUid },
      create: {
        firebaseUid,
        phone,
        name,
        email,
      },
      update: {
        name,
        email,
      },
      select: {
        id: true,
        firebaseUid: true,
        phone: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
    return user;
  },

  // Get user by Firebase UID with enrolled courses
  async getUserByFirebaseUid(firebaseUid: string) {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: {
        id: true,
        firebaseUid: true,
        phone: true,
        name: true,
        email: true,
        createdAt: true,
        courseEnrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                image: true,
                teacher: true,
                price: true,
                startDate: true,
                endDate: true,
                isActive: true,
              },
            },
          },
        },
        webinarRegistrations: {
          include: {
            webinar: {
              select: {
                id: true,
                title: true,
                image: true,
                teacher: true,
                date: true,
                time: true,
                isActive: true,
              },
            },
          },
        },
        orders: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                price: true,
              },
            },
            payment: {
              select: {
                status: true,
                paidAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    return user;
  },

  // Check if a phone number is already registered
  async getUserByPhone(phone: string) {
    const user = await prisma.user.findFirst({
      where: { phone },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
      },
    });
    return user;
  },

  // Get user by email
  async getUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firebaseUid: true,
        phone: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
    return user;
  },

  // Check if user is enrolled in a specific course
  async isUserEnrolledInCourse(userId: number, courseId: number) {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });
    return !!enrollment;
  },

  // Get user's purchased courses
  async getUserCourses(userId: number) {
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            image: true,
            teacher: true,
            price: true,
            startDate: true,
            endDate: true,
            telegramLink: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    return enrollments.map(enrollment => ({
      enrolledAt: enrollment.enrolledAt,
      course: enrollment.course,
    }));
  },

  // Get user dashboard stats
  async getUserStats(userId: number) {
    const [enrollmentCount, orderCount, webinarCount] = await Promise.all([
      prisma.courseEnrollment.count({
        where: { userId },
      }),
      prisma.order.count({
        where: {
          userId,
          status: 'paid',
        },
      }),
      prisma.webinarRegistration.count({
        where: { userId },
      }),
    ]);

    return {
      enrolledCourses: enrollmentCount,
      completedOrders: orderCount,
      registeredWebinars: webinarCount,
    };
  },
};