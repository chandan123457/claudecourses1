import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import api from '../config/api';

const STATUS_STYLES = {
  approved: 'bg-[#DCFCE7] text-[#15803D]',
  passed: 'bg-[#DCFCE7] text-[#15803D]',
  rejected: 'bg-[#FEE2E2] text-[#B91C1C]',
  in_review: 'bg-[#FEF3C7] text-[#D97706]',
  unlocked: 'bg-[#DBEAFE] text-[#2563EB]',
  locked: 'bg-[#EEF2F7] text-[#94A3B8]',
  pending: 'bg-[#EEF2F7] text-[#94A3B8]',
};

const pretty = (value) =>
  String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const slotLabel = (slot) => {
  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);
  return {
    date: start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    time: `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
  };
};

const CertificationWorkspacePage = () => {
  const { enrollmentId } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [uploadingField, setUploadingField] = useState('');
  const [form, setForm] = useState({
    designDocUrl: '',
    designDocName: '',
    requirementsDocUrl: '',
    requirementsDocName: '',
    githubLink: '',
    demoLink: '',
  });

  const loadWorkspace = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/certification/workspace/${enrollmentId}`);
      const data = response.data.data;
      setWorkspace(data);

      if (data.latestSubmission) {
        setForm({
          designDocUrl: data.latestSubmission.designDocUrl || '',
          designDocName: data.latestSubmission.designDocName || '',
          requirementsDocUrl: data.latestSubmission.requirementsDocUrl || '',
          requirementsDocName: data.latestSubmission.requirementsDocName || '',
          githubLink: data.latestSubmission.githubLink || '',
          demoLink: data.latestSubmission.demoLink || '',
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load the workspace right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentId]);

  const evaluations = useMemo(() => workspace?.latestSubmission?.evaluations || [], [workspace]);
  const evaluationByType = useMemo(() => {
    const map = new Map();
    evaluations.forEach((item) => map.set(item.type, item));
    return map;
  }, [evaluations]);

  const uploadFile = async (fieldKey, file) => {
    if (!file) return;
    setUploadingField(fieldKey);
    setError('');

    try {
      const payload = new FormData();
      payload.append('file', file);
      const response = await api.post('/certification/upload', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploaded = response.data.data;
      if (fieldKey === 'designDocUrl') {
        setForm((prev) => ({
          ...prev,
          designDocUrl: uploaded.url,
          designDocName: uploaded.name,
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          requirementsDocUrl: uploaded.url,
          requirementsDocName: uploaded.name,
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'File upload failed.');
    } finally {
      setUploadingField('');
    }
  };

  const submitProject = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/certification/workspace/${enrollmentId}/submissions`, form);
      await loadWorkspace();
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please review the fields and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const bookSession = async () => {
    if (!selectedSlotId) return;
    setBooking(true);
    setError('');
    try {
      await api.post(`/certification/workspace/${enrollmentId}/book-session`, { slotId: selectedSlotId });
      setSelectedSlotId(null);
      await loadWorkspace();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to book the selected slot.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-[#F3F2ED]">
          <div className="h-12 w-12 rounded-full border-4 border-[#E4B61A] border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!workspace) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-[#F3F2ED] px-6">
          <div className="rounded-[20px] border border-[#FECACA] bg-white px-8 py-8 text-[#DC2626]">{error || 'Workspace not found.'}</div>
        </div>
      </DashboardLayout>
    );
  }

  const autoAudit = evaluationByType.get('auto');
  const designReview = evaluationByType.get('mentor');
  const liveDefense = evaluationByType.get('live_defense');

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-68px)] bg-[#F3F2ED]">
        <div className="mx-auto max-w-[1380px] px-6 py-8 lg:px-8">
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <h1 className="text-[52px] font-black leading-tight tracking-[-0.03em] text-[#1B233B]">
              {workspace.project.title}
            </h1>
            <a
              href={workspace.certificate?.certificateUrl || '#'}
              onClick={(event) => {
                if (!workspace.certificate?.certificateUrl) event.preventDefault();
              }}
              className={`inline-flex h-[52px] items-center justify-center gap-3 rounded-[10px] px-7 text-[16px] font-semibold ${
                workspace.certificate?.certificateUrl
                  ? 'bg-[#A8B0BD] text-white'
                  : 'cursor-not-allowed bg-[#A8B0BD] text-white'
              }`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-8m0 8-3-3m3 3 3-3M5 20h14" />
              </svg>
              Download Certificate
            </a>
          </div>

          {error && (
            <div className="mb-6 rounded-[18px] border border-[#FECACA] bg-[#FFF1F2] px-5 py-4 text-[14px] font-medium text-[#DC2626]">
              {error}
            </div>
          )}

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_430px]">
            <div className="space-y-8">
              <SectionCard title="Project Overview">
                <p className="text-[16px] font-black tracking-[0.03em] text-[#1F2937]">PROBLEM STATEMENT</p>
                <p className="mt-3 text-[18px] leading-[2.2rem] text-[#4B5563]">
                  {workspace.project.problemStatement}
                </p>

                <div className="mt-7">
                  <p className="text-[16px] font-black tracking-[0.03em] text-[#1F2937]">REQUIREMENTS</p>
                  <ul className="mt-4 list-disc pl-8 text-[18px] leading-[2.1rem] text-[#4B5563]">
                    {workspace.project.requirements.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </SectionCard>

              <SectionCard title="Submissions">
                <div className="grid gap-7 md:grid-cols-2">
                  <UploadBox
                    label="Design Document"
                    helper="PDF only, max 10MB"
                    fileName={form.designDocName}
                    uploading={uploadingField === 'designDocUrl'}
                    highlighted={false}
                    onUpload={(file) => uploadFile('designDocUrl', file)}
                  />
                  <UploadBox
                    label="Requirements Doc"
                    helper={form.requirementsDocName ? 'Uploaded just now' : 'PDF only, max 10MB'}
                    fileName={form.requirementsDocName}
                    uploading={uploadingField === 'requirementsDocUrl'}
                    highlighted
                    onUpload={(file) => uploadFile('requirementsDocUrl', file)}
                  />
                </div>

                <div className="mt-8 space-y-5">
                  <InputField
                    label="GitHub Repository URL"
                    value={form.githubLink}
                    onChange={(value) => setForm((prev) => ({ ...prev, githubLink: value }))}
                    placeholder="https://github.com/username/repo"
                  />
                  <InputField
                    label="Live Demo Link"
                    value={form.demoLink}
                    onChange={(value) => setForm((prev) => ({ ...prev, demoLink: value }))}
                    placeholder="https://myapp-demo.com"
                  />
                </div>

                <div className="mt-7 flex justify-end">
                  <button
                    onClick={submitProject}
                    disabled={submitting}
                    className="h-[42px] rounded-[10px] bg-[#E4B61A] px-8 text-[16px] font-semibold text-white disabled:opacity-60"
                  >
                    {submitting ? 'Submitting...' : 'Submit Project'}
                  </button>
                </div>
              </SectionCard>

              <SectionCard title="Submission History">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] text-left text-[14px] tracking-[0.1em] text-[#6B7280] uppercase">
                        <th className="py-4 pr-6">Date</th>
                        <th className="py-4 pr-6">Type</th>
                        <th className="py-4 pr-6">Status</th>
                        <th className="py-4 pr-6">Marks</th>
                        <th className="py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workspace.submissionHistory.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-[#94A3B8]">
                            No submissions yet.
                          </td>
                        </tr>
                      ) : (
                        workspace.submissionHistory.map((item) => (
                          <tr key={item.id} className="border-b border-[#EEF2F7] text-[16px] text-[#334155]">
                            <td className="py-5 pr-6">{formatDate(item.submittedAt)}</td>
                            <td className="py-5 pr-6">{item.type}</td>
                            <td className="py-5 pr-6">
                              <span className={`inline-flex rounded-full px-4 py-1 text-[14px] font-semibold ${STATUS_STYLES[item.status] || STATUS_STYLES.pending}`}>
                                {pretty(item.status)}
                              </span>
                            </td>
                            <td className="py-5 pr-6">{item.marks ? `${item.marks}/100` : '—'}</td>
                            <td className="py-5">
                              {workspace.latestSubmission?.designDocUrl ? (
                                <a href={workspace.latestSubmission.designDocUrl} target="_blank" rel="noreferrer" className="font-medium text-[#D4A107]">
                                  View
                                </a>
                              ) : (
                                '—'
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </div>

            <div className="space-y-8">
              <SectionCard title="Mentorship" compact>
                {workspace.mentor ? (
                  <>
                    <div className="rounded-[14px] border border-[#F3D98B] bg-[#FBF8EE] p-5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full border border-[#F3F4F6] bg-white" />
                        <div>
                          <p className="text-[18px] font-bold text-[#1F2937]">{workspace.mentor.name}</p>
                          <p className="text-[16px] text-[#6B7280]">{workspace.mentor.title}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5">
                      <p className="text-[14px] font-black tracking-[0.1em] text-[#6B7280] uppercase">Available Slots</p>
                      <div className="mt-4 space-y-3">
                        {workspace.availableSlots.map((slot) => {
                          const label = slotLabel(slot);
                          const active = selectedSlotId === slot.id;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              disabled={slot.isBooked}
                              onClick={() => setSelectedSlotId(slot.id)}
                              className={`w-full rounded-[12px] border px-4 py-4 text-left ${
                                active ? 'border-[#E4B61A] bg-[#FFF9E8]' : 'border-[#DDE3EC] bg-white'
                              } ${slot.isBooked ? 'cursor-not-allowed opacity-50' : ''}`}
                            >
                              <div className="flex items-start gap-3">
                                <span className={`mt-2 h-5 w-5 rounded-full border ${active ? 'border-[#E4B61A] bg-[#E4B61A]' : 'border-[#CBD5E1]'}`} />
                                <div>
                                  <p className="text-[16px] font-semibold text-[#1F2937]">{label.date}</p>
                                  <p className="text-[16px] text-[#6B7280]">{label.time}</p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={bookSession}
                        disabled={!selectedSlotId || booking}
                        className="mt-4 h-[44px] w-full rounded-[12px] border border-[#CBD5E1] text-[16px] font-medium text-[#334155] disabled:opacity-50"
                      >
                        {booking ? 'Booking...' : 'Book Session'}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-[#94A3B8]">Mentor assignment will appear here once the project is active.</p>
                )}
              </SectionCard>

              <SectionCard title="Evaluation" compact>
                <EvaluationStep title="Technical Audit" evaluation={autoAudit} accent="bg-[#22C55E]" />
                <EvaluationStep title="Design Review" evaluation={designReview} accent="bg-[#E4B61A]" />
                <EvaluationStep title="Live Defense" evaluation={liveDefense} accent="bg-[#CBD5E1]" last />
              </SectionCard>
            </div>
          </div>
        </div>

        <footer className="border-t border-[#E5E7EB] bg-white">
          <div className="mx-auto flex max-w-[1380px] flex-col gap-4 px-6 py-5 text-[15px] text-[#64748B] md:flex-row md:items-center md:justify-between lg:px-8">
            <p>© 2023 CertifyPlatform. Academic integrity policies apply.</p>
            <div className="flex items-center gap-10">
              <span>Help Center</span>
              <span>Guidelines</span>
            </div>
          </div>
        </footer>
      </div>
    </DashboardLayout>
  );
};

const SectionCard = ({ title, children, compact = false }) => (
  <section className={`rounded-[22px] border border-[#D8DDE5] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.05)] ${compact ? 'px-7 py-7' : 'px-7 py-8'}`}>
    <div className="mb-7 flex items-center gap-3">
      <svg className="h-5 w-5 text-[#D4A107]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V5A2.5 2.5 0 0 1 6.5 2.5H20v17M8 7h8M8 11h8M8 15h5" />
      </svg>
      <h2 className="text-[20px] font-black text-[#1E293B]">{title}</h2>
    </div>
    {children}
  </section>
);

const UploadBox = ({ label, helper, fileName, uploading, highlighted, onUpload }) => (
  <label className={`flex min-h-[210px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed px-6 py-7 text-center ${
    highlighted ? 'border-[#E4B61A] bg-[#FFFDF5]' : 'border-[#CBD5E1] bg-[#FBFBFB]'
  }`}>
    <svg className={`h-10 w-10 ${highlighted ? 'text-[#D4A107]' : 'text-[#9CA3AF]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 0 1-.88-7.903A5 5 0 0 1 15.9 6L16 6a5 5 0 0 1 1 9.9M15 13l-3-3m0 0-3 3m3-3v12" />
    </svg>
    <p className="mt-5 text-[18px] font-medium text-[#1F2937]">{label}</p>
    <p className="mt-2 text-[16px] text-[#6B7280]">{uploading ? 'Uploading...' : helper}</p>
    {fileName && <p className="mt-5 text-[16px] text-[#475569]">{fileName}</p>}
    <span className="mt-6 inline-flex rounded-[8px] border border-[#CBD5E1] bg-white px-5 py-2.5 text-[16px] text-[#334155]">
      Select File
    </span>
    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(event) => onUpload(event.target.files?.[0])} />
  </label>
);

const InputField = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="mb-2 block text-[16px] font-medium text-[#334155]">{label}</label>
    <input
      type="url"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-[48px] w-full rounded-[8px] border border-[#CBD5E1] bg-white px-5 text-[16px] text-[#334155] outline-none"
    />
  </div>
);

const EvaluationStep = ({ title, evaluation, accent, last = false }) => (
  <div className={`relative pl-7 ${last ? '' : 'pb-8'}`}>
    <span className={`absolute left-0 top-1 h-4 w-4 rounded-full ${accent}`} />
    <div className={`pl-5 ${last ? '' : 'border-l border-[#E5E7EB]'}`}>
      <p className="text-[18px] font-black text-[#1F2937]">{title}</p>
      <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-[14px] font-medium ${STATUS_STYLES[evaluation?.status] || STATUS_STYLES.pending}`}>
        {pretty(evaluation?.status || 'pending')}
      </span>
      <div className="mt-3 rounded-[8px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-4">
        <p className="text-[16px] leading-8 text-[#64748B]">
          {evaluation?.feedback || 'No evaluation has been generated yet.'}
        </p>
        {evaluation?.reviewerName && (
          <p className="mt-2 text-right text-[16px] font-medium text-[#64748B]">- {evaluation.reviewerName}</p>
        )}
      </div>
    </div>
  </div>
);

export default CertificationWorkspacePage;

