import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin, createAdminApi } from '../contexts/AdminContext';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
  { label: 'Programs', path: '/admin/programs', icon: '🎓' },
  { label: 'Webinars', path: '/admin/webinars', icon: '🎥' },
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Interviews', path: '/admin/interviews', icon: '💼' },
  { label: 'Certifications', path: '/admin/certifications', icon: '🏆', active: true },
];

const emptyProjectForm = {
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
  mentorName: 'Prof. David Miller',
  mentorTitle: 'Project Lead',
};

const statusPill = {
  approved: 'bg-emerald-500/10 text-emerald-300',
  certified: 'bg-sky-500/10 text-sky-300',
  in_review: 'bg-amber-500/10 text-amber-300',
  rejected: 'bg-red-500/10 text-red-300',
  needs_resubmission: 'bg-red-500/10 text-red-300',
  booked: 'bg-indigo-500/10 text-indigo-300',
};

const pretty = (value) =>
  String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const AdminCertificationsPage = () => {
  const navigate = useNavigate();
  const { adminLogout } = useAdmin();
  const adminApi = useMemo(() => createAdminApi(), []);

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [reviewTarget, setReviewTarget] = useState(null);
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
    setProjectForm(emptyProjectForm);
    setShowProjectForm(true);
  };

  const openEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title,
      domain: project.domain,
      difficulty: project.difficulty,
      durationWeeks: project.durationWeeks,
      eligibility: project.eligibility,
      basePrice: project.basePrice,
      recommendedPrice: project.plans?.find((item) => item.isRecommended)?.price || project.basePrice,
      platformFee: project.platformFee,
      shortDescription: project.shortDescription,
      description: project.description,
      thumbnail: project.thumbnail || '',
      mentorName: project.mentors?.[0]?.name || 'Prof. David Miller',
      mentorTitle: project.mentors?.[0]?.title || 'Project Lead',
    });
    setShowProjectForm(true);
  };

  const saveProject = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingProject) {
        await adminApi.put(`/admin/certification-hub/projects/${editingProject.id}`, projectForm);
      } else {
        await adminApi.post('/admin/certification-hub/projects', projectForm);
      }
      setShowProjectForm(false);
      await loadOverview();
    } catch (err) {
      setError(err.response?.data?.message || 'Project save failed.');
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
    <div className="min-h-screen bg-[#0a1220] flex">
      <aside className="w-64 bg-[#0F1A2E] border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E4B61A] flex items-center justify-center flex-shrink-0">
            <span className="text-[#0F1A2E] font-black text-lg">G</span>
          </div>
          <span className="text-xl font-black text-white">Grad<span className="text-[#E4B61A]">ToPro</span></span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                item.active ? 'bg-[#E4B61A]/10 text-[#E4B61A]' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => {
              adminLogout();
              navigate('/admin/login');
            }}
            className="w-full py-2 bg-red-500/10 text-red-400 rounded-xl text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-[#0F1A2E]/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-10 px-8 py-5">
          <div className="flex flex-col lg:flex-row gap-5 lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-black text-white">Certification Control Center</h1>
              <p className="text-white/40 text-sm mt-1">Manage project inventory, reviews, mentor flow, and certificate issuance.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={openCreateProject}
                className="px-5 py-3 bg-[#E4B61A] text-[#0F1A2E] rounded-xl font-bold text-sm"
              >
                + New Certification Project
              </button>
            </div>
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
              <div className="w-12 h-12 border-4 border-[#E4B61A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 mb-8">
                <StatCard label="Projects" value={overview?.stats?.totalProjects || 0} accent="from-[#E4B61A]/20 to-[#E4B61A]/5" />
                <StatCard label="Active" value={overview?.stats?.activeProjects || 0} accent="from-emerald-500/20 to-emerald-500/5" />
                <StatCard label="Enrollments" value={overview?.stats?.totalEnrollments || 0} accent="from-sky-500/20 to-sky-500/5" />
                <StatCard label="Pending Reviews" value={overview?.stats?.pendingReviews || 0} accent="from-amber-500/20 to-amber-500/5" />
                <StatCard label="Certificates" value={overview?.stats?.certificatesIssued || 0} accent="from-indigo-500/20 to-indigo-500/5" />
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
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
                <div className="grid xl:grid-cols-[minmax(0,1fr)_350px] gap-6">
                  <div className="bg-[#0F1A2E] border border-white/5 rounded-3xl overflow-hidden">
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
                          <tr key={project.id} className="border-b border-white/5">
                            <td className="px-6 py-5 align-top">
                              <p className="text-white font-semibold">{project.title}</p>
                              <p className="text-white/40 text-sm mt-1">{project.shortDescription}</p>
                            </td>
                            <td className="px-6 py-5 text-white/70">{project.domain}</td>
                            <td className="px-6 py-5 text-white/70">{project.difficulty}</td>
                            <td className="px-6 py-5 text-white/70">{project._count?.enrollments || 0}</td>
                            <td className="px-6 py-5 text-white/70">₹{project.basePrice}</td>
                            <td className="px-6 py-5">
                              <button
                                onClick={() => openEditProject(project)}
                                className="rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
                              >
                                Edit
                              </button>
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
                            <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#E4B61A]/15 text-[#E4B61A] font-bold">
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
                            <p className="text-white font-semibold">{enrollment.user?.name}</p>
                            <p className="text-white/45 text-sm">{enrollment.project?.title}</p>
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
                <div className="bg-[#0F1A2E] border border-white/5 rounded-3xl overflow-hidden">
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
                            <p className="text-white font-semibold">{submission.user?.name}</p>
                            <p className="text-white/45 text-sm">{submission.user?.email}</p>
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
                <div className="bg-[#0F1A2E] border border-white/5 rounded-3xl overflow-hidden">
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
                            <p className="text-white font-semibold">{certificate.user?.name}</p>
                            <p className="text-white/45 text-sm">{certificate.project?.title}</p>
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
                <div className="grid lg:grid-cols-2 gap-5">
                  {overview?.bookings?.map((booking) => (
                    <div key={booking.id} className="rounded-3xl border border-white/5 bg-[#0F1A2E] px-6 py-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-white font-semibold">{booking.user?.name}</p>
                          <p className="text-white/45 text-sm mt-1">{booking.enrollment?.project?.title}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPill[booking.status] || 'bg-white/5 text-white/60'}`}>
                          {pretty(booking.status)}
                        </span>
                      </div>
                      <div className="mt-5 text-sm text-white/65 space-y-2">
                        <p>Mentor: {booking.mentor?.name}</p>
                        <p>Slot: {new Date(booking.slot?.startTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
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
        <Modal title={editingProject ? 'Edit Certification Project' : 'Create Certification Project'} onClose={() => setShowProjectForm(false)}>
          <form onSubmit={saveProject} className="space-y-4">
            <FormGrid>
              <Field label="Project Title">
                <input value={projectForm.title} onChange={(event) => setProjectForm((prev) => ({ ...prev, title: event.target.value }))} className={inputClass} required />
              </Field>
              <Field label="Domain">
                <input value={projectForm.domain} onChange={(event) => setProjectForm((prev) => ({ ...prev, domain: event.target.value }))} className={inputClass} required />
              </Field>
              <Field label="Difficulty">
                <select value={projectForm.difficulty} onChange={(event) => setProjectForm((prev) => ({ ...prev, difficulty: event.target.value }))} className={inputClass}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </Field>
              <Field label="Duration (Weeks)">
                <input type="number" value={projectForm.durationWeeks} onChange={(event) => setProjectForm((prev) => ({ ...prev, durationWeeks: Number(event.target.value) }))} className={inputClass} required />
              </Field>
              <Field label="Eligibility">
                <select value={projectForm.eligibility} onChange={(event) => setProjectForm((prev) => ({ ...prev, eligibility: event.target.value }))} className={inputClass}>
                  <option>Certification Eligible</option>
                  <option>Practice Only</option>
                </select>
              </Field>
              <Field label="Thumbnail URL">
                <input value={projectForm.thumbnail} onChange={(event) => setProjectForm((prev) => ({ ...prev, thumbnail: event.target.value }))} className={inputClass} />
              </Field>
              <Field label="Base Price">
                <input type="number" value={projectForm.basePrice} onChange={(event) => setProjectForm((prev) => ({ ...prev, basePrice: Number(event.target.value) }))} className={inputClass} required />
              </Field>
              <Field label="Recommended Plan Price">
                <input type="number" value={projectForm.recommendedPrice} onChange={(event) => setProjectForm((prev) => ({ ...prev, recommendedPrice: Number(event.target.value) }))} className={inputClass} required />
              </Field>
              <Field label="Platform Fee">
                <input type="number" value={projectForm.platformFee} onChange={(event) => setProjectForm((prev) => ({ ...prev, platformFee: Number(event.target.value) }))} className={inputClass} required />
              </Field>
              <Field label="Mentor Name">
                <input value={projectForm.mentorName} onChange={(event) => setProjectForm((prev) => ({ ...prev, mentorName: event.target.value }))} className={inputClass} />
              </Field>
              <Field label="Mentor Title">
                <input value={projectForm.mentorTitle} onChange={(event) => setProjectForm((prev) => ({ ...prev, mentorTitle: event.target.value }))} className={inputClass} />
              </Field>
            </FormGrid>
            <Field label="Short Description">
              <textarea value={projectForm.shortDescription} onChange={(event) => setProjectForm((prev) => ({ ...prev, shortDescription: event.target.value }))} className={`${inputClass} min-h-[90px]`} required />
            </Field>
            <Field label="Problem Statement / Program Description">
              <textarea value={projectForm.description} onChange={(event) => setProjectForm((prev) => ({ ...prev, description: event.target.value }))} className={`${inputClass} min-h-[140px]`} required />
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-[#E4B61A] py-3 font-bold text-[#0F1A2E] disabled:opacity-50">
                {saving ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
              </button>
              <button type="button" onClick={() => setShowProjectForm(false)} className="flex-1 rounded-xl bg-white/5 py-3 text-white/75 font-medium">
                Cancel
              </button>
            </div>
          </form>
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
              <button type="button" onClick={() => setReviewTarget(null)} className="flex-1 rounded-xl bg-white/5 py-3 text-white/75 font-medium">
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
              <button type="button" onClick={() => setCertificateTarget(null)} className="flex-1 rounded-xl bg-white/5 py-3 text-white/75 font-medium">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

const inputClass = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E4B61A]';

const StatCard = ({ label, value, accent }) => (
  <div className={`rounded-3xl border border-white/5 bg-gradient-to-br ${accent} px-5 py-5`}>
    <p className="text-white/45 text-sm font-medium">{label}</p>
    <p className="text-3xl font-black text-white mt-2">{value}</p>
  </div>
);

const SidePanel = ({ title, children }) => (
  <div className="rounded-3xl border border-white/5 bg-[#0F1A2E] px-6 py-6">
    <h3 className="text-white font-bold text-lg mb-5">{title}</h3>
    {children}
  </div>
);

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4">
    <div className="absolute inset-0" onClick={onClose} />
    <div className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0F1A2E] p-6 shadow-2xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-black text-white">{title}</h3>
        <button onClick={onClose} className="text-white/50 hover:text-white text-sm">Close</button>
      </div>
      {children}
    </div>
  </div>
);

const FormGrid = ({ children }) => (
  <div className="grid md:grid-cols-2 gap-4">{children}</div>
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="block text-xs font-semibold tracking-[0.14em] text-white/45 uppercase mb-2">{label}</span>
    {children}
  </label>
);

export default AdminCertificationsPage;
