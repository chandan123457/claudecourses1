import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin, createAdminApi } from '../contexts/AdminContext';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const { adminLogout } = useAdmin();
  const adminApi = createAdminApi();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Eligibility modal
  const [eligModal, setEligModal] = useState(null);
  const [eligForm, setEligForm] = useState({ status: 'qualified', technicalScore: 80, softSkillScore: 70, overallScore: 75, eligibleTiers: 'Tier 1' });
  const [eligSaving, setEligSaving] = useState(false);

  // Badge modal
  const [badgeModal, setBadgeModal] = useState(null);
  const [badgeForm, setBadgeForm] = useState({ name: '', category: '' });

  useEffect(() => { fetchUsers(); }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      const res = await adminApi.get(`/admin/users?${params}`);
      setUsers(res.data.users || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetEligibility = async (e) => {
    e.preventDefault();
    setEligSaving(true);
    try {
      await adminApi.post('/admin/eligibility', {
        userId: eligModal.id,
        ...eligForm,
        technicalScore: parseFloat(eligForm.technicalScore),
        softSkillScore: parseFloat(eligForm.softSkillScore),
        overallScore: parseFloat(eligForm.overallScore),
        eligibleTiers: eligForm.eligibleTiers.split(',').map(s => s.trim()).filter(Boolean),
      });
      setEligModal(null);
      await fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setEligSaving(false);
    }
  };

  const handleAwardBadge = async (e) => {
    e.preventDefault();
    try {
      await adminApi.post('/admin/skill-badges', { userId: badgeModal.id, ...badgeForm });
      setBadgeModal(null);
      setBadgeForm({ name: '', category: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const STATUS_COLOR = {
    qualified: 'bg-green-500/20 text-green-400',
    not_qualified: 'bg-red-500/20 text-red-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
  };

  return (
    <div className="min-h-screen bg-[#0a1220] flex">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0F1A2E] border-r border-white/5 flex flex-col transition-all duration-300`}>
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E4B61A] flex items-center justify-center flex-shrink-0">
            <span className="text-[#0F1A2E] font-black text-lg">G</span>
          </div>
          {sidebarOpen && <span className="text-xl font-black text-white">Grad<span className="text-[#E4B61A]">ToPro</span></span>}
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
            { label: 'Courses', path: '/admin/courses', icon: '📚' },
            { label: 'Programs', path: '/admin/programs', icon: '🎓' },
            { label: 'Webinars', path: '/admin/webinars', icon: '🎥' },
            { label: 'Users', path: '/admin/users', icon: '👥', active: true },
            { label: 'Interviews', path: '/admin/interviews', icon: '💼' },
            { label: 'Certifications', path: '/admin/certifications', icon: '🏆' },
          ].map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${item.active ? 'bg-[#E4B61A]/10 text-[#E4B61A]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <span>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={() => { adminLogout(); navigate('/admin/login'); }}
            className="w-full py-2 bg-red-500/10 text-red-400 rounded-xl text-sm font-medium">
            {sidebarOpen ? 'Logout' : '↩'}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-[#0F1A2E]/50 border-b border-white/5 sticky top-0 z-10 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">User Management</h1>
            <p className="text-white/40 text-sm">{total} total users</p>
          </div>
          <div className="relative">
            <input type="text" placeholder="Search users..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E4B61A] w-64" />
          </div>
        </header>

        <div className="p-8">
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-[#E4B61A] border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <>
              <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-widest">
                      <th className="px-5 py-3 text-left">User</th>
                      <th className="px-5 py-3 text-left hidden md:table-cell">Programs</th>
                      <th className="px-5 py-3 text-left hidden lg:table-cell">Certifications</th>
                      <th className="px-5 py-3 text-left hidden lg:table-cell">Interviews</th>
                      <th className="px-5 py-3 text-left">Eligibility</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/2 transition-all">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#E4B61A]/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-[#E4B61A] font-bold text-xs">
                                {u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{u.name}</p>
                              <p className="text-white/40 text-xs">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell text-white/60">{u._count?.programEnrollments || 0}</td>
                        <td className="px-5 py-4 hidden lg:table-cell text-white/60">{u._count?.certifications || 0}</td>
                        <td className="px-5 py-4 hidden lg:table-cell text-white/60">{u._count?.mockInterviews || 0}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[u.portalEligibility?.status] || 'bg-white/5 text-white/40'}`}>
                            {u.portalEligibility?.status?.replace('_', ' ') || 'Not set'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setEligModal(u); setEligForm({ status: u.portalEligibility?.status || 'qualified', technicalScore: u.portalEligibility?.technicalScore || 80, softSkillScore: u.portalEligibility?.softSkillScore || 70, overallScore: u.portalEligibility?.overallScore || 75, eligibleTiers: 'Tier 1' }); }}
                              className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/20">
                              Set Eligibility
                            </button>
                            <button onClick={() => setBadgeModal(u)}
                              className="px-3 py-1.5 bg-yellow-500/10 text-yellow-400 rounded-lg text-xs font-medium hover:bg-yellow-500/20">
                              Award Badge
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-white/40 text-sm">{total} users</p>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                      className="px-4 py-2 bg-white/5 text-white/60 rounded-xl text-sm disabled:opacity-40">Previous</button>
                    <span className="px-4 py-2 text-white/60 text-sm">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                      className="px-4 py-2 bg-white/5 text-white/60 rounded-xl text-sm disabled:opacity-40">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Eligibility Modal */}
      {eligModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-bold mb-4">Set Eligibility — {eligModal.name}</h3>
            <form onSubmit={handleSetEligibility} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/50 block mb-1">Status</label>
                <select value={eligForm.status} onChange={e => setEligForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full bg-[#0a1220] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm">
                  <option value="qualified">Qualified</option>
                  <option value="not_qualified">Not Qualified</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              {[
                { label: 'Technical Score (0-100)', key: 'technicalScore' },
                { label: 'Soft Skill Score (0-100)', key: 'softSkillScore' },
                { label: 'Overall Score (0-100)', key: 'overallScore' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-white/50 block mb-1">{label}</label>
                  <input type="number" min="0" max="100" value={eligForm[key]}
                    onChange={e => setEligForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm" />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-white/50 block mb-1">Eligible Tiers (comma-separated)</label>
                <input type="text" value={eligForm.eligibleTiers}
                  onChange={e => setEligForm(p => ({ ...p, eligibleTiers: e.target.value }))}
                  placeholder="Tier 1, Tier 2"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={eligSaving}
                  className="flex-1 py-3 bg-[#E4B61A] text-[#0F1A2E] rounded-xl font-bold text-sm disabled:opacity-50">
                  {eligSaving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setEligModal(null)}
                  className="flex-1 py-3 bg-white/5 text-white rounded-xl text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Badge Modal */}
      {badgeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-bold mb-4">Award Skill Badge — {badgeModal.name}</h3>
            <form onSubmit={handleAwardBadge} className="space-y-4">
              {[
                { label: 'Badge Name', key: 'name', placeholder: 'e.g. Data Analysis' },
                { label: 'Category', key: 'category', placeholder: 'e.g. Technical' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-white/50 block mb-1">{label}</label>
                  <input type="text" required value={badgeForm[key]} placeholder={placeholder}
                    onChange={e => setBadgeForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-3 bg-[#E4B61A] text-[#0F1A2E] rounded-xl font-bold text-sm">Award</button>
                <button type="button" onClick={() => setBadgeModal(null)} className="flex-1 py-3 bg-white/5 text-white rounded-xl text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
