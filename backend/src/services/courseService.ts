import prisma from '../db/prisma';

export const courseService = {
  // Create new course (Admin)
  async createCourse(data: {
    title: string;
    image: string;
    description: string;
    syllabus: string;
    teacher: string;
    price: number;
    start_date: string;
    end_date: string;
    telegram_link?: string;
  }) {
    const course = await prisma.course.create({
      data: {
        title: data.title,
        image: data.image,
        description: data.description,
        syllabus: data.syllabus,
        teacher: data.teacher,
        price: data.price,
        startDate: new Date(data.start_date).toISOString(),
        endDate: new Date(data.end_date).toISOString(),
        telegramLink: data.telegram_link || null,
      },
    });
    return course;
  },

  // Get all active courses
  async getAllCourses() {
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      orderBy: { startDate: 'asc' },
    });
    return courses;
  },

  // Get course by ID
  async getCourseById(id: number) {
    const course = await prisma.course.findFirst({
      where: {
        id,
        isActive: true,
      },
    });
    return course;
  },

  // Update course (Admin)
  async updateCourse(id: number, data: Partial<{
    title: string;
    image: string;
    description: string;
    syllabus: string;
    teacher: string;
    price: number;
    start_date: string;
    end_date: string;
    telegram_link: string;
    is_active: boolean;
  }>) {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.syllabus !== undefined) updateData.syllabus = data.syllabus;
    if (data.teacher !== undefined) updateData.teacher = data.teacher;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.start_date !== undefined) updateData.startDate = new Date(data.start_date).toISOString();
    if (data.end_date !== undefined) updateData.endDate = new Date(data.end_date).toISOString();
    if (data.telegram_link !== undefined) updateData.telegramLink = data.telegram_link;
    if (data.is_active !== undefined) updateData.isActive = data.is_active;

    const course = await prisma.course.update({
      where: { id },
      data: updateData,
    });
    return course;
  },

  // Delete course (Admin)
  async deleteCourse(id: number) {
    await prisma.course.delete({
      where: { id },
    });
  },

  // Check if user is enrolled
  async isUserEnrolled(userId: number, courseId: number) {
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        userId,
        courseId,
      },
    });
    return !!enrollment;
  },

  // Get user's enrolled courses
  async getUserCourses(userId: number) {
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId },
      include: {
        course: true,
      },
    });

    return enrollments
      .map(e => e.course)
      .filter(c => c && c.isActive)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  },

  // Enroll user in course
  async enrollUser(userId: number, courseId: number, orderId: number) {
    const enrollment = await prisma.courseEnrollment.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      create: {
        userId,
        courseId,
        orderId,
      },
      update: {},
    });
    return enrollment;
  },
};