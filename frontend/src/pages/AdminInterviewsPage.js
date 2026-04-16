import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin, createAdminApi } from '../contexts/AdminContext';

const AdminInterviewsPage = () => {
  const navigate = useNavigate();
  const { adminLogout } = useAdmin();
  const adminApi = createAdminApi();
  const [sidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');

  const [bookings, setBookings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sessionForm, setSessionForm] = useState({ userId: '', topic: '', interviewer: '', sessionDate: '', type: 'mock' });
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionSaving, setSessionSaving] = useState(false);

  const [resultModal, setResultModal] = useState(null);
  const [resultForm, setResultForm] = useState({ score: '', rating: '', feedback: '', strengths: '', improvements: '' });

  useEffect(() => { fetchAll(); }, [activeTab]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      if (activeTab === 'bookings') {
        const res = await adminApi.get('/admin/interviews/bookings?limit=50');
        setBookings(res.data.bookings || []);
      } else {
        const res = await adminApi.get('/admin/interviews/sessions?limit=50');
        setSessions(res.data.sessions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (id) => {
    try {
      await adminApi.patch(`/admin/interviews/bookings/${id}/confirm`, {});
      await fetchAll();
    } catch (err) { console.error(err); }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setSessionSaving(true);
    try {
      await adminApi.post('/admin/interviews/sessions', sessionForm);
      setShowSessionForm(false);
      setSessionForm({ userId: '', topic: '', interviewer: '', sessionDate: '', type: 'mock' });
      await fetchAll();
    } catch (err) { console.error(err); }
    finally { setSessionSaving(false); }
  };

  const handleRecordResult = async (e) => {
    e.preventDefault();
    try {
      await adminApi.patch(`/admin/interviews/sessions/${resultModal.id}/result`, {
        score: parseFloat(resultForm.score),
        rating: parseFloat(resultForm.rating),
        feedback: resultForm.feedback,
        strengths: resultForm.strengths.split(',').map(s => s.trim()).filter(Boolean),
        improvements: resultForm.improvements.split(',').map(s => s.trim()).filter(Boolean),
      });
      setResultModal(null);
      await fetchAll();
    } catch (err) { console.error(err); }
  };

  const STATUS_COLORS = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
    scheduled: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
  };

  return (
    <div className="min-h-screen bg-[#0a1220] flex">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0F1A2E] border-r border-white/5 flex flex-col`}>
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E4B61A] flex items-center justify-center flex-shrink-0">
            <span className="text-[#0F1A2E] font-black text-lg">G</span>
          </div>
          <span className="text-xl font-black text-white">Grad<span className="text-[#E4B61A]">ToPro</span></span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
            { label: 'Courses', path: '/admin/courses', icon: '📚' },
            { label: 'Programs', path: '/admin/programs', icon: '🎓' },
            { label: 'Webinars', path: '/admin/webinars', icon: '🎥' },
            { label: 'Users', path: '/admin/users', icon: '👥' },
            { label: 'Interviews', path: '/admin/interviews', icon: '💼', active: true },
            { label: 'Certifications', path: '/admin/certifications', icon: '🏆' },
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
          <h1 className="text-2xl font-black text-white">Interview Management</h1>
          <button onClick={() => setShowSessionForm(true)}
            className="px-5 py-2.5 bg-[#E4B61A] text-[#0F1A2E] rounded-xl font-bold text-sm">+ Create Session</button>
        </header>

        <div className="p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {['bookings', 'sessions'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab ? 'bg-[#E4B61A] text-[#0F1A2E]' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                {tab === 'bookings' ? 'On-Demand Bookings' : 'Mock Sessions'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-[#E4B61A] border-t-transparent rounded-full animate-spin" /></div>
          ) : activeTab === 'bookings' ? (
            <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-white/5 text-white/40 text-xs uppercase">
                  <th className="px-5 py-3 text-left">User</th>
                  <th className="px-5 py-3 text-left">Domain</th>
                  <th className="px-5 py-3 text-left">Preferred Date</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr></thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} className="border-b border-white/5 hover:bg-white/2">
                      <td className="px-5 py-3"><p className="text-white font-medium">{b.user?.name}</p><p className="text-white/40 text-xs">{b.user?.email}</p></td>
                      <td className="px-5 py-3 text-white/70">{b.domain}</td>
                      <td className="px-5 py-3 text-white/70">{new Date(b.preferredDate).toLocaleDateString()}</td>
                      <td className="px-5 py-3"><span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLORS[b.status] || 'bg-white/5 text-white/40'}`}>{b.status}</span></td>
                      <td className="px-5 py-3 text-right">
                        {b.status === 'pending' && (
                          <button onClick={() => handleConfirmBooking(b.id)}
                            className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/20">Confirm</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-white/5 text-white/40 text-xs uppercase">
                  <th className="px-5 py-3 text-left">User</th>
                  <th className="px-5 py-3 text-left">Topic</th>
                  <th className="px-5 py-3 text-left">Interviewer</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Score</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr></thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/2">
                      <td className="px-5 py-3"><p className="text-white font-medium">{s.user?.name}</p></td>
                      <td className="px-5 py-3 text-white/70">{s.topic}</td>
                      <td className="px-5 py-3 text-white/70">{s.interviewer}</td>
                      <td className="px-5 py-3 text-white/70">{new Date(s.sessionDate).toLocaleDateString()}</td>
                      <td className="px-5 py-3"><span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLORS[s.status] || ''}`}>{s.status}</span></td>
                      <td className="px-5 py-3 text-white/70">{s.rating ? `${s.rating.toFixed(1)}/5` : '—'}</td>
                      <td className="px-5 py-3 text-right">
                        {s.status === 'scheduled' && (
                          <button onClick={() => { setResultModal(s); setResultForm({ score: '', rating: '', feedback: '', strengths: '', improvements: '' }); }}
                            className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/20">Record Result</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Create Session Modal */}
      {showSessionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-bold mb-4">Create Interview Session</h3>
            <form onSubmit={handleCreateSession} className="space-y-3">
              {[
                { label: 'User ID', key: 'userId', type: 'number' },
                { label: 'Topic', key: 'topic', type: 'text' },
                { label: 'Interviewer Name', key: 'interviewer', type: 'text' },
                { label: 'Session Date & Time', key: 'sessionDate', type: 'datetime-local' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-white/50 block mb-1">{label}</label>
                  <input type={type} required value={sessionForm[key]} onChange={e => setSessionForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm" />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-white/50 block mb-1">Type</label>
                <select value={sessionForm.type} onChange={e => setSessionForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full bg-[#0a1220] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm">
                  <option value="mock">Mock</option><option value="on_demand">On-Demand</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={sessionSaving} className="flex-1 py-3 bg-[#E4B61A] text-[#0F1A2E] rounded-xl font-bold text-sm disabled:opacity-50">
                  {sessionSaving ? 'Creating...' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowSessionForm(false)} className="flex-1 py-3 bg-white/5 text-white rounded-xl text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Result Modal */}
      {resultModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-bold mb-4">Record Result — {resultModal.topic}</h3>
            <form onSubmit={handleRecordResult} className="space-y-3">
              {[
                { label: 'Score (0-100)', key: 'score', type: 'number', step: '0.1' },
                { label: 'Rating (0-5)', key: 'rating', type: 'number', step: '0.1' },
              ].map(({ label, key, type, step }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-white/50 block mb-1">{label}</label>
                  <input type={type} step={step} required value={resultForm[key]} onChange={e => setResultForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm" />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-white/50 block mb-1">Feedback</label>
                <textarea rows={2} value={resultForm.feedback} onChange={e => setResultForm(p => ({ ...p, feedback: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm resize-none" />
              </div>
              {[
                { label: 'Strengths (comma-separated)', key: 'strengths' },
                { label: 'Improvement Areas (comma-separated)', key: 'improvements' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-white/50 block mb-1">{label}</label>
                  <input type="text" value={resultForm[key]} onChange={e => setResultForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder="e.g. Communication, Problem-solving"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-3 bg-[#E4B61A] text-[#0F1A2E] rounded-xl font-bold text-sm">Save Result</button>
                <button type="button" onClick={() => setResultModal(null)} className="flex-1 py-3 bg-white/5 text-white rounded-xl text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInterviewsPage;
