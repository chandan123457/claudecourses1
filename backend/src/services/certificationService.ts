import crypto from 'crypto';
import Razorpay from 'razorpay';
import prisma from '../db/prisma';
import { verifyRazorpaySignature } from '../utils/razorpay';
import { uploadDocumentToCloudinary } from '../utils/imageUpload';

const formatCurrency = (value: number) => Math.max(0, Math.round(value));

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const sampleProjects = [
  {
    title: 'Automated Inventory Opt.',
    slug: 'automated-inventory-optimization',
    domain: 'Supply Chain',
    difficulty: 'Intermediate',
    durationWeeks: 4,
    shortDescription: 'Optimize warehouse stock levels using predictive analytics to reduce carrying costs and stockouts.',
    description:
      'Design and implement an inventory intelligence workflow for a fast-moving warehouse network. The solution should forecast demand, surface replenishment risk, and recommend stocking actions for multi-location operations.',
    bannerLabel: 'SUPPLY CHAIN DOMAIN',
    thumbnail:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    tags: ['Python', 'Data Analysis', 'Logistics'],
    eligibility: 'Certification Eligible',
    basePrice: 1500,
    platformFee: 55,
    popularScore: 82,
    plans: [
      {
        name: '1-Month Track',
        subtitle: 'Intensive Fast-track',
        durationLabel: '1 Mo',
        price: 1500,
        isRecommended: false,
        sortOrder: 1,
        features: ['Structured Roadmap', 'Automated Audit', 'Live Mock Interviews', 'Core Milestones'],
      },
      {
        name: '3-Month Track',
        subtitle: 'Comprehensive Mastery',
        durationLabel: '3 Mo',
        price: 2500,
        isRecommended: true,
        sortOrder: 2,
        features: ['Personalized Roadmap', 'Weekly Expert Audit', '3 Live Mock Interviews', 'Advanced Milestones'],
      },
    ],
    sections: [
      { sectionKey: 'roadmap', title: 'Demand Forecasting Foundations', description: 'Build replenishment-ready demand views with rolling seasonal signals.', stepNumber: 1, sortOrder: 1 },
      { sectionKey: 'roadmap', title: 'Inventory Risk Modeling', description: 'Estimate stockout probability, reorder triggers, and supplier variance impact.', stepNumber: 2, sortOrder: 2 },
      { sectionKey: 'roadmap', title: 'Operations Dashboard', description: 'Present warehouse KPIs, anomalies, and recommendation summaries for planners.', stepNumber: 3, sortOrder: 3 },
      { sectionKey: 'requirements', title: 'Submission Requirements', description: 'Submit a design document, requirements doc, GitHub repository, and live dashboard preview.', sortOrder: 1 },
      { sectionKey: 'evaluation', title: 'Evaluation Flow', description: 'Auto audit validates completeness, mentor review grades business logic, live defense opens after approval.', sortOrder: 1 },
      { sectionKey: 'perks', title: 'Career Perks', description: 'Certificate verification link, mentor feedback notes, and portfolio-ready case study copy.', sortOrder: 1 },
      { sectionKey: 're-evaluation', title: 'Re-evaluation', description: 'Rejected submissions can be revised and resubmitted with a fresh mentor review.', sortOrder: 1 },
    ],
    mentors: [
      {
        name: 'Prof. David Miller',
        title: 'Project Lead',
        bio: 'Supply chain systems mentor focused on warehouse analytics and fulfillment automation.',
        slots: [
          { startTime: '2026-10-18T10:00:00.000Z', endTime: '2026-10-18T10:30:00.000Z' },
          { startTime: '2026-10-19T14:00:00.000Z', endTime: '2026-10-19T14:30:00.000Z' },
        ],
      },
    ],
  },
  {
    title: 'Fraud Detection System',
    slug: 'fraud-detection-system',
    domain: 'Fintech',
    difficulty: 'Advanced',
    durationWeeks: 6,
    shortDescription: 'Build a real-time transaction monitoring system to flag suspicious payment activity.',
    description:
      'Create a real-time fraud detection workflow with streaming risk features, explainable scores, and alert triage designed for payment operations teams.',
    bannerLabel: 'AI & DATA SCIENCE DOMAIN',
    thumbnail:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    tags: ['ML', 'SQL', 'Security'],
    eligibility: 'Certification Eligible',
    basePrice: 1500,
    platformFee: 55,
    popularScore: 96,
    plans: [
      {
        name: '1-Month Track',
        subtitle: 'Audit Sprint',
        durationLabel: '1 Mo',
        price: 1500,
        isRecommended: false,
        sortOrder: 1,
        features: ['Structured Roadmap', 'Automated Audit', 'Live Mock Interviews', 'Core Milestones'],
      },
      {
        name: '3-Month Track',
        subtitle: 'Comprehensive Mastery',
        durationLabel: '3 Mo',
        price: 2500,
        isRecommended: true,
        sortOrder: 2,
        features: ['Personalized Roadmap', 'Weekly Expert Audit', '3 Live Mock Interviews', 'Advanced Milestones'],
      },
    ],
    sections: [
      { sectionKey: 'roadmap', title: 'Foundational Analytics', description: 'Master the core principles of transactional feature engineering and risk labeling.', stepNumber: 1, sortOrder: 1 },
      { sectionKey: 'roadmap', title: 'Predictive Modeling', description: 'Train and validate fraud models with interpretable thresholds for analyst teams.', stepNumber: 2, sortOrder: 2 },
      { sectionKey: 'roadmap', title: 'Capstone Deployment', description: 'Deploy the scoring workflow with alerting and audit-friendly logs.', stepNumber: 3, sortOrder: 3 },
      { sectionKey: 'requirements', title: 'Requirements', description: 'Use Python, SQL, and a production-style deployment note with test evidence.', sortOrder: 1 },
      { sectionKey: 'evaluation', title: 'Evaluation', description: 'Auto audit checks deliverables, mentor review validates model rigor, defense unlocks last.', sortOrder: 1 },
      { sectionKey: 'perks', title: 'Perks', description: 'Includes mentor annotations, certificate issuance, and downloadable outcome summary.', sortOrder: 1 },
      { sectionKey: 're-evaluation', title: 'Re-evaluation', description: 'One guided resubmission loop is included for mentor-reviewed rejection cases.', sortOrder: 1 },
    ],
    mentors: [
      {
        name: 'Prof. David Miller',
        title: 'Project Lead',
        bio: 'Fintech mentor specializing in model governance and operational fraud workflows.',
        slots: [
          { startTime: '2026-10-18T10:00:00.000Z', endTime: '2026-10-18T10:30:00.000Z' },
          { startTime: '2026-10-19T14:00:00.000Z', endTime: '2026-10-19T14:30:00.000Z' },
        ],
      },
    ],
  },
  {
    title: 'Customer Churn Prediction',
    slug: 'customer-churn-prediction',
    domain: 'E-Commerce',
    difficulty: 'Intermediate',
    durationWeeks: 5,
    shortDescription: 'Develop a predictive model to identify customers likely to stop using the platform.',
    description:
      'Build a churn prevention workflow that surfaces at-risk customers, explains intent signals, and translates model output into retention actions.',
    bannerLabel: 'GROWTH ANALYTICS DOMAIN',
    thumbnail:
      'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80',
    tags: ['Pandas', 'Scikit-Learn'],
    eligibility: 'Practice Only',
    basePrice: 1350,
    platformFee: 55,
    popularScore: 71,
    plans: [
      {
        name: '1-Month Track',
        subtitle: 'Retention Sprint',
        durationLabel: '1 Mo',
        price: 1350,
        isRecommended: true,
        sortOrder: 1,
        features: ['Structured Roadmap', 'Automated Audit', '1 Live Review', 'Core Milestones'],
      },
      {
        name: '3-Month Track',
        subtitle: 'Deep Practice',
        durationLabel: '3 Mo',
        price: 2200,
        isRecommended: false,
        sortOrder: 2,
        features: ['Extended roadmap', 'Weekly checkpoints', '3 mentor reviews', 'Advanced milestones'],
      },
    ],
    sections: [
      { sectionKey: 'roadmap', title: 'Customer Signal Mapping', description: 'Structure churn labels, behavioral features, and data quality checks.', stepNumber: 1, sortOrder: 1 },
      { sectionKey: 'roadmap', title: 'Modeling & Segmentation', description: 'Train retention models and cluster risk cohorts for marketing actionability.', stepNumber: 2, sortOrder: 2 },
      { sectionKey: 'roadmap', title: 'Activation Strategy', description: 'Translate outputs into campaigns, health dashboards, and monitoring rules.', stepNumber: 3, sortOrder: 3 },
      { sectionKey: 'requirements', title: 'Requirements', description: 'Deliver a design note, metrics summary, repository link, and activation mockup.', sortOrder: 1 },
      { sectionKey: 'evaluation', title: 'Evaluation', description: 'Practice track still gets auto and mentor feedback, but certificate remains locked.', sortOrder: 1 },
      { sectionKey: 'perks', title: 'Perks', description: 'Includes reusable retention templates and mentor comments for your portfolio.', sortOrder: 1 },
      { sectionKey: 're-evaluation', title: 'Re-evaluation', description: 'Practice-only learners can revise submissions to improve review scores.', sortOrder: 1 },
    ],
    mentors: [
      {
        name: 'Prof. David Miller',
        title: 'Project Lead',
        bio: 'Growth analytics mentor with a focus on ecommerce retention experimentation.',
        slots: [
          { startTime: '2026-10-18T10:00:00.000Z', endTime: '2026-10-18T10:30:00.000Z' },
          { startTime: '2026-10-19T14:00:00.000Z', endTime: '2026-10-19T14:30:00.000Z' },
        ],
      },
    ],
  },
];

const defaultCoupons = [
  {
    code: 'STUDENT25',
    discountType: 'fixed',
    amount: 255,
    minAmount: 1000,
  },
];

const mapProjectCard = (project: any, userEnrollment?: any) => {
  const lowestPlan = project.plans.reduce((best: any, current: any) => {
    if (!best || current.price < best.price) return current;
    return best;
  }, null);

  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    domain: project.domain,
    difficulty: project.difficulty,
    durationWeeks: project.durationWeeks,
    shortDescription: project.shortDescription,
    thumbnail: project.thumbnail,
    tags: project.tags,
    eligibility: project.eligibility,
    startingPrice: lowestPlan?.price || project.basePrice,
    popularScore: project.popularScore,
    isEnrolled: Boolean(userEnrollment),
    enrollmentId: userEnrollment?.id || null,
    planId: userEnrollment?.planId || null,
  };
};

const buildRoadmapSections = (items: any[]) =>
  items.reduce((acc: Record<string, any[]>, item: any) => {
    if (!acc[item.sectionKey]) acc[item.sectionKey] = [];
    acc[item.sectionKey].push(item);
    return acc;
  }, {});

export const certificationService = {
  async ensureSeedData() {
    const count = await prisma.certificationProject.count();
    if (count >= sampleProjects.length) return;

    const studentCoupon = await prisma.certificationCoupon.findUnique({
      where: { code: 'STUDENT25' },
    });

    if (!studentCoupon) {
      await prisma.certificationCoupon.create({
        data: {
          code: 'STUDENT25',
          discountType: 'fixed',
          amount: 255,
          minAmount: 1000,
          isActive: true,
        },
      });
    }

    for (const project of sampleProjects) {
      const existingProject = await prisma.certificationProject.findUnique({
        where: { slug: project.slug },
        select: { id: true },
      });

      if (existingProject) continue;

      await prisma.certificationProject.create({
        data: {
          title: project.title,
          slug: project.slug,
          domain: project.domain,
          difficulty: project.difficulty,
          durationWeeks: project.durationWeeks,
          shortDescription: project.shortDescription,
          description: project.description,
          thumbnail: project.thumbnail,
          bannerLabel: project.bannerLabel,
          tags: project.tags,
          eligibility: project.eligibility,
          basePrice: project.basePrice,
          platformFee: project.platformFee,
          popularScore: project.popularScore,
          certificateEligible: project.eligibility === 'Certification Eligible',
          plans: { create: project.plans as any },
          sectionItems: { create: project.sections as any },
          mentors: {
            create: project.mentors.map((mentor) => ({
              name: mentor.name,
              title: mentor.title,
              bio: mentor.bio,
              slots: { create: mentor.slots as any },
            })) as any,
          },
        } as any,
      });
    }
  },

  async getProjects(filters: {
    search?: string;
    domain?: string;
    difficulty?: string;
    eligibility?: string;
    sort?: string;
    page?: number;
    limit?: number;
    userId?: number;
  }) {
    await this.ensureSeedData();

    const { search, domain, difficulty, eligibility, sort = 'newest', page = 1, limit = 6, userId } = filters;
    const where: any = { isActive: true };

    if (domain) where.domain = domain;
    if (difficulty) where.difficulty = difficulty;
    if (eligibility === 'Certification Eligible') where.certificateEligible = true;
    if (eligibility === 'Practice Only') where.certificateEligible = false;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const orderBy = sort.toLowerCase() === 'popular' ? [{ popularScore: 'desc' as const }, { createdAt: 'desc' as const }] : [{ createdAt: 'desc' as const }];

    const [projects, total, allProjects, enrollments] = await Promise.all([
      prisma.certificationProject.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { plans: { orderBy: { sortOrder: 'asc' } } },
      }),
      prisma.certificationProject.count({ where }),
      prisma.certificationProject.findMany({
        where: { isActive: true },
        select: { domain: true, difficulty: true, eligibility: true, certificateEligible: true },
      }),
      userId
        ? prisma.certificationEnrollment.findMany({
            where: { userId },
            select: { id: true, projectId: true, planId: true },
          })
        : Promise.resolve([] as Array<{ id: number; projectId: number; planId: number }>),
    ]);

    const enrollmentMap = new Map(enrollments.map((item) => [item.projectId, item]));
    const domainOptions = Array.from(new Set(allProjects.map((item) => item.domain))).sort();
    const difficultyOptions = Array.from(new Set(allProjects.map((item) => item.difficulty))).sort();
    const eligibilityOptions = ['Certification Eligible', 'Practice Only'];

    return {
      projects: projects.map((project) => mapProjectCard(project, enrollmentMap.get(project.id))),
      filters: {
        domains: domainOptions,
        difficulties: difficultyOptions,
        eligibility: eligibilityOptions,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getProject(identifier: string, userId?: number) {
    await this.ensureSeedData();

    const where = /^\d+$/.test(identifier) ? { id: parseInt(identifier, 10) } : { slug: identifier };
    const project = await prisma.certificationProject.findUnique({
      where,
      include: {
        plans: { orderBy: { sortOrder: 'asc' } },
        sectionItems: { orderBy: [{ sectionKey: 'asc' }, { sortOrder: 'asc' }] },
        mentors: { include: { slots: { orderBy: { startTime: 'asc' } } } },
        coupons: {
          where: {
            isActive: true,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
        },
      },
    });

    if (!project) return null;

    const enrollment = userId
      ? await prisma.certificationEnrollment.findUnique({
          where: { userId_projectId: { userId, projectId: project.id } },
          select: { id: true, planId: true, status: true, paymentStatus: true },
        })
      : null;

    return {
      id: project.id,
      slug: project.slug,
      title: project.title,
      domain: project.domain,
      difficulty: project.difficulty,
      durationWeeks: project.durationWeeks,
      description: project.description,
      shortDescription: project.shortDescription,
      bannerLabel: project.bannerLabel,
      thumbnail: project.thumbnail,
      tags: project.tags,
      eligibility: project.eligibility,
      certificateEligible: project.certificateEligible,
      basePrice: project.basePrice,
      platformFee: project.platformFee,
      plans: project.plans,
      sections: buildRoadmapSections(project.sectionItems),
      mentors: project.mentors,
      activeCoupons: project.coupons.map((coupon) => coupon.code),
      enrollment,
    };
  },

  async resolvePricing(projectId: number, planId: number, couponCode?: string) {
    await this.ensureSeedData();

    const project = await prisma.certificationProject.findUnique({
      where: { id: projectId },
      include: { plans: true },
    });
    if (!project) throw new Error('Project not found');

    const plan = project.plans.find((item) => item.id === planId);
    if (!plan) throw new Error('Selected plan not found');

    let coupon: any = null;
    let discount = 0;

    if (couponCode) {
      coupon = await prisma.certificationCoupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (!coupon || !coupon.isActive) throw new Error('Coupon is invalid or inactive');
      if (coupon.projectId && coupon.projectId !== projectId) throw new Error('Coupon does not apply to this project');
      if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new Error('Coupon has expired');
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new Error('Coupon usage limit reached');
      if (plan.price < coupon.minAmount) throw new Error('Coupon minimum amount not met');

      discount = coupon.discountType === 'percent'
        ? Math.round((plan.price * coupon.amount) / 100)
        : coupon.amount;
    }

    const basePrice = formatCurrency(plan.price);
    discount = Math.min(basePrice, formatCurrency(discount));
    const platformFee = formatCurrency(project.platformFee);
    const finalPayable = formatCurrency(basePrice - discount + platformFee);

    return {
      project,
      plan,
      coupon,
      pricing: {
        basePrice,
        discount,
        platformFee,
        finalPayable,
        savings: discount,
      },
    };
  },

  async applyCoupon(projectId: number, planId: number, couponCode: string) {
    const { coupon, pricing } = await this.resolvePricing(projectId, planId, couponCode);
    return {
      coupon: coupon ? { code: coupon.code, discountType: coupon.discountType, amount: coupon.amount } : null,
      pricing,
    };
  },

  async createOrder(userId: number, payload: { projectId: number; planId: number; couponCode?: string }) {
    const { projectId, planId, couponCode } = payload;
    const existingEnrollment = await prisma.certificationEnrollment.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (existingEnrollment) throw new Error('You are already enrolled in this certification project');

    const { project, plan, coupon, pricing } = await this.resolvePricing(projectId, planId, couponCode);
    const { basePrice, discount, platformFee, finalPayable } = pricing;

    if (finalPayable <= 0) {
      const enrollment = await prisma.certificationEnrollment.create({
        data: {
          userId,
          projectId,
          planId,
          couponCode: coupon?.code || null,
          paymentStatus: 'paid',
          status: 'enrolled',
          basePrice,
          discount,
          platformFee,
          finalPayable,
        },
      });

      return {
        requiresPayment: false,
        enrollmentId: enrollment.id,
        pricing,
      };
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: finalPayable * 100,
      currency: 'INR',
      receipt: `cert_${projectId}_${Date.now()}`,
    });

    await prisma.certificationOrder.create({
      data: {
        userId,
        projectId,
        planId,
        couponId: coupon?.id || null,
        couponCode: coupon?.code || null,
        basePrice,
        discount,
        platformFee,
        totalAmount: finalPayable,
        razorpayOrderId: razorpayOrder.id,
        currency: 'INR',
        status: 'created',
      },
    });

    return {
      requiresPayment: true,
      orderId: razorpayOrder.id,
      amount: finalPayable,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      pricing,
      project: { id: project.id, title: project.title },
      plan: { id: plan.id, name: plan.name },
    };
  },

  async verifyPayment(orderId: string, paymentId: string, signature: string) {
    const isValid = verifyRazorpaySignature(orderId, paymentId, signature, process.env.RAZORPAY_KEY_SECRET!);
    if (!isValid) throw new Error('Invalid payment signature');

    const order = await prisma.certificationOrder.findUnique({
      where: { razorpayOrderId: orderId },
    });
    if (!order) throw new Error('Order not found');

    if (order.status === 'paid') {
      const enrollment = await prisma.certificationEnrollment.findFirst({
        where: { orderId: order.id },
      });

      return {
        enrollmentId: enrollment?.id || null,
        projectId: order.projectId,
        planId: order.planId,
      };
    }

    const enrollment = await prisma.$transaction(async (tx) => {
      await tx.certificationPayment.upsert({
        where: { orderId: order.id },
        update: { status: 'success' },
        create: {
          orderId: order.id,
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
          status: 'success',
        },
      });

      await tx.certificationOrder.update({
        where: { id: order.id },
        data: { status: 'paid' },
      });

      if (order.couponId) {
        await tx.certificationCoupon.update({
          where: { id: order.couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return tx.certificationEnrollment.upsert({
        where: { userId_projectId: { userId: order.userId, projectId: order.projectId } },
        update: {
          planId: order.planId,
          orderId: order.id,
          couponCode: order.couponCode,
          paymentStatus: 'paid',
          status: 'enrolled',
          basePrice: order.basePrice,
          discount: order.discount,
          platformFee: order.platformFee,
          finalPayable: order.totalAmount,
        },
        create: {
          userId: order.userId,
          projectId: order.projectId,
          planId: order.planId,
          orderId: order.id,
          couponCode: order.couponCode,
          paymentStatus: 'paid',
          status: 'enrolled',
          basePrice: order.basePrice,
          discount: order.discount,
          platformFee: order.platformFee,
          finalPayable: order.totalAmount,
        },
      });
    });

    return {
      enrollmentId: enrollment.id,
      projectId: enrollment.projectId,
      planId: enrollment.planId,
    };
  },

  async uploadSubmissionFile(file: Express.Multer.File, userId: number) {
    const safeName = `${userId}-${Date.now()}-${file.originalname}`;
    const upload = await uploadDocumentToCloudinary(file.buffer, 'certifications/submissions', safeName);
    return {
      url: upload.secure_url,
      name: file.originalname,
      bytes: file.size,
    };
  },

  async getWorkspace(userId: number, enrollmentId: number) {
    await this.ensureSeedData();

    const enrollment = await prisma.certificationEnrollment.findFirst({
      where: { id: enrollmentId, userId },
      include: {
        plan: true,
        project: {
          include: {
            sectionItems: { orderBy: { sortOrder: 'asc' } },
            mentors: {
              include: {
                slots: { orderBy: { startTime: 'asc' } },
              },
            },
          },
        },
        submissions: {
          orderBy: { submittedAt: 'desc' },
          include: {
            evaluations: { orderBy: { createdAt: 'asc' } },
          },
        },
        bookings: {
          include: {
            mentor: true,
            slot: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        certificate: true,
      },
    });

    if (!enrollment) return null;

    const requirementItems = enrollment.project.sectionItems.filter((item) => item.sectionKey === 'requirements');
    const latestSubmission = enrollment.submissions[0] || null;
    const primaryMentor = enrollment.project.mentors[0] || null;

    const availableSlots = primaryMentor
      ? primaryMentor.slots.map((slot) => ({
          ...slot,
          isBooked: slot.status !== 'available',
        }))
      : [];

    return {
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
        paymentStatus: enrollment.paymentStatus,
        finalPayable: enrollment.finalPayable,
      },
      project: {
        id: enrollment.project.id,
        slug: enrollment.project.slug,
        title: enrollment.project.title,
        domain: enrollment.project.domain,
        difficulty: enrollment.project.difficulty,
        durationWeeks: enrollment.project.durationWeeks,
        problemStatement: enrollment.project.description,
        requirements: requirementItems.map((item) => item.description),
      },
      plan: enrollment.plan,
      mentor: primaryMentor,
      availableSlots,
      bookings: enrollment.bookings,
      latestSubmission,
      submissionHistory: enrollment.submissions.map((submission) => ({
        id: submission.id,
        submittedAt: submission.submittedAt,
        type: submission.attemptNumber > 1 ? `Resubmission ${submission.attemptNumber}` : 'Design Doc',
        status: submission.status,
        marks: submission.marks,
        githubLink: submission.githubLink,
        demoLink: submission.demoLink,
      })),
      certificate: enrollment.certificate,
    };
  },

  async submitProject(userId: number, enrollmentId: number, payload: {
    designDocUrl: string;
    designDocName: string;
    requirementsDocUrl: string;
    requirementsDocName: string;
    githubLink: string;
    demoLink: string;
  }) {
    const enrollment = await prisma.certificationEnrollment.findFirst({
      where: { id: enrollmentId, userId },
      include: { project: true },
    });
    if (!enrollment) throw new Error('Enrollment not found');

    const { designDocUrl, designDocName, requirementsDocUrl, requirementsDocName, githubLink, demoLink } = payload;
    if (!designDocUrl || !requirementsDocUrl || !githubLink || !demoLink) {
      throw new Error('All submission fields are required');
    }

    const previousAttempts = await prisma.certificationSubmission.count({
      where: { enrollmentId },
    });

    const auditChecks = [
      designDocUrl ? 'Design document uploaded successfully.' : 'Design document missing.',
      requirementsDocUrl ? 'Requirements document uploaded successfully.' : 'Requirements document missing.',
      githubLink.includes('github.com') ? 'GitHub repository URL looks valid.' : 'GitHub repository URL needs attention.',
      /^https?:\/\//.test(demoLink) ? 'Live demo URL looks reachable.' : 'Live demo URL needs attention.',
    ];
    const auditScore = [designDocUrl, requirementsDocUrl, githubLink, demoLink].filter(Boolean).length * 25;

    const submission = await prisma.$transaction(async (tx) => {
      const created = await tx.certificationSubmission.create({
        data: {
          enrollmentId,
          userId,
          projectId: enrollment.projectId,
          attemptNumber: previousAttempts + 1,
          designDocUrl,
          designDocName,
          requirementsDocUrl,
          requirementsDocName,
          githubLink,
          demoLink,
          status: 'in_review',
          marks: auditScore,
        },
      });

      await tx.certificationEvaluation.createMany({
        data: [
          {
            submissionId: created.id,
            type: 'auto',
            feedback: auditChecks.join(' '),
            status: auditScore >= 75 ? 'passed' : 'rejected',
            score: auditScore,
            reviewerName: 'Auto Grader',
          },
          {
            submissionId: created.id,
            type: 'mentor',
            feedback: 'Mentor is currently reviewing the latest submission.',
            status: 'in_review',
            reviewerName: 'Mentor Review',
          },
          {
            submissionId: created.id,
            type: 'live_defense',
            feedback: 'Complete mentor approval to unlock scheduling for live defense.',
            status: 'locked',
            reviewerName: 'System',
          },
        ],
      });

      await tx.certificationEnrollment.update({
        where: { id: enrollmentId },
        data: { status: 'under_review' },
      });

      return created;
    });

    return prisma.certificationSubmission.findUnique({
      where: { id: submission.id },
      include: { evaluations: { orderBy: { createdAt: 'asc' } } },
    });
  },

  async bookMentorSession(userId: number, enrollmentId: number, slotId: number) {
    const enrollment = await prisma.certificationEnrollment.findFirst({
      where: { id: enrollmentId, userId },
    });
    if (!enrollment) throw new Error('Enrollment not found');

    const slot = await prisma.certificationMentorSlot.findUnique({
      where: { id: slotId },
      include: { mentor: true },
    });
    if (!slot) throw new Error('Selected slot not found');
    if (slot.status !== 'available') throw new Error('This slot is no longer available');

    return prisma.$transaction(async (tx) => {
      const booking = await tx.certificationMentorBooking.create({
        data: {
          enrollmentId,
          mentorId: slot.mentorId,
          slotId: slot.id,
          userId,
          status: 'booked',
        },
        include: {
          mentor: true,
          slot: true,
        },
      });

      await tx.certificationMentorSlot.update({
        where: { id: slot.id },
        data: { status: 'booked' },
      });

      return booking;
    });
  },

  async getAdminOverview() {
    await this.ensureSeedData();

    const [projects, enrollments, submissions, certificates, bookings] = await Promise.all([
      prisma.certificationProject.findMany({
        include: {
          plans: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { enrollments: true, submissions: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.certificationEnrollment.findMany({
        include: {
          user: { select: { name: true, email: true } },
          project: { select: { title: true } },
          plan: { select: { name: true } },
        },
        orderBy: { enrolledAt: 'desc' },
      }),
      prisma.certificationSubmission.findMany({
        include: {
          user: { select: { name: true, email: true } },
          project: { select: { title: true, domain: true } },
          evaluations: true,
        },
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.projectCertificate.findMany({
        include: {
          user: { select: { name: true, email: true } },
          project: { select: { title: true } },
        },
        orderBy: { issuedAt: 'desc' },
      }),
      prisma.certificationMentorBooking.findMany({
        include: {
          user: { select: { name: true, email: true } },
          mentor: true,
          slot: true,
          enrollment: { include: { project: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      stats: {
        totalProjects: projects.length,
        activeProjects: projects.filter((item) => item.isActive).length,
        totalEnrollments: enrollments.length,
        pendingReviews: submissions.filter((item) => item.status === 'in_review').length,
        certificatesIssued: certificates.length,
        bookedSessions: bookings.length,
      },
      projects,
      enrollments,
      submissions,
      certificates,
      bookings,
    };
  },

  async createAdminProject(payload: any) {
    const title = payload.title?.trim();
    if (!title) throw new Error('Project title is required');

    const slugBase = payload.slug?.trim() || slugify(title);
    const existing = await prisma.certificationProject.findUnique({ where: { slug: slugBase } });
    const slug = existing ? `${slugBase}-${Date.now()}` : slugBase;

    const tags = Array.isArray(payload.tags)
      ? payload.tags
      : String(payload.tags || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);

    const plans = Array.isArray(payload.plans) && payload.plans.length > 0
      ? payload.plans
      : [
          {
            name: '1-Month Track',
            subtitle: 'Intensive Fast-track',
            durationLabel: '1 Mo',
            price: Number(payload.basePrice || 1500),
            isRecommended: false,
            sortOrder: 1,
            features: ['Structured Roadmap', 'Automated Audit', 'Live Mock Interviews', 'Core Milestones'],
          },
          {
            name: '3-Month Track',
            subtitle: 'Comprehensive Mastery',
            durationLabel: '3 Mo',
            price: Number(payload.recommendedPrice || 2500),
            isRecommended: true,
            sortOrder: 2,
            features: ['Personalized Roadmap', 'Weekly Expert Audit', '3 Live Mock Interviews', 'Advanced Milestones'],
          },
        ];

    const sections = Array.isArray(payload.sectionItems) && payload.sectionItems.length > 0
      ? payload.sectionItems
      : [
          { sectionKey: 'roadmap', title: 'Milestone 1', description: 'Foundational work for the certification roadmap.', stepNumber: 1, sortOrder: 1 },
          { sectionKey: 'roadmap', title: 'Milestone 2', description: 'Intermediate implementation and audit readiness.', stepNumber: 2, sortOrder: 2 },
          { sectionKey: 'roadmap', title: 'Milestone 3', description: 'Final deployment and presentation.', stepNumber: 3, sortOrder: 3 },
          { sectionKey: 'requirements', title: 'Requirements', description: 'Provide design doc, requirements doc, repository, and live demo.', sortOrder: 1 },
          { sectionKey: 'evaluation', title: 'Evaluation', description: 'Auto audit, mentor review, then live defense unlock.', sortOrder: 1 },
        ];

    const mentorName = payload.mentorName?.trim() || 'Prof. David Miller';
    const mentorTitle = payload.mentorTitle?.trim() || 'Project Lead';

    return prisma.certificationProject.create({
      data: {
        title,
        slug,
        domain: payload.domain || 'Data Science',
        difficulty: payload.difficulty || 'Intermediate',
        durationWeeks: Number(payload.durationWeeks || 4),
        shortDescription: payload.shortDescription || payload.description || 'Project-based certification experience.',
        description: payload.description || payload.shortDescription || 'Problem statement pending update.',
        thumbnail: payload.thumbnail || null,
        bannerLabel: payload.bannerLabel || `${String(payload.domain || 'General').toUpperCase()} DOMAIN`,
        tags,
        eligibility: payload.eligibility || 'Certification Eligible',
        basePrice: Number(payload.basePrice || 1500),
        platformFee: Number(payload.platformFee || 55),
        popularScore: Number(payload.popularScore || 50),
        certificateEligible: payload.eligibility !== 'Practice Only',
        isActive: payload.isActive !== false,
        plans: { create: plans as any },
        sectionItems: { create: sections as any },
        mentors: {
          create: [
            {
              name: mentorName,
              title: mentorTitle,
              bio: payload.mentorBio || null,
              slots: {
                create: [
                  { startTime: new Date(Date.now() + 86400000), endTime: new Date(Date.now() + 88200000) },
                  { startTime: new Date(Date.now() + 172800000), endTime: new Date(Date.now() + 174600000) },
                ] as any,
              },
            },
          ] as any,
        },
      } as any,
      include: {
        plans: true,
        mentors: { include: { slots: true } },
      },
    });
  },

  async updateAdminProject(projectId: number, payload: any) {
    const tags = Array.isArray(payload.tags)
      ? payload.tags
      : payload.tags !== undefined
        ? String(payload.tags)
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        : undefined;

    const data: any = {
      title: payload.title,
      domain: payload.domain,
      difficulty: payload.difficulty,
      durationWeeks: payload.durationWeeks !== undefined ? Number(payload.durationWeeks) : undefined,
      shortDescription: payload.shortDescription,
      description: payload.description,
      thumbnail: payload.thumbnail,
      bannerLabel: payload.bannerLabel,
      eligibility: payload.eligibility,
      basePrice: payload.basePrice !== undefined ? Number(payload.basePrice) : undefined,
      platformFee: payload.platformFee !== undefined ? Number(payload.platformFee) : undefined,
      popularScore: payload.popularScore !== undefined ? Number(payload.popularScore) : undefined,
      certificateEligible: payload.eligibility ? payload.eligibility !== 'Practice Only' : undefined,
      isActive: payload.isActive,
    };

    if (tags) data.tags = tags;

    return prisma.certificationProject.update({
      where: { id: projectId },
      data,
      include: {
        plans: { orderBy: { sortOrder: 'asc' } },
        mentors: { include: { slots: true } },
      },
    });
  },

  async reviewSubmission(submissionId: number, payload: { status: string; marks?: number; reviewNotes?: string; mentorFeedback?: string }) {
    const submission = await prisma.certificationSubmission.findUnique({
      where: { id: submissionId },
      include: { enrollment: true },
    });
    if (!submission) throw new Error('Submission not found');

    const nextStatus = payload.status || 'approved';
    const mentorFeedback = payload.mentorFeedback || payload.reviewNotes || 'Reviewed by mentor.';

    return prisma.$transaction(async (tx) => {
      const updatedSubmission = await tx.certificationSubmission.update({
        where: { id: submissionId },
        data: {
          status: nextStatus,
          marks: payload.marks ?? submission.marks,
          reviewNotes: payload.reviewNotes || submission.reviewNotes,
        },
      });

      const mentorEvaluation = await tx.certificationEvaluation.findFirst({
        where: { submissionId, type: 'mentor' },
      });
      const liveDefenseEvaluation = await tx.certificationEvaluation.findFirst({
        where: { submissionId, type: 'live_defense' },
      });

      if (mentorEvaluation) {
        await tx.certificationEvaluation.update({
          where: { id: mentorEvaluation.id },
          data: {
            status: nextStatus === 'approved' ? 'approved' : 'rejected',
            feedback: mentorFeedback,
            score: payload.marks ?? submission.marks ?? null,
            reviewerName: 'Mentor Review',
          },
        });
      }

      if (liveDefenseEvaluation) {
        await tx.certificationEvaluation.update({
          where: { id: liveDefenseEvaluation.id },
          data: {
            status: nextStatus === 'approved' ? 'unlocked' : 'locked',
            feedback:
              nextStatus === 'approved'
                ? 'Live defense is now unlocked. Schedule the final review round.'
                : 'Complete mentor approval to unlock scheduling for live defense.',
          },
        });
      }

      await tx.certificationEnrollment.update({
        where: { id: submission.enrollmentId },
        data: { status: nextStatus === 'approved' ? 'approved' : 'needs_resubmission' },
      });

      return updatedSubmission;
    });
  },

  async issueCertificate(submissionId: number, payload: { certificateUrl?: string; issuedBy?: string }) {
    const submission = await prisma.certificationSubmission.findUnique({
      where: { id: submissionId },
      include: {
        enrollment: true,
        user: true,
        project: true,
      },
    });
    if (!submission) throw new Error('Submission not found');
    if (submission.status !== 'approved') throw new Error('Only approved submissions can be certified');

    const verificationCode = crypto.randomBytes(6).toString('hex').toUpperCase();
    const title = `${submission.project.title} Certification`;

    return prisma.$transaction(async (tx) => {
      const certificate = await tx.projectCertificate.upsert({
        where: { enrollmentId: submission.enrollmentId },
        update: {
          title,
          certificateUrl: payload.certificateUrl || null,
          issuedAt: new Date(),
        },
        create: {
          enrollmentId: submission.enrollmentId,
          userId: submission.userId,
          projectId: submission.projectId,
          title,
          certificateUrl: payload.certificateUrl || null,
          verificationCode,
        },
      });

      const existingProfileCertificate = await tx.certification.findFirst({
        where: {
          userId: submission.userId,
          title,
        },
      });

      if (!existingProfileCertificate) {
        await tx.certification.create({
          data: {
            userId: submission.userId,
            title,
            issuedBy: payload.issuedBy || 'GradToPro',
            issuedAt: new Date(),
            certificateUrl: payload.certificateUrl || null,
          },
        });
      }

      await tx.certificationEnrollment.update({
        where: { id: submission.enrollmentId },
        data: { status: 'certified' },
      });

      return certificate;
    });
  },
};
