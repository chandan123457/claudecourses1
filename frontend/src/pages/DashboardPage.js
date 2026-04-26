import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../contexts/DashboardContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorMessage from '../components/shared/ErrorMessage';

const DashboardPage = () => {
  const { dbUser } = useAuth();
  const { dashboardData, dashboardLoading, dashboardError, fetchDashboard } = useDashboard();
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showAllInterviews, setShowAllInterviews] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (dashboardLoading)
    return (
      <DashboardLayout>
        <LoadingSpinner message="Loading your dashboard..." fullPage />
      </DashboardLayout>
    );

  if (dashboardError)
    return (
      <DashboardLayout>
        <ErrorMessage message={dashboardError} onRetry={fetchDashboard} />
      </DashboardLayout>
    );

  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const {
    enrolledPrograms = [],
    certifications = [],
    eligibility,
    upcomingInterviews = [],
  } = dashboardData || {};
  const visiblePrograms = enrolledPrograms.slice(0, 2);
  const visibleUpcomingInterviews = upcomingInterviews.slice(0, 2);
  const hasMoreUpcomingInterviews = upcomingInterviews.length > 2;
  const firstRowCardHeight = 'min-h-[224px]';

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto">
        {/* ── Greeting Header ───────────────────────────────── */}
        <div className="mb-8">
          <p className="text-sm text-gray-400 font-medium">
            {dayName}, {dateStr}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mt-0.5 tracking-tight">
            {greeting}, {dbUser?.name?.split(' ')[0] || 'there'}
          </h1>
        </div>

        {/* ── Row 1: Programs (2/3) + Eligibility (1/3) ──── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5 items-start">
          {/* Enrolled Skill Programs */}
          <div className="xl:col-span-2 flex flex-col">
            <SectionHeader title="Enrolled Skill Programs" linkTo="/programs" />
            {enrolledPrograms.length === 0 ? (
              <EmptyState
                message="No programs enrolled yet"
                action={{ label: 'Browse Programs', to: '/programs' }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
                {visiblePrograms.map((enrollment) => (
                  <ProgramCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            )}
          </div>

          {/* Portal Eligibility */}
          <div className="flex flex-col">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-gray-900">Portal Eligibility</h2>
              <p className="text-xs text-gray-400 mt-0.5">Status for placement drives</p>
            </div>
            <EligibilityCard eligibility={eligibility} className={firstRowCardHeight} />
          </div>
        </div>

        {/* ── Row 2: Certifications (1/2) + Interviews (1/2) ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
          {/* Enrolled Certifications */}
          <div className="flex flex-col">
            <SectionHeader title="Enrolled Certifications" />
            {certifications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-sm text-gray-400 min-h-[220px] flex items-center justify-center">
                No certifications yet. Complete programs to earn certificates.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden min-h-[220px]">
                {certifications.slice(0, 3).map((cert, i) => (
                  <CertificationRow
                    key={cert.id}
                    cert={cert}
                    last={i === Math.min(certifications.length, 3) - 1}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Interviews */}
          <div className="flex flex-col">
            <SectionHeader
              title="Upcoming Interviews"
              onActionClick={() => setShowAllInterviews(true)}
              showAction={hasMoreUpcomingInterviews}
            />
            {upcomingInterviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center min-h-[220px] flex flex-col items-center justify-center">
                <p className="text-sm text-gray-400 mb-3">No upcoming interviews</p>
                <Link
                  to="/interviews"
                  className="inline-block bg-yellow-400 text-gray-900 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-yellow-500 transition-all"
                >
                  Book a Session
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden min-h-[220px]">
                {visibleUpcomingInterviews.map((interview, index) => (
                  <UpcomingInterviewCard
                    key={interview.id}
                    interview={interview}
                    last={index === visibleUpcomingInterviews.length - 1 && !hasMoreUpcomingInterviews}
                    onOpen={() => setSelectedInterview(interview)}
                  />
                ))}
                {hasMoreUpcomingInterviews && (
                  <button
                    onClick={() => setShowAllInterviews(true)}
                    className="w-full border-t border-gray-100 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    View all upcoming interviews
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedInterview && (
        <InterviewModal
          title={selectedInterview.source === 'session' && selectedInterview.interviewType === 'mock' ? 'Prepare for Interview' : 'Interview Details'}
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
        />
      )}

      {showAllInterviews && (
        <AllInterviewsModal
          interviews={upcomingInterviews}
          onClose={() => setShowAllInterviews(false)}
          onSelect={(interview) => {
            setShowAllInterviews(false);
            setSelectedInterview(interview);
          }}
        />
      )}
    </DashboardLayout>
  );
};

// ── Helpers ──────────────────────────────────────────────────

const SectionHeader = ({ title, linkTo, showAction = Boolean(linkTo), onActionClick }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-sm font-bold text-gray-900">{title}</h2>
    {showAction ? (
      onActionClick ? (
        <button onClick={onActionClick} className="text-sm text-gray-500 hover:text-gray-700 font-medium">
          View All
        </button>
      ) : (
        <Link to={linkTo} className="text-sm text-gray-500 hover:text-gray-700 font-medium">
          View All
        </Link>
      )
    ) : null}
  </div>
);

const EmptyState = ({ message, action }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
    <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-3">
      <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </div>
    <p className="text-gray-500 text-sm mb-3">{message}</p>
    {action && (
      <Link
        to={action.to}
        className="inline-block bg-yellow-400 text-gray-900 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-yellow-500 transition-all"
      >
        {action.label}
      </Link>
    )}
  </div>
);

// ── Sub-components ───────────────────────────────────────────

const ProgramCard = ({ enrollment }) => {
  const { program, progress = 0, status } = enrollment;
  const isActive = status === 'active';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 hover:shadow-sm transition-all h-full min-h-[224px]">
      {/* Top row: icon + badge */}
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            isActive ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}
        >
          {isActive ? 'Active' : 'New'}
        </span>
      </div>

      {/* Title + domain */}
      <div>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-0.5">
          {program.title}
        </h3>
        <p className="text-xs text-gray-400">{program.domain}</p>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-1.5 bg-yellow-400 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* CTA button */}
      <Link
        to={`/programs/${program.id}/learn`}
        className={`block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all ${
          isActive
            ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
            : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}
      >
        {progress > 0 ? 'Continue Learning' : 'Start Learning'}
      </Link>
    </div>
  );
};

const EligibilityCard = ({ eligibility, className = '' }) => {
  const qualified = eligibility?.status === 'qualified';

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center text-center h-full justify-between ${className}`}>
      <div />
      <div className="flex flex-col items-center">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
            qualified ? 'bg-green-100' : 'bg-gray-100'
          }`}
        >
          {qualified ? (
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <p className={`text-xl font-bold mb-1 ${qualified ? 'text-gray-900' : 'text-gray-400'}`}>
          {qualified ? 'Qualified' : eligibility ? 'Pending' : 'Not Evaluated'}
        </p>
        <p className="text-xs text-gray-400 mb-6">
          {qualified
            ? 'You are eligible for all Tier 1 companies.'
            : 'Complete programs and interviews to qualify.'}
        </p>
      </div>
      <button className="w-full py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all">
        View Opportunities
      </button>
    </div>
  );
};

const CertificationRow = ({ cert, last }) => (
  <div className={`flex items-center gap-4 px-5 py-4 ${!last ? 'border-b border-gray-50' : ''}`}>
    {/* Icon */}
    <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 truncate">{cert.title}</p>
      <p className="text-xs text-gray-400">{cert.issuedBy}</p>
    </div>

    {/* Date + action */}
    <div className="flex-shrink-0 text-right">
      {cert.examDate ? (
        <>
          <div className="flex items-center gap-1 text-xs text-gray-400 justify-end">
            <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd" />
            </svg>
            <span>Exam Scheduled: {cert.examDate}</span>
          </div>
          <button className="text-xs text-yellow-600 font-semibold hover:text-yellow-700 mt-0.5">Details</button>
        </>
      ) : (
        <>
          <p className="text-xs text-gray-400">
            {cert.issuedAt
              ? new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
              : ''}
          </p>
          <CertificateLink certificateUrl={cert.certificateUrl} />
        </>
      )}
    </div>
  </div>
);

const CertificateLink = ({ certificateUrl }) => {
  const href = getDownloadableUrl(certificateUrl);

  if (!href) {
    return (
      <span className="text-xs text-gray-400 font-semibold mt-0.5 inline-block">
        Missing URL
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      download
      className="text-xs text-yellow-600 font-semibold hover:text-yellow-700 mt-0.5 inline-block"
    >
      Download
    </a>
  );
};

const getDownloadableUrl = (url) => {
  if (!url) return '';
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  const driveOpenMatch = url.match(/[?&]id=([^&]+)/);
  const fileId = driveFileMatch?.[1] || driveOpenMatch?.[1];
  return fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : url;
};

const formatInterviewType = (value) =>
  value === 'on_demand' ? 'On-Demand' : value === 'mock' ? 'Mock' : prettyTitle(value);

const prettyTitle = (value) =>
  String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatInterviewDate = (value) =>
  new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const UpcomingInterviewCard = ({ interview, last, onOpen }) => {
  const date = new Date(interview.sessionDate);
  const isToday = new Date().toDateString() === date.toDateString();
  const isTomorrow =
    new Date(Date.now() + 86400000).toDateString() === date.toDateString();
  const dayLabel = isToday
    ? 'TODAY'
    : isTomorrow
    ? 'TOMORROW'
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  const timeLabel = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const buttonLabel =
    interview.source === 'session' &&
    (interview.interviewType || interview.type) === 'mock'
    ? 'Prepare'
    : 'View Details';

  return (
    <div className={`px-5 py-4 ${!last ? 'border-b border-gray-100' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-yellow-500 tracking-wide">{dayLabel}</span>
        <span className="text-xs text-gray-400 font-medium">{timeLabel}</span>
      </div>
      <p className="font-semibold text-gray-900 text-sm">{interview.topic}</p>
      <p className="text-xs text-gray-400 mb-3">with {interview.interviewer}</p>
      <button
        onClick={onOpen}
        className="block w-full rounded-md border border-gray-200 py-2 text-center text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50"
      >
        {buttonLabel}
      </button>
    </div>
  );
};

const InterviewModal = ({ title, interview, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
    <div className="absolute inset-0" onClick={onClose} />
    <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-400">Session information from the admin-scheduled interview record.</p>
        </div>
        <button onClick={onClose} className="text-sm font-medium text-gray-400 hover:text-gray-700">
          Close
        </button>
      </div>

      <div className="space-y-4">
        <InfoPanel label="Topics" value={interview.topic} />
        <InfoPanel label="Session Date & Time" value={formatInterviewDate(interview.sessionDate)} />
        <InfoPanel label="Type" value={formatInterviewType(interview.interviewType || interview.type)} />
      </div>
    </div>
  </div>
);

const AllInterviewsModal = ({ interviews, onClose, onSelect }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
    <div className="absolute inset-0" onClick={onClose} />
    <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">All Upcoming Interviews</h3>
          <p className="mt-1 text-sm text-gray-400">Showing every upcoming interview currently available on your dashboard.</p>
        </div>
        <button onClick={onClose} className="text-sm font-medium text-gray-400 hover:text-gray-700">
          Close
        </button>
      </div>

      <div className="max-h-[65vh] overflow-y-auto rounded-2xl border border-gray-100">
        {interviews.map((interview, index) => (
          <button
            key={interview.id}
            onClick={() => onSelect(interview)}
            className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 ${index < interviews.length - 1 ? 'border-b border-gray-100' : ''}`}
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">{interview.topic}</p>
              <p className="mt-1 text-xs text-gray-400">
                {formatInterviewDate(interview.sessionDate)} • {formatInterviewType(interview.interviewType || interview.type)}
              </p>
            </div>
            <span className="text-xs font-semibold text-yellow-600">Open</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

const InfoPanel = ({ label, value }) => (
  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
    <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">{label}</p>
    <p className="mt-2 text-sm font-medium text-gray-900">{value || '—'}</p>
  </div>
);

export default DashboardPage;
