import { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../middlewares/errorHandler';
import { certificationService } from '../services/certificationService';

const toNumber = (value: string | number | undefined, fieldName: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new AppError(`${fieldName} is required`, 400);
  }
  return parsed;
};

export const certificationController = {
  getProjects: asyncHandler(async (req: Request, res: Response) => {
    const data = await certificationService.getProjects({
      search: req.query.search as string,
      domain: req.query.domain as string,
      difficulty: req.query.difficulty as string,
      eligibility: req.query.eligibility as string,
      sort: req.query.sort as string,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 6,
      userId: req.user?.id,
    });

    res.status(200).json({ success: true, ...data });
  }),

  getProject: asyncHandler(async (req: Request, res: Response) => {
    const project = await certificationService.getProject(req.params.identifier, req.user?.id);
    if (!project) throw new AppError('Certification project not found', 404);
    res.status(200).json({ success: true, data: project });
  }),

  verifyCertificate: asyncHandler(async (req: Request, res: Response) => {
    const certificateId = String(req.query.certificateId || req.params.certificateId || '').trim();
    if (!certificateId) throw new AppError('certificateId is required', 400);

    const certificate = await certificationService.verifyCertificate(certificateId);
    if (!certificate) throw new AppError('Certificate not found', 404);

    res.status(200).json({ success: true, data: certificate });
  }),

  applyCoupon: asyncHandler(async (req: Request, res: Response) => {
    const projectId = toNumber(req.body.projectId, 'projectId');
    const planId = toNumber(req.body.planId, 'planId');
    const code = String(req.body.code || '').trim().toUpperCase();
    if (!code) throw new AppError('Coupon code is required', 400);

    const data = await certificationService.applyCoupon(projectId, planId, code);
    res.status(200).json({ success: true, data });
  }),

  createOrder: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Authentication required', 401);

    const projectId = toNumber(req.body.projectId, 'projectId');
    const planId = toNumber(req.body.planId, 'planId');
    const data = await certificationService.createOrder(userId, {
      projectId,
      planId,
      couponCode: req.body.couponCode ? String(req.body.couponCode).trim().toUpperCase() : undefined,
    });

    res.status(201).json({ success: true, data });
  }),

  verifyPayment: asyncHandler(async (req: Request, res: Response) => {
    const orderId = String(req.body.orderId || '').trim();
    const paymentId = String(req.body.paymentId || '').trim();
    const signature = String(req.body.signature || '').trim();
    if (!orderId || !paymentId || !signature) {
      throw new AppError('orderId, paymentId, and signature are required', 400);
    }

    const data = await certificationService.verifyPayment(orderId, paymentId, signature);
    res.status(200).json({ success: true, data });
  }),

  uploadFile: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) throw new AppError('Authentication required', 401);
    if (!req.file) throw new AppError('File is required', 400);

    const data = await certificationService.uploadSubmissionFile(req.file, req.user.id);
    res.status(201).json({ success: true, data });
  }),

  getWorkspace: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) throw new AppError('Authentication required', 401);
    const enrollmentId = toNumber(req.params.enrollmentId, 'enrollmentId');
    const data = await certificationService.getWorkspace(req.user.id, enrollmentId);
    if (!data) throw new AppError('Workspace not found', 404);
    res.status(200).json({ success: true, data });
  }),

  submitProject: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) throw new AppError('Authentication required', 401);
    const enrollmentId = toNumber(req.params.enrollmentId, 'enrollmentId');

    const data = await certificationService.submitProject(req.user.id, enrollmentId, {
      designDocUrl: String(req.body.designDocUrl || '').trim(),
      designDocName: String(req.body.designDocName || '').trim(),
      requirementsDocUrl: String(req.body.requirementsDocUrl || '').trim(),
      requirementsDocName: String(req.body.requirementsDocName || '').trim(),
      githubLink: String(req.body.githubLink || '').trim(),
      demoLink: String(req.body.demoLink || '').trim(),
    });

    res.status(201).json({ success: true, data });
  }),

  bookSession: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) throw new AppError('Authentication required', 401);
    const enrollmentId = toNumber(req.params.enrollmentId, 'enrollmentId');
    const slotId = toNumber(req.body.slotId, 'slotId');
    const data = await certificationService.bookMentorSession(req.user.id, enrollmentId, slotId);
    res.status(201).json({ success: true, data });
  }),

  getAdminOverview: asyncHandler(async (req: Request, res: Response) => {
    const data = await certificationService.getAdminOverview();
    res.status(200).json({ success: true, data });
  }),

  createAdminProject: asyncHandler(async (req: Request, res: Response) => {
    const data = await certificationService.createAdminProject(req.body);
    res.status(201).json({ success: true, data });
  }),

  updateAdminProject: asyncHandler(async (req: Request, res: Response) => {
    const projectId = toNumber(req.params.projectId, 'projectId');
    const data = await certificationService.updateAdminProject(projectId, req.body);
    res.status(200).json({ success: true, data });
  }),

  deleteAdminProject: asyncHandler(async (req: Request, res: Response) => {
    const projectId = toNumber(req.params.projectId, 'projectId');
    const data = await certificationService.deleteAdminProject(projectId);
    res.status(200).json({ success: true, data });
  }),

  reviewSubmission: asyncHandler(async (req: Request, res: Response) => {
    const submissionId = toNumber(req.params.submissionId, 'submissionId');
    const data = await certificationService.reviewSubmission(submissionId, {
      status: String(req.body.status || 'approved'),
      marks: req.body.marks !== undefined ? Number(req.body.marks) : undefined,
      reviewNotes: req.body.reviewNotes,
      mentorFeedback: req.body.mentorFeedback,
    });
    res.status(200).json({ success: true, data });
  }),

  issueCertificate: asyncHandler(async (req: Request, res: Response) => {
    const submissionId = toNumber(req.params.submissionId, 'submissionId');
    const data = await certificationService.issueCertificate(submissionId, {
      certificateUrl: req.body.certificateUrl,
      issuedBy: req.body.issuedBy,
    });
    res.status(201).json({ success: true, data });
  }),
};
