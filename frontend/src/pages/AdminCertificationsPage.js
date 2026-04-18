import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin, createAdminApi } from '../contexts/AdminContext';

const AdminCertificationsPage = () => {
  const navigate = useNavigate();
  const { adminLogout } = useAdmin();
  const adminApi = createAdminApi();

  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ userId: '', programId: '', title: '', issuedBy: '', issuedAt: '', certificateUrl: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchCertifications(); }, [page]);

  const fetchCertifications = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(`/admin/certifications?page=${page}&limit=20`);
      setCertifications(res.data.certifications || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminApi.post('/admin/certifications', form);
      setShowForm(false);
      setForm({ userId: '', programId: '', title: '', issuedBy: '', issuedAt: '', certificateUrl: '' });
      await fetchCertifications();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign certification');
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
          {[
            { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
            { label: 'Programs', path: '/admin/programs', icon: '🎓' },
            { label: 'Webinars', path: '/admin/webinars', icon: '🎥' },
            { label: 'Users', path: '/admin/users', icon: '👥' },
            { label: 'Interviews', path: '/admin/interviews', icon: '💼' },
            { label: 'Certifications', path: '/admin/certifications', icon: '🏆', active: true },
          ].map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${item.active ? 'bg-[#E4B61A]/10 text-[#E4B61A]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={() => { adminLogout(); navigate('/admin/login'); }}
            className="w-full py-2 bg-red-500/10 text-red-400 rounded-xl text-sm font-medium">Logout</button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-[#0F1A2E]/50 border-b border-white/5 sticky top-0 z-10 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Certification Management</h1>
            <p className="text-white/40 text-sm">{total} total certifications issued</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="px-5 py-2.5 bg-[#E4B61A] text-[#0F1A2E] rounded-xl font-bold text-sm">+ Assign Certification</button>
        </header>

        <div className="p-8">
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-[#E4B61A] border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <>
              <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-white/5 text-white/40 text-xs uppercase">
                    <th className="px-5 py-3 text-left">Recipient</th>
                    <th className="px-5 py-3 text-left">Certificate</th>
                    <th className="px-5 py-3 text-left">Issued By</th>
                    <th className="px-5 py-3 text-left">Date</th>
                    <th className="px-5 py-3 text-left">Program</th>
                  </tr></thead>
                  <tbody>
                    {certifications.length === 0 ? (
                      <tr><td colSpan={5} className="px-5 py-10 text-center text-white/40">No certifications yet</td></tr>
                    ) : certifications.map(c => (
                      <tr key={c.id} className="border-b border-white/5 hover:bg-white/2">
                        <td className="px-5 py-4">
                          <p className="text-white font-medium">{c.user?.name}</p>
                          <p className="text-white/40 text-xs">{c.user?.email}</p>
                        </td>
                        <td className="px-5 py-4 text-white/70">{c.title}</td>
                        <td className="px-5 py-4 text-white/60">{c.issuedBy}</td>
                        <td className="px-5 py-4 text-white/60">
                          {new Date(c.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4 text-white/60">{c.program?.title || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-white/40 text-sm">{total} certifications</p>
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

      {/* Assign Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-bold mb-4">Assign Certification</h3>
            {error && <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}
            <form onSubmit={handleAssign} className="space-y-3">
              {[
                { label: 'User ID', key: 'userId', type: 'number' },
                { label: 'Program ID (optional)', key: 'programId', type: 'number', required: false },
                { label: 'Certificate Title', key: 'title', type: 'text' },
                { label: 'Issued By', key: 'issuedBy', type: 'text' },
                { label: 'Issue Date', key: 'issuedAt', type: 'date' },
                { label: 'Certificate URL (optional)', key: 'certificateUrl', type: 'url', required: false },
              ].map(({ label, key, type, required = true }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-white/50 block mb-1">{label}</label>
                  <input type={type} required={required} value={form[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-[#E4B61A] text-[#0F1A2E] rounded-xl font-bold text-sm disabled:opacity-50">
                  {saving ? 'Assigning...' : 'Assign'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-3 bg-white/5 text-white rounded-xl text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCertificationsPage;
