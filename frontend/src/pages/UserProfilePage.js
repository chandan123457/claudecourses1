import React, { useEffect, useState } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const UserProfilePage = () => {
  const { profileData, profileLoading, fetchProfile, updateProfile } = useDashboard();
  const { refreshDbUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profileData && !editing) {
      setFormData({
        name: profileData.user?.name || '',
        bio: profileData.profile?.bio || '',
        location: profileData.profile?.location || '',
        education: profileData.profile?.education || '',
        githubUrl: profileData.profile?.githubUrl || '',
        linkedinUrl: profileData.profile?.linkedinUrl || '',
      });
    }
  }, [profileData, editing]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(formData);
      await refreshDbUser();
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading)
    return (
      <DashboardLayout>
        <LoadingSpinner message="Loading profile..." fullPage />
      </DashboardLayout>
    );

  const {
    user,
    profile,
    certifications = [],
    skillBadges = [],
    eligibility,
    readiness,
  } = profileData || {};

  const overallScore = readiness?.overallScore || 0;
  const technicalScore = readiness?.technicalScore || 0;
  const softSkillScore = readiness?.softSkillScore || 0;
  const progressScore = readiness?.avgProgress || 0;
  const qualified = eligibility?.status === 'qualified';

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profile & Settings</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your personal details, resume, and platform preferences.
          </p>
        </div>

        {saveSuccess && (
          <div className="mb-5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
            Profile updated successfully!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* ── Left Column ──────────────────────────────── */}
          <div className="lg:col-span-1 space-y-4">
            {/* Avatar card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              {/* Avatar circle */}
              <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-3 overflow-hidden flex items-center justify-center">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>

              <h2 className="font-bold text-gray-900 text-base">{user?.name || 'User'}</h2>

              {/* Contact info */}
              <div className="mt-3 space-y-1.5">
                {user?.email && (
                  <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {user.email}
                  </p>
                )}
                {profile?.location && (
                  <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {profile.location}
                  </p>
                )}
                {profile?.education && (
                  <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                    {profile.education}
                  </p>
                )}
              </div>

              <button
                onClick={() => setEditing(true)}
                className="mt-5 flex items-center justify-center gap-1.5 w-full px-3 py-2.5 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            </div>

            {/* About Me */}
            {profile?.bio && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">
                  About Me
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">{profile.bio}</p>
              </div>
            )}
          </div>

          {/* ── Right Column ─────────────────────────────── */}
          <div className="lg:col-span-3 space-y-5">
            {/* Edit Form */}
            {editing && (
              <div className="bg-white rounded-2xl border border-yellow-200 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-bold text-gray-900">Edit Profile</h2>
                  <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', key: 'name', type: 'text' },
                    { label: 'Location', key: 'location', type: 'text' },
                    { label: 'Education', key: 'education', type: 'text' },
                    { label: 'GitHub URL', key: 'githubUrl', type: 'url' },
                    { label: 'LinkedIn URL', key: 'linkedinUrl', type: 'url' },
                  ].map(({ label, key, type }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
                      <input
                        type={type}
                        value={formData[key] || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Bio</label>
                    <textarea
                      rows={3}
                      value={formData.bio || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="sm:col-span-2 flex gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 bg-yellow-400 text-gray-900 font-bold rounded-xl text-sm hover:bg-yellow-500 disabled:opacity-50 transition-all"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-6 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Overall Readiness + Portal Eligibility side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Overall Readiness */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-0.5">Overall Readiness</h2>
                <p className="text-xs text-gray-400 mb-5">Based on technical score, soft skills, and learning progress</p>
                <div className="flex items-center gap-5">
                  {/* Circular gauge */}
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                      <circle
                        cx="50" cy="50" r="38"
                        fill="none"
                        stroke="#FBBF24"
                        strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 38}`}
                        strokeDashoffset={`${2 * Math.PI * 38 * (1 - overallScore / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-black text-gray-900">{Math.round(overallScore)}%</span>
                    </div>
                  </div>
                  {/* Skill bars */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Technical Skills</span>
                        <span>{Math.round(technicalScore)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-1.5 bg-yellow-400 rounded-full transition-all"
                          style={{ width: `${technicalScore}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Soft Skills</span>
                        <span>{Math.round(softSkillScore)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-1.5 bg-yellow-300 rounded-full transition-all"
                          style={{ width: `${softSkillScore}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Learning Progress</span>
                        <span>{Math.round(progressScore)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-1.5 bg-gray-900 rounded-full transition-all"
                          style={{ width: `${progressScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-500">
                  If the admin sets an Overall Score directly, that value is shown here. Otherwise, the score is derived from technical skill, soft skill, and learning progress.
                </div>
              </div>

              {/* Portal Eligibility */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-0.5">Portal Eligibility</h2>
                <p className="text-xs text-gray-400 mb-5">Status for placement drives</p>
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
                      qualified ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    {qualified ? (
                      <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <p className={`text-base font-bold mb-1 ${qualified ? 'text-gray-900' : 'text-gray-400'}`}>
                    {qualified ? 'Qualified' : 'Not Evaluated'}
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    {qualified
                      ? 'You are eligible for all Tier 1 companies.'
                      : 'Complete programs and interviews to get evaluated.'}
                  </p>
                  <button className="w-full py-2 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-all">
                    View Opportunities
                  </button>
                </div>
              </div>
            </div>

            {/* Professional Presence */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-sm font-bold text-gray-900 mb-5">Professional Presence</h2>
              <div className="grid grid-cols-2 gap-4">
                <SocialCard
                  icon="github"
                  name="Github"
                  connected={profile?.githubConnected || !!profile?.githubUrl}
                  url={profile?.githubUrl}
                />
                <SocialCard
                  icon="linkedin"
                  name="LinkedIn"
                  connected={profile?.linkedinConnected || !!profile?.linkedinUrl}
                  url={profile?.linkedinUrl}
                />
              </div>
            </div>

            {/* Certifications & Badges */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-gray-900">Certifications & Badges</h2>
                <button className="text-sm text-gray-500 font-medium hover:text-gray-700">
                  View All
                </button>
              </div>

              {certifications.length === 0 ? (
                <p className="text-sm text-gray-400 mb-4">
                  No certifications yet. Complete programs to earn certificates.
                </p>
              ) : (
                <div className="space-y-0 mb-6">
                  {certifications.slice(0, 3).map((cert, i) => (
                    <div
                      key={cert.id}
                      className={`flex items-center justify-between py-3.5 ${
                        i < Math.min(certifications.length, 3) - 1 ? 'border-b border-gray-50' : ''
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{cert.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Issued{' '}
                          {cert.issuedAt
                            ? new Date(cert.issuedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric',
                              })
                            : ''}
                        </p>
                      </div>
                      <CertificateAction certificateUrl={cert.certificateUrl} label="Certificate" />
                    </div>
                  ))}
                </div>
              )}

              {skillBadges.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Earned Skill Badges
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skillBadges.map((badge) => (
                      <span
                        key={badge.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100"
                      >
                        <span className="w-2 h-2 bg-blue-400 rounded-full" />
                        {badge.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// ── SocialCard ───────────────────────────────────────────────

const SocialCard = ({ icon, name, connected, url }) => (
  <a
    href={url || '#'}
    target={url ? '_blank' : undefined}
    rel="noopener noreferrer"
    className="border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition-all flex flex-col items-center gap-2 text-center"
  >
    <div className="w-10 h-10 flex items-center justify-center">
      {icon === 'github' ? (
        <svg className="w-9 h-9 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-9 h-9 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      )}
    </div>
    <p className="text-sm font-semibold text-gray-900">{name}</p>
    <p className={`text-xs font-medium ${connected ? 'text-green-600' : 'text-gray-400'}`}>
      {connected ? '+ Connected' : '+ Connect'}
    </p>
  </a>
);

const CertificateAction = ({ certificateUrl, label }) => {
  const href = getDownloadableUrl(certificateUrl);

  if (!href) {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-400 text-xs font-semibold rounded-lg flex-shrink-0 cursor-not-allowed">
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
      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-all flex-shrink-0"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {label}
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

export default UserProfilePage;
