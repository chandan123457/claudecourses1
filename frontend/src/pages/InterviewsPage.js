import React, { useEffect, useState } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const DOMAINS = [
  'Frontend Engineering',
  'Backend Engineering',
  'Full Stack',
  'Data Science',
  'System Design',
  'Product Management',
  'Data Structures & Algorithms',
];

const InterviewsPage = () => {
  const { interviewData, interviewLoading, fetchInterviewData, bookInterview } = useDashboard();
  const [domain, setDomain] = useState('Frontend Engineering');
  const [preferredDate, setPreferredDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    fetchInterviewData();
  }, [fetchInterviewData]);

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingError('');
    if (!preferredDate) {
      setBookingError('Please select a date');
      return;
    }
    setBookingLoading(true);
    try {
      await bookInterview(domain, preferredDate);
      setBookingSuccess(true);
      setPreferredDate('');
      setTimeout(() => setBookingSuccess(false), 4000);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (interviewLoading)
    return (
      <DashboardLayout>
        <LoadingSpinner message="Loading interview data..." fullPage />
      </DashboardLayout>
    );

  const {
    performanceReport = {},
    sessions = [],
    remainingOnDemand = 5,
  } = interviewData || {};

  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const {
    overallRating = 0,
    topStrengths = [],
    topImprovements = [],
    latestFeedback,
  } = performanceReport;

  const starRating = Math.round(overallRating);

  const ratingLabel =
    overallRating >= 4 ? 'Great Progress!' : overallRating >= 3 ? 'Good Progress!' : 'Keep Going!';

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mock Interviews</h1>
          <p className="text-gray-400 text-sm mt-1">
            Track your progress and schedule practice sessions with experts.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* ── Left: Performance + Sessions ───────────────── */}
          <div className="xl:col-span-2 space-y-5">
            {/* Performance Report */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-sm font-bold text-gray-900 mb-5">Performance Report</h2>

              {completedSessions.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">No performance data yet</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Complete your first interview to see your report
                  </p>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Rating block */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-blue-50 rounded-2xl px-5 py-4 text-center flex-shrink-0 min-w-[90px]">
                      <p className="text-4xl font-black text-blue-700 leading-none">
                        {overallRating.toFixed(1)}
                      </p>
                      <div className="flex justify-center gap-0.5 mt-2">
                        {Array.from({ length: 5 }, (_, i) => (
                          <svg
                            key={i}
                            className={`w-3.5 h-3.5 ${i < starRating ? 'text-yellow-400' : 'text-gray-200'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-xs text-blue-400 font-medium mt-1.5">Overall Rating</p>
                    </div>
                    <div className="pt-1">
                      <p className="font-bold text-gray-900 text-sm mb-1">{ratingLabel}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {latestFeedback || 'You showed excellent technical depth in system design. However, try to be more concise when explaining your thought process during the coding challenge.'}
                      </p>
                    </div>
                  </div>

                  {/* Strengths & Improvements */}
                  <div className="flex-shrink-0 md:w-64 space-y-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                        Strengths
                      </p>
                      <div className="space-y-2">
                        {(topStrengths.length > 0
                          ? topStrengths
                          : ['Communication clarity', 'Technical depth in Data Structures', 'Problem-solving structure']
                        ).map((s, i) => (
                          <div key={i} className="flex items-center gap-2.5">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-700">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                        Improvement Areas
                      </p>
                      <div className="space-y-2">
                        {(topImprovements.length > 0
                          ? topImprovements
                          : ['Time management on coding tasks', 'SQL query optimization']
                        ).map((s, i) => (
                          <div key={i} className="flex items-center gap-2.5">
                            <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-700">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Previous Sessions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-sm font-bold text-gray-900 mb-5">Previous Sessions</h2>
              {completedSessions.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No completed sessions yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        <th className="pb-3 text-left font-semibold">Date</th>
                        <th className="pb-3 text-left font-semibold">Topic</th>
                        <th className="pb-3 text-left font-semibold">Interviewer</th>
                        <th className="pb-3 text-right font-semibold">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedSessions.map((session) => (
                        <tr
                          key={session.id}
                          className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-all"
                        >
                          <td className="py-3.5 text-gray-600 text-sm">
                            {new Date(session.sessionDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3.5 font-medium text-gray-900">{session.topic}</td>
                          <td className="py-3.5 text-gray-500">{session.interviewer}</td>
                          <td className="py-3.5 text-right">
                            <span
                              className={`font-bold ${
                                (session.rating ?? 0) >= 4
                                  ? 'text-yellow-500'
                                  : (session.rating ?? 0) >= 3
                                  ? 'text-yellow-500'
                                  : 'text-red-500'
                              }`}
                            >
                              {session.rating ? `${session.rating.toFixed(1)}/5` : '—'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Booking Panel ───────────────────────── */}
          <div className="space-y-4">
            {/* Remaining sessions counter */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-900">Remaining Mock Interviews</p>
              </div>
              <p className="text-3xl font-black text-gray-900">
                {remainingOnDemand}{' '}
                <span className="text-base font-medium text-gray-400">sessions</span>
              </p>
            </div>

            {/* On-demand booking */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              {/* Card header */}
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">On-Demand Interviews</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Book a 30-min live session with an industry expert to validate your skills.
                  </p>
                </div>
              </div>

              {bookingSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">
                  Session booked successfully!
                </div>
              )}
              {bookingError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                  {bookingError}
                </div>
              )}

              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Select Domain
                  </label>
                  <div className="relative">
                    <select
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white appearance-none pr-8"
                    >
                      {DOMAINS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    placeholder="dd-mm-yyyy"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading || remainingOnDemand === 0}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 font-bold py-3 rounded-xl text-sm hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {bookingLoading ? (
                    'Booking...'
                  ) : remainingOnDemand === 0 ? (
                    'No Sessions Left'
                  ) : (
                    <>
                      Book 30-min Session
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewsPage;
