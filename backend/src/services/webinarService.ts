import prisma from '../db/prisma';

export const webinarService = {
  // Create new webinar (Admin)
  async createWebinar(data: {
    title: string;
    image: string;
    description: string;
    teacher: string;
    date: string;
    time: string;
  }) {
    const webinar = await prisma.webinar.create({
      data: {
        title: data.title,
        image: data.image,
        description: data.description,
        teacher: data.teacher,
        date: new Date(data.date).toISOString(),
        time: data.time,
      },
    });
    return webinar;
  },

  // Get all active webinars
  async getAllWebinars() {
    const webinars = await prisma.webinar.findMany({
      where: { isActive: true },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' },
      ],
    });
    return webinars;
  },

  // Get webinar by ID
  async getWebinarById(id: number) {
    const webinar = await prisma.webinar.findFirst({
      where: {
        id,
        isActive: true,
      },
    });
    return webinar;
  },

  // Update webinar (Admin)
  async updateWebinar(id: number, data: Partial<{
    title: string;
    image: string;
    description: string;
    teacher: string;
    date: string;
    time: string;
    is_active: boolean;
  }>) {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.teacher !== undefined) updateData.teacher = data.teacher;
    if (data.date !== undefined) updateData.date = new Date(data.date).toISOString();
    if (data.time !== undefined) updateData.time = data.time;
    if (data.is_active !== undefined) updateData.isActive = data.is_active;

    const webinar = await prisma.webinar.update({
      where: { id },
      data: updateData,
    });
    return webinar;
  },

  // Delete webinar (Admin)
  async deleteWebinar(id: number) {
    await prisma.webinar.delete({
      where: { id },
    });
  },

  // Register user for webinar
  async registerForWebinar(userId: number, webinarId: number) {
    const registration = await prisma.webinarRegistration.upsert({
      where: {
        userId_webinarId: {
          userId,
          webinarId,
        },
      },
      create: {
        userId,
        webinarId,
      },
      update: {},
    });
    return registration;
  },

  // Check if user is registered
  async isUserRegistered(userId: number, webinarId: number) {
    const registration = await prisma.webinarRegistration.findFirst({
      where: {
        userId,
        webinarId,
      },
    });
    return !!registration;
  },

  // Get user's registered webinars
  async getUserWebinars(userId: number) {
    const registrations = await prisma.webinarRegistration.findMany({
      where: { userId },
      include: {
        webinar: true,
      },
    });

    return registrations
      .map(r => r.webinar)
      .filter(w => w && w.isActive)
      .sort((a, b) => {
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare === 0) {
          return a.time.localeCompare(b.time);
        }
        return dateCompare;
      });
  },
};