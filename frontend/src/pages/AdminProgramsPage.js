import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin, createAdminApi } from '../contexts/AdminContext';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const EMPTY_FORM = { title: '', description: '', domain: '', level: 'Beginner', duration: '', thumbnail: '', instructor: '', isActive: true };

const AdminProgramsPage = () => {
  const navigate = useNavigate();
  const { adminLogout } = useAdmin();
  const adminApi = useMemo(() => createAdminApi(), []);

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const domainSuggestions = [...new Set(programs.map((program) => program.domain).filter(Boolean))];
  const durationSuggestions = [...new Set(programs.map((program) => program.duration).filter(Boolean))];

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/admin/programs');
      setPrograms(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [adminApi]);

  useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); setError(''); };
  const openEdit = (p) => { setEditing(p); setForm({ title: p.title, description: p.description, domain: p.domain, level: p.level, duration: p.duration, thumbnail: p.thumbnail || '', instructor: p.instructor, isActive: p.isActive }); setShowForm(true); setError(''); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await adminApi.put(`/admin/programs/${editing.id}`, form);
      } else {
        await adminApi.post('/admin/programs', form);
      }
      setShowForm(false);
      await fetchPrograms();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.delete(`/admin/programs/${id}`);
      setDeleteConfirm(null);
      await fetchPrograms();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1220] flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0F1A2E] border-r border-white/5 transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E4B61A] flex items-center justify-center flex-shrink-0">
            <span className="text-[#0F1A2E] font-black text-lg">G</span>
          </div>
          {sidebarOpen && <span className="text-xl font-black text-white">Grad<span className="text-[#E4B61A]">ToPro</span></span>}
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
            { label: 'Programs', path: '/admin/programs', icon: '🎓', active: true },
            { label: 'Webinars', path: '/admin/webinars', icon: '🎥' },
            { label: 'Users', path: '/admin/users', icon: '👥' },
            { label: 'Interviews', path: '/admin/interviews', icon: '💼' },
            { label: 'Certifications', path: '/admin/certifications', icon: '🏆' },
          ].map(item => (
            <button key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${item.active ? 'bg-[#E4B61A]/10 text-[#E4B61A]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <span className="text-base">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={() => { adminLogout(); navigate('/admin/login'); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-sm font-medium">
            {sidebarOpen ? 'Logout' : '↩'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="bg-[#0F1A2E]/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-10 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Program Management</h1>
            <p className="text-white/40 text-sm">{programs.length} programs total</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E4B61A] text-[#0F1A2E] rounded-xl font-bold text-sm hover:bg-yellow-300 transition-all">
            + New Program
          </button>
        </header>

        <div className="p-8">
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-[#E4B61A] border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {programs.map((p) => (
                <div key={p.id} className="bg-[#0F1A2E] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all">
                  <div className="h-32 bg-gradient-to-br from-blue-900/30 to-purple-900/20 relative">
                    {p.thumbnail && <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />}
                    <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full ${p.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="p-5">
                    <span className="text-xs text-[#E4B61A] font-semibold">{p.domain}</span>
                    <h3 className="text-white font-bold mt-1 mb-1 line-clamp-2">{p.title}</h3>
                    <p className="text-white/40 text-xs mb-3">{p.level} · {p.duration}</p>
                    <p className="text-white/50 text-xs line-clamp-2 mb-4">{p.description}</p>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)}
                        className="flex-1 py-2 bg-white/5 text-white/70 rounded-xl text-xs font-medium hover:bg-white/10 transition-all">Edit</button>
                      <button onClick={() => setDeleteConfirm(p.id)}
                        className="flex-1 py-2 bg-red-500/10 text-red-400 rounded-xl text-xs font-medium hover:bg-red-500/20 transition-all">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F1A2E] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-white font-bold">{editing ? 'Edit Program' : 'Create Program'}</h2>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white text-xl">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}
              {[
                { label: 'Title', key: 'title', type: 'text' },
                { label: 'Instructor', key: 'instructor', type: 'text' },
                { label: 'Thumbnail URL', key: 'thumbnail', type: 'url', required: false },
              ].map(({ label, key, type, required = true }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-white/50 mb-1">{label}</label>
                  <input type={type} required={required} value={form[key]} onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E4B61A]" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">Description</label>
                <textarea rows={3} required value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E4B61A] resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">Domain</label>
                <input
                  type="text"
                  required
                  list="program-domain-options"
                  value={form.domain}
                  onChange={(e) => setForm(p => ({ ...p, domain: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E4B61A]"
                  placeholder="e.g. Engineering & Tech"
                />
                <datalist id="program-domain-options">
                  {domainSuggestions.map((option) => <option key={option} value={option} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">Level</label>
                <select value={form.level} onChange={(e) => setForm(p => ({ ...p, level: e.target.value }))}
                  className="w-full bg-[#0a1220] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E4B61A]">
                  {LEVELS.map((option) => <option key={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">Duration</label>
                <input
                  type="text"
                  required
                  list="program-duration-options"
                  value={form.duration}
                  onChange={(e) => setForm(p => ({ ...p, duration: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E4B61A]"
                  placeholder="e.g. 6 Weeks"
                />
                <datalist id="program-duration-options">
                  {durationSuggestions.map((option) => <option key={option} value={option} />)}
                </datalist>
              </div>
              {editing && (
                <label className="flex items-center gap-3 text-sm text-white/70 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm(p => ({ ...p, isActive: e.target.checked }))}
                    className="w-4 h-4 accent-[#E4B61A]" />
                  Active
                </label>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-[#E4B61A] text-[#0F1A2E] rounded-xl font-bold text-sm disabled:opacity-50">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-3 bg-white/5 text-white rounded-xl font-medium text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F1A2E] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-bold mb-2">Delete Program?</h3>
            <p className="text-white/50 text-sm mb-6">This will permanently delete the program and all enrollments.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-white/5 text-white rounded-xl font-medium text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProgramsPage;
