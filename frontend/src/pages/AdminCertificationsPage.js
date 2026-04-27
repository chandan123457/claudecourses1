import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAdminApi, useAdmin } from '../contexts/AdminContext';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
  { label: 'Programs', path: '/admin/programs', icon: '🎓' },
  { label: 'Webinars', path: '/admin/webinars', icon: '🎥' },
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Interviews', path: '/admin/interviews', icon: '💼' },
  { label: 'Certifications', path: '/admin/certifications', icon: '🏆', active: true },
];

const sectionKeyOptions = [
  ['roadmap', 'Roadmap'],
  ['requirements', 'Requirements'],
  ['evaluation', 'Evaluation'],
  ['perks', 'Perks'],
  ['re-evaluation', 'Re-evaluation'],
];

const statusPill = {
  approved: 'bg-emerald-500/10 text-emerald-300',
  certified: 'bg-sky-500/10 text-sky-300',
  in_review: 'bg-amber-500/10 text-amber-300',
  rejected: 'bg-red-500/10 text-red-300',
  needs_resubmission: 'bg-red-500/10 text-red-300',
  booked: 'bg-indigo-500/10 text-indigo-300',
  under_review: 'bg-amber-500/10 text-amber-300',
};

const pretty = (value) =>
  String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const createPlan = (overrides = {}) => ({
  id: undefined,
  name: '1-Month Track',
  subtitle: 'Intensive Fast-track',
  durationLabel: '1 Mo',
  price: 1500,
  isRecommended: false,
  sortOrder: 1,
  featuresText: 'Structured Roadmap\nAutomated Audit\nLive Mock Interviews\nCore Milestones',
  ...overrides,
});

const createSectionItem = (overrides = {}) => ({
  id: undefined,
  sectionKey: 'roadmap',
  title: '',
  description: '',
  stepNumber: '',
  sortOrder: 1,
  ...overrides,
});

const createCoupon = (overrides = {}) => ({
  id: undefined,
  code: '',
  discountType: 'fixed',
  amount: 0,
  minAmount: 0,
  usageLimit: '',
  expiresAt: '',
  isActive: true,
  ...overrides,
});

const createEmptyProjectForm = () => ({
  title: '',
  domain: 'Data Science',
  difficulty: 'Intermediate',
  durationWeeks: 6,
  eligibility: 'Certification Eligible',
  basePrice: 1500,
  recommendedPrice: 2500,
  platformFee: 55,
  shortDescription: '',
  description: '',
  thumbnail: '',
  bannerLabel: '',
  tags: '',
  popularScore: 50,
  mentorName: 'Prof. David Miller',
  mentorTitle: 'Project Lead',
  mentorBio: '',
  plans: [
    createPlan({ sortOrder: 1, isRecommended: false }),
    createPlan({
      name: '3-Month Track',
      subtitle: 'Comprehensive Mastery',
      durationLabel: '3 Mo',
      price: 2500,
      isRecommended: true,
      sortOrder: 2,
      featuresText: 'Personalized Roadmap\nWeekly Expert Audit\n3 Live Mock Interviews\nAdvanced Milestones',
    }),
  ],
  sectionItems: [
    createSectionItem({ sectionKey: 'roadmap', title: 'Milestone 1', description: 'Foundational work for the certification roadmap.', stepNumber: 1, sortOrder: 1 }),
    createSectionItem({ sectionKey: 'roadmap', title: 'Milestone 2', description: 'Intermediate implementation and audit readiness.', stepNumber: 2, sortOrder: 2 }),
    createSectionItem({ sectionKey: 'roadmap', title: 'Milestone 3', description: 'Final deployment and presentation.', stepNumber: 3, sortOrder: 3 }),
    createSectionItem({ sectionKey: 'requirements', title: 'Requirements', description: 'Provide design doc, requirements doc, repository, and live demo.', stepNumber: '', sortOrder: 1 }),
    createSectionItem({ sectionKey: 'evaluation', title: 'Evaluation', description: 'Auto audit, mentor review, then live defense unlock.', stepNumber: '', sortOrder: 1 }),
    createSectionItem({ sectionKey: 'perks', title: 'Perks', description: 'Certificate, mentor feedback, and portfolio-ready output.', stepNumber: '', sortOrder: 1 }),
  ],
  coupons: [],
});

const mapProjectToForm = (project) => ({
  title: project.title || '',
  domain: project.domain || 'Data Science',
  difficulty: project.difficulty || 'Intermediate',
  durationWeeks: project.durationWeeks || 6,
  eligibility: project.eligibility || 'Certification Eligible',
  basePrice: project.basePrice || 0,
  recommendedPrice: project.plans?.find((item) => item.isRecommended)?.price || project.basePrice || 0,
  platformFee: project.platformFee || 55,
  shortDescription: project.shortDescription || '',
  description: project.description || '',
  thumbnail: project.thumbnail || '',
  bannerLabel: project.bannerLabel || '',
  tags: (project.tags || []).join(', '),
  popularScore: project.popularScore || 50,
  mentorName: project.mentors?.[0]?.name || 'Prof. David Miller',
  mentorTitle: project.mentors?.[0]?.title || 'Project Lead',
  mentorBio: project.mentors?.[0]?.bio || '',
  plans: (project.plans || []).map((plan, index) =>
    createPlan({
      id: plan.id,
      name: plan.name,
      subtitle: plan.subtitle || '',
      durationLabel: plan.durationLabel,
      price: plan.price,
      isRecommended: plan.isRecommended,
      sortOrder: plan.sortOrder || index + 1,
      featuresText: (plan.features || []).join('\n'),
    })
  ),
  sectionItems: (project.sectionItems || []).map((item, index) =>
    createSectionItem({
      id: item.id,
      sectionKey: item.sectionKey,
      title: item.title,
      description: item.description,
      stepNumber: item.stepNumber ?? '',
      sortOrder: item.sortOrder || index + 1,
    })
  ),
  coupons: (project.coupons || []).map((coupon) =>
    createCoupon({
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      amount: coupon.amount,
      minAmount: coupon.minAmount,
      usageLimit: coupon.usageLimit ?? '',
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 10) : '',
      isActive: coupon.isActive,
    })
  ),
});

const buildProjectPayload = (form) => ({
  title: form.title,
  domain: form.domain,
  difficulty: form.difficulty,
  durationWeeks: Number(form.durationWeeks),
  eligibility: form.eligibility,
  basePrice: Number(form.basePrice),
  recommendedPrice: Number(form.recommendedPrice),
  platformFee: Number(form.platformFee),
  shortDescription: form.shortDescription,
  description: form.description,
  thumbnail: form.thumbnail,
  bannerLabel: form.bannerLabel,
  tags: form.tags,
  popularScore: Number(form.popularScore),
  mentorName: form.mentorName,
  mentorTitle: form.mentorTitle,
  mentorBio: form.mentorBio,
  plans: form.plans.map((plan, index) => ({
    id: plan.id,
    name: plan.name,
    subtitle: plan.subtitle,
    durationLabel: plan.durationLabel,
    price: Number(plan.price),
    isRecommended: Boolean(plan.isRecommended),
    sortOrder: Number(plan.sortOrder || index + 1),
    featuresText: plan.featuresText,
  })),
  sectionItems: form.sectionItems.map((item, index) => ({
    id: item.id,
    sectionKey: item.sectionKey,
    title: item.title,
    description: item.description,
    stepNumber: item.stepNumber === '' ? null : Number(item.stepNumber),
    sortOrder: Number(item.sortOrder || index + 1),
  })),
  coupons: form.coupons.map((coupon) => ({
    id: coupon.id,
    code: coupon.code,
    discountType: coupon.discountType,
    amount: Number(coupon.amount),
    minAmount: Number(coupon.minAmount),
    usageLimit: coupon.usageLimit === '' ? null : Number(coupon.usageLimit),
    expiresAt: coupon.expiresAt || null,
    isActive: Boolean(coupon.isActive),
  })),
});

const AdminCertificationsPage = () => {
  const navigate = useNavigate();
  const { adminLogout } = useAdmin();
  const adminApi = useMemo(() => createAdminApi(), []);

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState(createEmptyProjectForm);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: 'approved', marks: 92, reviewNotes: '', mentorFeedback: '' });
  const [certificateTarget, setCertificateTarget] = useState(null);
  const [certificateForm, setCertificateForm] = useState({ certificateUrl: '', issuedBy: 'GradToPro' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApi.get('/admin/certification-hub/overview');
      setOverview(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load certification admin data.');
    } finally {
      setLoading(false);
    }
  }, [adminApi]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const openCreateProject = () => {
    setEditingProject(null);
    setProjectForm(createEmptyProjectForm());
    setShowProjectForm(true);
  };

  const openEditProject = (project) => {
    setEditingProject(project);
    setProjectForm(mapProjectToForm(project));
    setShowProjectForm(true);
  };

  const updateProjectField = (key, value) => {
    setProjectForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateListItem = (key, index, field, value) => {
    setProjectForm((prev) => ({
      ...prev,
      [key]: prev[key].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addListItem = (key) => {
    setProjectForm((prev) => {
      if (key === 'plans') {
        return {
          ...prev,
          plans: [
            ...prev.plans,
            createPlan({
              name: `${prev.plans.length + 1}-Month Track`,
              durationLabel: `${prev.plans.length + 1} Mo`,
              sortOrder: prev.plans.length + 1,
            }),
          ],
        };
      }

      if (key === 'sectionItems') {
        return {
          ...prev,
          sectionItems: [
            ...prev.sectionItems,
            createSectionItem({ sortOrder: prev.sectionItems.length + 1 }),
          ],
        };
      }

      return {
        ...prev,
        coupons: [...prev.coupons, createCoupon()],
      };
    });
  };

  const removeListItem = (key, index) => {
    setProjectForm((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const toggleRecommendedPlan = (index) => {
    setProjectForm((prev) => ({
      ...prev,
      plans: prev.plans.map((plan, itemIndex) => ({
        ...plan,
        isRecommended: itemIndex === index,
      })),
    }));
  };

  const saveProject = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = buildProjectPayload(projectForm);
      if (editingProject) {
        await adminApi.put(`/admin/certification-hub/projects/${editingProject.id}`, payload);
      } else {
        await adminApi.post('/admin/certification-hub/projects', payload);
      }
      setShowProjectForm(false);
      await loadOverview();
    } catch (err) {
      setError(err.response?.data?.message || 'Project save failed.');
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (project) => {
    const confirmed = window.confirm(
      `Delete "${project.title}"?\n\nIf there are existing enrollments or submissions, the project will be archived instead of fully removed.`
    );
    if (!confirmed) return;

    setSaving(true);
    setError('');
    try {
      await adminApi.delete(`/admin/certification-hub/projects/${project.id}`);
      await loadOverview();
    } catch (err) {
      setError(err.response?.data?.message || 'Project delete failed.');
    } finally {
      setSaving(false);
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminApi.patch(`/admin/certification-hub/submissions/${reviewTarget.id}/review`, reviewForm);
      setReviewTarget(null);
      await loadOverview();
    } catch (err) {
      setError(err.response?.data?.message || 'Review update failed.');
    } finally {
      setSaving(false);
    }
  };

  const issueCertificate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminApi.post(`/admin/certification-hub/submissions/${certificateTarget.id}/certificate`, certificateForm);
      setCertificateTarget(null);
      await loadOverview();
    } catch (err) {
      setError(err.response?.data?.message || 'Certificate issuance failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a1220]">
      <aside className="flex w-64 flex-col border-r border-white/5 bg-[#0F1A2E]">
        <div className="flex items-center gap-3 border-b border-white/5 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E4B61A]">
            <span className="text-lg font-black text-[#0F1A2E]">G</span>
          </div>
          <span className="text-xl font-black text-white">
            Grad<span className="text-[#E4B61A]">ToPro</span>
          </span>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all ${
                item.active ? 'bg-[#E4B61A]/10 text-[#E4B61A]' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="border-t border-white/5 p-4">
          <button
            onClick={() => {
              adminLogout();
              navigate('/admin/login');
            }}
            className="w-full rounded-xl bg-red-500/10 py-2 text-sm font-medium text-red-400"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 border-b border-white/5 bg-[#0F1A2E]/60 px-8 py-5 backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-black text-white">Certification Control Center</h1>
              <p className="mt-1 text-sm text-white/40">
                Manage project inventory, pricing plans, promo codes, submissions, and certificate issuance.
              </p>
            </div>
            <button
              onClick={openCreateProject}
              className="rounded-xl bg-[#E4B61A] px-5 py-3 text-sm font-bold text-[#0F1A2E]"
            >
              + New Certification Project
            </button>
          </div>
        </header>

        <div className="p-8">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E4B61A] border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard label="Projects" value={overview?.stats?.totalProjects || 0} accent="from-[#E4B61A]/20 to-[#E4B61A]/5" />
                <StatCard label="Active" value={overview?.stats?.activeProjects || 0} accent="from-emerald-500/20 to-emerald-500/5" />
                <StatCard label="Enrollments" value={overview?.stats?.totalEnrollments || 0} accent="from-sky-500/20 to-sky-500/5" />
                <StatCard label="Pending Reviews" value={overview?.stats?.pendingReviews || 0} accent="from-amber-500/20 to-amber-500/5" />
                <StatCard label="Certificates" value={overview?.stats?.certificatesIssued || 0} accent="from-indigo-500/20 to-indigo-500/5" />
              </div>

              <div className="mb-6 flex flex-wrap gap-2">
                {[
                  ['projects', 'Projects'],
                  ['submissions', 'Submissions'],
                  ['certificates', 'Certificates'],
                  ['bookings', 'Mentorship'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setActiveTab(value)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                      activeTab === value
                        ? 'bg-[#E4B61A] text-[#0F1A2E]'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {activeTab === 'projects' && (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#0F1A2E]">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5 text-left text-xs uppercase tracking-[0.14em] text-white/35">
                          <th className="px-6 py-4">Project</th>
                          <th className="px-6 py-4">Domain</th>
                          <th className="px-6 py-4">Difficulty</th>
                          <th className="px-6 py-4">Enrollments</th>
                          <th className="px-6 py-4">Pricing</th>
                          <th className="px-6 py-4">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview?.projects?.map((project) => (
                          <tr key={project.id} className="border-b border-white/5 align-top">
                            <td className="px-6 py-5">
                              <p className="font-semibold text-white">{project.title}</p>
                              <p className="mt-1 text-sm text-white/40">{project.shortDescription}</p>
                              <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/45">
                                <span>{project.plans?.length || 0} plans</span>
                                <span>{project.sectionItems?.length || 0} content blocks</span>
                                <span>{project.coupons?.filter((coupon) => coupon.isActive).length || 0} active promos</span>
                                {!project.isActive && (
                                  <span className="rounded-full bg-red-500/10 px-2 py-1 text-red-300">Archived</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-5 text-white/70">{project.domain}</td>
                            <td className="px-6 py-5 text-white/70">{project.difficulty}</td>
                            <td className="px-6 py-5 text-white/70">{project._count?.enrollments || 0}</td>
                            <td className="px-6 py-5 text-white/70">
                              ₹{project.basePrice}
                              {project.plans?.find((item) => item.isRecommended) ? (
                                <p className="mt-1 text-xs text-white/40">
                                  Recommended: ₹{project.plans.find((item) => item.isRecommended).price}
                                </p>
                              ) : null}
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => openEditProject(project)}
                                  className="rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteProject(project)}
                                  disabled={saving}
                                  className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-5">
                    <SidePanel title="Workflow Snapshot">
                      <div className="space-y-4 text-sm text-white/65">
                        {[
                          'User browses projects',
                          'Payment creates enrollment',
                          'Workspace unlocks',
                          'Submission triggers auto audit',
                          'Mentor review approves or rejects',
                          'Certificate is issued after final approval',
                        ].map((item, index) => (
                          <div key={item} className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#E4B61A]/15 font-bold text-[#E4B61A]">
                              {index + 1}
                            </span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </SidePanel>

                    <SidePanel title="Recent Enrollments">
                      <div className="space-y-4">
                        {overview?.enrollments?.slice(0, 5).map((enrollment) => (
                          <div key={enrollment.id} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
                            <p className="font-semibold text-white">{enrollment.user?.name}</p>
                            <p className="text-sm text-white/45">{enrollment.project?.title}</p>
                            <div className="mt-2 flex items-center justify-between text-xs text-white/50">
                              <span>{enrollment.plan?.name}</span>
                              <span className={`rounded-full px-3 py-1 ${statusPill[enrollment.status] || 'bg-white/5 text-white/60'}`}>
                                {pretty(enrollment.status)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </SidePanel>
                  </div>
                </div>
              )}

              {activeTab === 'submissions' && (
                <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#0F1A2E]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5 text-left text-xs uppercase tracking-[0.14em] text-white/35">
                        <th className="px-6 py-4">Candidate</th>
                        <th className="px-6 py-4">Project</th>
                        <th className="px-6 py-4">Submitted</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Marks</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview?.submissions?.map((submission) => (
                        <tr key={submission.id} className="border-b border-white/5">
                          <td className="px-6 py-5">
                            <p className="font-semibold text-white">{submission.user?.name}</p>
                            <p className="text-sm text-white/45">{submission.user?.email}</p>
                          </td>
                          <td className="px-6 py-5 text-white/70">{submission.project?.title}</td>
                          <td className="px-6 py-5 text-white/70">{new Date(submission.submittedAt).toLocaleDateString('en-US')}</td>
                          <td className="px-6 py-5">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPill[submission.status] || 'bg-white/5 text-white/60'}`}>
                              {pretty(submission.status)}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-white/70">{submission.marks ? `${submission.marks}/100` : '—'}</td>
                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => setDetailsTarget(submission)}
                                className="rounded-lg bg-sky-500/15 px-3 py-2 text-xs font-semibold text-sky-300"
                              >
                                Details
                              </button>
                              <button
                                onClick={() => {
                                  setReviewTarget(submission);
                                  setReviewForm({
                                    status: submission.status === 'rejected' ? 'approved' : 'approved',
                                    marks: submission.marks || 92,
                                    reviewNotes: submission.reviewNotes || '',
                                    mentorFeedback: submission.evaluations?.find((item) => item.type === 'mentor')?.feedback || '',
                                  });
                                }}
                                className="rounded-lg bg-[#E4B61A]/15 px-3 py-2 text-xs font-semibold text-[#E4B61A]"
                              >
                                Review
                              </button>
                              {submission.status === 'approved' && (
                                <button
                                  onClick={() => {
                                    setCertificateTarget(submission);
                                    setCertificateForm({ certificateUrl: '', issuedBy: 'GradToPro' });
                                  }}
                                  className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300"
                                >
                                  Issue Certificate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'certificates' && (
                <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#0F1A2E]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5 text-left text-xs uppercase tracking-[0.14em] text-white/35">
                        <th className="px-6 py-4">Recipient</th>
                        <th className="px-6 py-4">Certificate</th>
                        <th className="px-6 py-4">Verification</th>
                        <th className="px-6 py-4">Issued On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview?.certificates?.map((certificate) => (
                        <tr key={certificate.id} className="border-b border-white/5">
                          <td className="px-6 py-5">
                            <p className="font-semibold text-white">{certificate.user?.name}</p>
                            <p className="text-sm text-white/45">{certificate.project?.title}</p>
                          </td>
                          <td className="px-6 py-5 text-white/70">{certificate.title}</td>
                          <td className="px-6 py-5 text-white/70">{certificate.verificationCode}</td>
                          <td className="px-6 py-5 text-white/70">{new Date(certificate.issuedAt).toLocaleDateString('en-US')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="grid gap-5 lg:grid-cols-2">
                  {overview?.bookings?.map((booking) => (
                    <div key={booking.id} className="rounded-3xl border border-white/5 bg-[#0F1A2E] px-6 py-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">{booking.user?.name}</p>
                          <p className="mt-1 text-sm text-white/45">{booking.enrollment?.project?.title}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPill[booking.status] || 'bg-white/5 text-white/60'}`}>
                          {pretty(booking.status)}
                        </span>
                      </div>
                      <div className="mt-5 space-y-2 text-sm text-white/65">
                        <p>Mentor: {booking.mentor?.name}</p>
                        <p>
                          Slot:{' '}
                          {new Date(booking.slot?.startTime).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                        <p>Email: {booking.user?.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showProjectForm && (
        <Modal title={editingProject ? 'Edit Certification Project' : 'Create Certification Project'} onClose={() => setShowProjectForm(false)} wide>
          <form onSubmit={saveProject} className="space-y-6">
            <FormGrid>
              <Field label="Project Title">
                <input value={projectForm.title} onChange={(event) => updateProjectField('title', event.target.value)} className={inputClass} required />
              </Field>
              <Field label="Domain">
                <input value={projectForm.domain} onChange={(event) => updateProjectField('domain', event.target.value)} className={inputClass} required />
              </Field>
              <Field label="Difficulty">
                <select value={projectForm.difficulty} onChange={(event) => updateProjectField('difficulty', event.target.value)} className={inputClass}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </Field>
              <Field label="Duration (Weeks)">
                <input type="number" value={projectForm.durationWeeks} onChange={(event) => updateProjectField('durationWeeks', Number(event.target.value))} className={inputClass} required />
              </Field>
              <Field label="Eligibility">
                <select value={projectForm.eligibility} onChange={(event) => updateProjectField('eligibility', event.target.value)} className={inputClass}>
                  <option>Certification Eligible</option>
                  <option>Practice Only</option>
                </select>
              </Field>
              <Field label="Thumbnail URL">
                <input value={projectForm.thumbnail} onChange={(event) => updateProjectField('thumbnail', event.target.value)} className={inputClass} />
              </Field>
              <Field label="Banner Label">
                <input value={projectForm.bannerLabel} onChange={(event) => updateProjectField('bannerLabel', event.target.value)} className={inputClass} placeholder="AI & DATA SCIENCE DOMAIN" />
              </Field>
              <Field label="Tags">
                <input value={projectForm.tags} onChange={(event) => updateProjectField('tags', event.target.value)} className={inputClass} placeholder="Python, ML, SQL" />
              </Field>
              <Field label="Base Price">
                <input type="number" value={projectForm.basePrice} onChange={(event) => updateProjectField('basePrice', Number(event.target.value))} className={inputClass} required />
              </Field>
              <Field label="Recommended Price">
                <input type="number" value={projectForm.recommendedPrice} onChange={(event) => updateProjectField('recommendedPrice', Number(event.target.value))} className={inputClass} required />
              </Field>
              <Field label="Platform Fee">
                <input type="number" value={projectForm.platformFee} onChange={(event) => updateProjectField('platformFee', Number(event.target.value))} className={inputClass} required />
              </Field>
              <Field label="Popular Score">
                <input type="number" value={projectForm.popularScore} onChange={(event) => updateProjectField('popularScore', Number(event.target.value))} className={inputClass} />
              </Field>
              <Field label="Mentor Name">
                <input value={projectForm.mentorName} onChange={(event) => updateProjectField('mentorName', event.target.value)} className={inputClass} />
              </Field>
              <Field label="Mentor Title">
                <input value={projectForm.mentorTitle} onChange={(event) => updateProjectField('mentorTitle', event.target.value)} className={inputClass} />
              </Field>
            </FormGrid>

            <Field label="Short Description">
              <textarea value={projectForm.shortDescription} onChange={(event) => updateProjectField('shortDescription', event.target.value)} className={`${inputClass} min-h-[90px]`} required />
            </Field>
            <Field label="Program Description / Problem Statement">
              <textarea value={projectForm.description} onChange={(event) => updateProjectField('description', event.target.value)} className={`${inputClass} min-h-[140px]`} required />
            </Field>
            <Field label="Mentor Bio">
              <textarea value={projectForm.mentorBio} onChange={(event) => updateProjectField('mentorBio', event.target.value)} className={`${inputClass} min-h-[100px]`} />
            </Field>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">Select Tenure Plan</h3>
                  <p className="text-sm text-white/45">These cards now drive the user payment page dynamically.</p>
                </div>
                <button type="button" onClick={() => addListItem('plans')} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white">
                  + Add Plan
                </button>
              </div>
              <div className="space-y-4">
                {projectForm.plans.map((plan, index) => (
                  <div key={`${plan.id || 'new'}-${index}`} className="rounded-2xl border border-white/10 bg-[#0a1220] p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="font-semibold text-white">Plan {index + 1}</p>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm text-white/70">
                          <input
                            type="radio"
                            name="recommendedPlan"
                            checked={plan.isRecommended}
                            onChange={() => toggleRecommendedPlan(index)}
                          />
                          Recommended
                        </label>
                        {projectForm.plans.length > 1 && (
                          <button type="button" onClick={() => removeListItem('plans', index)} className="text-sm font-semibold text-red-300">
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    <FormGrid>
                      <Field label="Name">
                        <input value={plan.name} onChange={(event) => updateListItem('plans', index, 'name', event.target.value)} className={inputClass} required />
                      </Field>
                      <Field label="Subtitle">
                        <input value={plan.subtitle} onChange={(event) => updateListItem('plans', index, 'subtitle', event.target.value)} className={inputClass} />
                      </Field>
                      <Field label="Duration Label">
                        <input value={plan.durationLabel} onChange={(event) => updateListItem('plans', index, 'durationLabel', event.target.value)} className={inputClass} />
                      </Field>
                      <Field label="Price">
                        <input type="number" value={plan.price} onChange={(event) => updateListItem('plans', index, 'price', Number(event.target.value))} className={inputClass} required />
                      </Field>
                    </FormGrid>
                    <Field label="Features (one per line)">
                      <textarea value={plan.featuresText} onChange={(event) => updateListItem('plans', index, 'featuresText', event.target.value)} className={`${inputClass} mt-2 min-h-[110px]`} />
                    </Field>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">Program Content Blocks</h3>
                  <p className="text-sm text-white/45">Roadmap, requirements, evaluation, perks, and re-evaluation all come from here.</p>
                </div>
                <button type="button" onClick={() => addListItem('sectionItems')} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white">
                  + Add Content Block
                </button>
              </div>
              <div className="space-y-4">
                {projectForm.sectionItems.map((item, index) => (
                  <div key={`${item.id || 'new'}-${index}`} className="rounded-2xl border border-white/10 bg-[#0a1220] p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="font-semibold text-white">Content Block {index + 1}</p>
                      <button type="button" onClick={() => removeListItem('sectionItems', index)} className="text-sm font-semibold text-red-300">
                        Remove
                      </button>
                    </div>
                    <FormGrid>
                      <Field label="Section">
                        <select value={item.sectionKey} onChange={(event) => updateListItem('sectionItems', index, 'sectionKey', event.target.value)} className={inputClass}>
                          {sectionKeyOptions.map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Title">
                        <input value={item.title} onChange={(event) => updateListItem('sectionItems', index, 'title', event.target.value)} className={inputClass} required />
                      </Field>
                      <Field label="Step Number">
                        <input value={item.stepNumber} onChange={(event) => updateListItem('sectionItems', index, 'stepNumber', event.target.value)} className={inputClass} placeholder="Leave blank if not a roadmap step" />
                      </Field>
                      <Field label="Sort Order">
                        <input type="number" value={item.sortOrder} onChange={(event) => updateListItem('sectionItems', index, 'sortOrder', Number(event.target.value))} className={inputClass} />
                      </Field>
                    </FormGrid>
                    <Field label="Description">
                      <textarea value={item.description} onChange={(event) => updateListItem('sectionItems', index, 'description', event.target.value)} className={`${inputClass} mt-2 min-h-[110px]`} required />
                    </Field>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">Promo Codes</h3>
                  <p className="text-sm text-white/45">These replace the old hardcoded discount flow on the user payment page.</p>
                </div>
                <button type="button" onClick={() => addListItem('coupons')} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white">
                  + Add Promo Code
                </button>
              </div>
              {projectForm.coupons.length === 0 ? (
                <p className="text-sm text-white/45">No promo codes yet.</p>
              ) : (
                <div className="space-y-4">
                  {projectForm.coupons.map((coupon, index) => (
                    <div key={`${coupon.id || 'new'}-${index}`} className="rounded-2xl border border-white/10 bg-[#0a1220] p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="font-semibold text-white">Promo {index + 1}</p>
                        <button type="button" onClick={() => removeListItem('coupons', index)} className="text-sm font-semibold text-red-300">
                          Remove
                        </button>
                      </div>
                      <FormGrid>
                        <Field label="Code">
                          <input value={coupon.code} onChange={(event) => updateListItem('coupons', index, 'code', event.target.value.toUpperCase())} className={inputClass} />
                        </Field>
                        <Field label="Discount Type">
                          <select value={coupon.discountType} onChange={(event) => updateListItem('coupons', index, 'discountType', event.target.value)} className={inputClass}>
                            <option value="fixed">Fixed Amount</option>
                            <option value="percent">Percent</option>
                          </select>
                        </Field>
                        <Field label="Amount">
                          <input type="number" value={coupon.amount} onChange={(event) => updateListItem('coupons', index, 'amount', Number(event.target.value))} className={inputClass} />
                        </Field>
                        <Field label="Minimum Amount">
                          <input type="number" value={coupon.minAmount} onChange={(event) => updateListItem('coupons', index, 'minAmount', Number(event.target.value))} className={inputClass} />
                        </Field>
                        <Field label="Usage Limit">
                          <input value={coupon.usageLimit} onChange={(event) => updateListItem('coupons', index, 'usageLimit', event.target.value)} className={inputClass} placeholder="Optional" />
                        </Field>
                        <Field label="Expiry Date">
                          <input type="date" value={coupon.expiresAt} onChange={(event) => updateListItem('coupons', index, 'expiresAt', event.target.value)} className={inputClass} />
                        </Field>
                      </FormGrid>
                      <label className="mt-3 flex items-center gap-2 text-sm text-white/70">
                        <input type="checkbox" checked={coupon.isActive} onChange={(event) => updateListItem('coupons', index, 'isActive', event.target.checked)} />
                        Active
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-[#E4B61A] py-3 font-bold text-[#0F1A2E] disabled:opacity-50">
                {saving ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
              </button>
              <button type="button" onClick={() => setShowProjectForm(false)} className="flex-1 rounded-xl bg-white/5 py-3 font-medium text-white/75">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {detailsTarget && (
        <Modal title={`Submission Details • ${detailsTarget.user?.name || 'Candidate'}`} onClose={() => setDetailsTarget(null)}>
          <div className="space-y-5 text-sm text-white/75">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoRow label="Project" value={detailsTarget.project?.title} />
              <InfoRow label="Submitted On" value={new Date(detailsTarget.submittedAt).toLocaleString('en-US')} />
              <InfoRow label="Status" value={pretty(detailsTarget.status)} />
              <InfoRow label="Marks" value={detailsTarget.marks ? `${detailsTarget.marks}/100` : '—'} />
              <InfoRow label="Attempt" value={detailsTarget.attemptNumber || 1} />
              <InfoRow label="Candidate Email" value={detailsTarget.user?.email} />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h4 className="mb-3 font-semibold text-white">Submission Assets</h4>
              <div className="space-y-3">
                <LinkRow label="Design Document" href={detailsTarget.designDocUrl} text={detailsTarget.designDocName || 'Open file'} />
                <LinkRow label="Requirements Doc" href={detailsTarget.requirementsDocUrl} text={detailsTarget.requirementsDocName || 'Open file'} />
                <LinkRow label="GitHub Repository" href={detailsTarget.githubLink} text={detailsTarget.githubLink || '—'} />
                <LinkRow label="Live Demo" href={detailsTarget.demoLink} text={detailsTarget.demoLink || '—'} />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h4 className="mb-3 font-semibold text-white">Review Notes</h4>
              <p className="text-white/65">{detailsTarget.reviewNotes || 'No internal notes yet.'}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h4 className="mb-3 font-semibold text-white">Evaluations</h4>
              <div className="space-y-3">
                {(detailsTarget.evaluations || []).map((evaluation) => (
                  <div key={evaluation.id} className="rounded-2xl border border-white/10 bg-[#0a1220] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-white">{pretty(evaluation.type)}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPill[evaluation.status] || 'bg-white/5 text-white/60'}`}>
                        {pretty(evaluation.status)}
                      </span>
                    </div>
                    <p className="mt-3 text-white/65">{evaluation.feedback || 'No feedback yet.'}</p>
                    {evaluation.reviewerName && (
                      <p className="mt-3 text-xs uppercase tracking-[0.14em] text-white/35">
                        Reviewer: {evaluation.reviewerName}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {reviewTarget && (
        <Modal title={`Review Submission • ${reviewTarget.user?.name || 'Candidate'}`} onClose={() => setReviewTarget(null)}>
          <form onSubmit={submitReview} className="space-y-4">
            <FormGrid>
              <Field label="Decision">
                <select value={reviewForm.status} onChange={(event) => setReviewForm((prev) => ({ ...prev, status: event.target.value }))} className={inputClass}>
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </Field>
              <Field label="Marks">
                <input type="number" value={reviewForm.marks} onChange={(event) => setReviewForm((prev) => ({ ...prev, marks: Number(event.target.value) }))} className={inputClass} />
              </Field>
            </FormGrid>
            <Field label="Mentor Feedback">
              <textarea value={reviewForm.mentorFeedback} onChange={(event) => setReviewForm((prev) => ({ ...prev, mentorFeedback: event.target.value }))} className={`${inputClass} min-h-[120px]`} />
            </Field>
            <Field label="Internal Notes">
              <textarea value={reviewForm.reviewNotes} onChange={(event) => setReviewForm((prev) => ({ ...prev, reviewNotes: event.target.value }))} className={`${inputClass} min-h-[120px]`} />
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-[#E4B61A] py-3 font-bold text-[#0F1A2E] disabled:opacity-50">
                {saving ? 'Updating...' : 'Save Review'}
              </button>
              <button type="button" onClick={() => setReviewTarget(null)} className="flex-1 rounded-xl bg-white/5 py-3 font-medium text-white/75">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {certificateTarget && (
        <Modal title={`Issue Certificate • ${certificateTarget.project?.title || 'Project'}`} onClose={() => setCertificateTarget(null)}>
          <form onSubmit={issueCertificate} className="space-y-4">
            <Field label="Issued By">
              <input value={certificateForm.issuedBy} onChange={(event) => setCertificateForm((prev) => ({ ...prev, issuedBy: event.target.value }))} className={inputClass} />
            </Field>
            <Field label="Certificate URL (optional)">
              <input value={certificateForm.certificateUrl} onChange={(event) => setCertificateForm((prev) => ({ ...prev, certificateUrl: event.target.value }))} className={inputClass} />
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-[#E4B61A] py-3 font-bold text-[#0F1A2E] disabled:opacity-50">
                {saving ? 'Issuing...' : 'Issue Certificate'}
              </button>
              <button type="button" onClick={() => setCertificateTarget(null)} className="flex-1 rounded-xl bg-white/5 py-3 font-medium text-white/75">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

const inputClass = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#E4B61A] focus:outline-none';

const StatCard = ({ label, value, accent }) => (
  <div className={`rounded-3xl border border-white/5 bg-gradient-to-br ${accent} px-5 py-5`}>
    <p className="text-sm font-medium text-white/45">{label}</p>
    <p className="mt-2 text-3xl font-black text-white">{value}</p>
  </div>
);

const SidePanel = ({ title, children }) => (
  <div className="rounded-3xl border border-white/5 bg-[#0F1A2E] px-6 py-6">
    <h3 className="mb-5 text-lg font-bold text-white">{title}</h3>
    {children}
  </div>
);

const Modal = ({ title, children, onClose, wide = false }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/65 p-4">
    <div className="absolute inset-0" onClick={onClose} />
    <div className={`relative flex max-h-[88vh] w-full flex-col overflow-hidden ${wide ? 'max-w-6xl' : 'max-w-3xl'} rounded-3xl border border-white/10 bg-[#0F1A2E] p-6 shadow-2xl`}>
      <div className="mb-6 flex flex-shrink-0 items-center justify-between gap-4">
        <h3 className="text-xl font-black text-white">{title}</h3>
        <button onClick={onClose} className="text-sm text-white/50 hover:text-white">Close</button>
      </div>
      <div className={`overflow-y-auto pr-2 ${wide ? 'max-h-[78vh]' : 'max-h-[72vh]'}`}>{children}</div>
    </div>
  </div>
);

const FormGrid = ({ children }) => (
  <div className="grid gap-4 md:grid-cols-2">{children}</div>
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/45">{label}</span>
    {children}
  </label>
);

const InfoRow = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <p className="text-xs uppercase tracking-[0.14em] text-white/35">{label}</p>
    <p className="mt-2 text-white">{value || '—'}</p>
  </div>
);

const LinkRow = ({ label, href, text }) => (
  <div className="flex flex-col gap-1 rounded-xl border border-white/10 bg-[#0a1220] px-4 py-3">
    <span className="text-xs uppercase tracking-[0.14em] text-white/35">{label}</span>
    {href ? (
      <a href={href} target="_blank" rel="noreferrer" className="break-all text-[#E4B61A] hover:text-[#f2cf5d]">
        {text}
      </a>
    ) : (
      <span className="text-white/45">—</span>
    )}
  </div>
);

export default AdminCertificationsPage;
