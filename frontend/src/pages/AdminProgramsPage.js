import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin, createAdminApi } from '../contexts/AdminContext';

const DOMAINS = ['Engineering & Tech', 'Data Science', 'Business Management', 'Product Design', 'Marketing & Growth'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const DURATIONS = ['2-4 Weeks', '1-3 Months', '3-6 Months', '6+ Months'];

const EMPTY_PROGRAM = { title: '', description: '', domain: 'Engineering & Tech', level: 'Beginner', duration: '2-4 Weeks', thumbnail: '', instructor: '', price: '', isActive: true };
const EMPTY_MODULE = { title: '', description: '', order: 0, isLocked: false };
const EMPTY_LESSON = { title: '', description: '', duration: '', videoUrl: '', videoUrl360p: '', videoUrl480p: '', videoUrl720p: '', order: 0, keyTakeaway: '', resources: '[]' };

const NAV = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
  )},
  { label: 'Programs', path: '/admin/programs', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
  ), active: true },
  { label: 'Webinars', path: '/admin/webinars', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.867v6.266a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
  )},
  { label: 'Users', path: '/admin/users', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
  )},
  { label: 'Interviews', path: '/admin/interviews', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  )},
  { label: 'Certifications', path: '/admin/certifications', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
  )},
];

const AdminProgramsPage = () => {
  const navigate = useNavigate();
  const { adminLogout } = useAdmin();
  const adminApi = useMemo(() => createAdminApi(), []);

  // ── View state ──
  const [view, setView] = useState('programs'); // 'programs' | 'content'
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Programs ──
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [programForm, setProgramForm] = useState(EMPTY_PROGRAM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ── Content management ──
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleForm, setModuleForm] = useState(EMPTY_MODULE);
  const [expandedModules, setExpandedModules] = useState({});
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForModule, setLessonForModule] = useState(null);
  const [lessonForm, setLessonForm] = useState(EMPTY_LESSON);
  const [uploadProgress, setUploadProgress] = useState({});
  const [deleteModuleConfirm, setDeleteModuleConfirm] = useState(null);
  const [deleteLessonConfirm, setDeleteLessonConfirm] = useState(null);

  useEffect(() => { fetchPrograms(); }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/admin/programs');
      setPrograms(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async (programId) => {
    setModulesLoading(true);
    try {
      const res = await adminApi.get(`/admin/programs/${programId}/modules`);
      setModules(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setModulesLoading(false);
    }
  };

  // ── Program CRUD ──
  const openCreateProgram = () => { setEditingProgram(null); setProgramForm(EMPTY_PROGRAM); setShowProgramForm(true); setError(''); };
  const openEditProgram = (p) => {
    setEditingProgram(p);
    setProgramForm({ title: p.title, description: p.description, domain: p.domain, level: p.level, duration: p.duration, thumbnail: p.thumbnail || '', instructor: p.instructor, price: p.price || '', isActive: p.isActive });
    setShowProgramForm(true);
    setError('');
  };

  const handleSaveProgram = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...programForm, price: programForm.price ? parseInt(programForm.price) : 0 };
      if (editingProgram) {
        await adminApi.put(`/admin/programs/${editingProgram.id}`, payload);
      } else {
        await adminApi.post('/admin/programs', payload);
      }
      setShowProgramForm(false);
      await fetchPrograms();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProgram = async (id) => {
    try { await adminApi.delete(`/admin/programs/${id}`); setDeleteConfirm(null); await fetchPrograms(); } catch (err) { console.error(err); }
  };

  // ── Content management ──
  const openContentManagement = (program) => {
    setSelectedProgram(program);
    setView('content');
    fetchModules(program.id);
    setExpandedModules({});
  };

  // ── Module CRUD ──
  const handleSaveModule = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingModule) {
        await adminApi.put(`/admin/modules/${editingModule.id}`, moduleForm);
      } else {
        await adminApi.post(`/admin/programs/${selectedProgram.id}/modules`, moduleForm);
      }
      setShowModuleForm(false);
      await fetchModules(selectedProgram.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async (id) => {
    try { await adminApi.delete(`/admin/modules/${id}`); setDeleteModuleConfirm(null); await fetchModules(selectedProgram.id); } catch (err) { console.error(err); }
  };

  // ── Lesson CRUD ──
  const openCreateLesson = (moduleId) => {
    setLessonForModule(moduleId);
    setEditingLesson(null);
    setLessonForm(EMPTY_LESSON);
    setShowLessonForm(true);
    setError('');
  };

  const openEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title, description: lesson.description || '', duration: lesson.duration || '',
      videoUrl: lesson.videoUrl || '', videoUrl360p: lesson.videoUrl360p || '',
      videoUrl480p: lesson.videoUrl480p || '', videoUrl720p: lesson.videoUrl720p || '',
      order: lesson.order, keyTakeaway: lesson.keyTakeaway || '',
      resources: lesson.resources ? JSON.stringify(lesson.resources, null, 2) : '[]',
    });
    setShowLessonForm(true);
    setError('');
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      let resources = [];
      try { resources = JSON.parse(lessonForm.resources || '[]'); } catch (_) { resources = []; }
      const payload = { ...lessonForm, resources };
      if (editingLesson) {
        await adminApi.put(`/admin/lessons/${editingLesson.id}`, payload);
      } else {
        await adminApi.post(`/admin/modules/${lessonForModule}/lessons`, payload);
      }
      setShowLessonForm(false);
      await fetchModules(selectedProgram.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (id) => {
    try { await adminApi.delete(`/admin/lessons/${id}`); setDeleteLessonConfirm(null); await fetchModules(selectedProgram.id); } catch (err) { console.error(err); }
  };

  // ── Video Upload ──
  const handleVideoUpload = async (file, quality, lessonFormSetter) => {
    if (!file) return;
    const key = quality;
    setUploadProgress(p => ({ ...p, [key]: 0 }));
    const formData = new FormData();
    formData.append('video', file);
    formData.append('folder', 'lessons');
    try {
      const res = await adminApi.post('/admin/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(p => ({ ...p, [key]: pct }));
        },
      });
      const url = res.data.data.url;
      lessonFormSetter(prev => ({ ...prev, [quality]: url }));
      setUploadProgress(p => { const n = { ...p }; delete n[key]; return n; });
    } catch (err) {
      console.error('Video upload failed', err);
      setUploadProgress(p => { const n = { ...p }; delete n[key]; return n; });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1220] flex">
      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0F1A2E] border-r border-white/5 transition-all duration-300 flex flex-col flex-shrink-0`}>
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(v => !v)} className="w-10 h-10 rounded-xl bg-[#E4B61A] flex items-center justify-center flex-shrink-0">
            <span className="text-[#0F1A2E] font-black text-lg">G</span>
          </button>
          {sidebarOpen && <span className="text-xl font-black text-white">Grad<span className="text-[#E4B61A]">ToPro</span></span>}
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all text-sm ${
                item.active ? 'bg-[#E4B61A]/10 text-[#E4B61A]' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}>
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={() => { adminLogout(); navigate('/admin/login'); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-[#0F1A2E]/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-10 px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {view === 'content' && (
              <button onClick={() => setView('programs')} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            <div>
              <h1 className="text-2xl font-black text-white">
                {view === 'programs' ? 'Program Management' : `${selectedProgram?.title}`}
              </h1>
              <p className="text-white/40 text-sm">
                {view === 'programs' ? `${programs.length} programs total` : 'Modules & Lessons'}
              </p>
            </div>
          </div>
          {view === 'programs' ? (
            <button onClick={openCreateProgram}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E4B61A] text-[#0F1A2E] rounded-xl font-bold text-sm hover:bg-yellow-300 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              New Program
            </button>
          ) : (
            <button onClick={() => { setEditingModule(null); setModuleForm(EMPTY_MODULE); setShowModuleForm(true); setError(''); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E4B61A] text-[#0F1A2E] rounded-xl font-bold text-sm hover:bg-yellow-300 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Add Module
            </button>
          )}
        </header>

        <div className="p-8">
          {/* ── Programs Grid ── */}
          {view === 'programs' && (
            loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#E4B61A] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {programs.map((p) => (
                  <div key={p.id} className="bg-[#0F1A2E] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all group">
                    <div className="h-32 bg-gradient-to-br from-blue-900/30 to-purple-900/20 relative overflow-hidden">
                      {p.thumbnail && <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full ${p.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {p.price > 0 && (
                        <span className="absolute bottom-3 right-3 text-xs font-bold px-2.5 py-1 bg-[#E4B61A]/90 text-[#0F1A2E] rounded-lg">
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <span className="text-xs text-[#E4B61A] font-semibold">{p.domain}</span>
                      <h3 className="text-white font-bold mt-1 mb-0.5 line-clamp-2">{p.title}</h3>
                      <p className="text-white/40 text-xs mb-2">{p.level} · {p.duration} · {p._count?.enrollments || 0} enrolled</p>
                      <p className="text-white/50 text-xs line-clamp-2 mb-4">{p.description}</p>
                      <div className="flex gap-2">
                        <button onClick={() => openContentManagement(p)}
                          className="flex-1 py-2 bg-[#E4B61A]/10 text-[#E4B61A] rounded-xl text-xs font-bold hover:bg-[#E4B61A]/20 transition-all">
                          Manage Content
                        </button>
                        <button onClick={() => openEditProgram(p)}
                          className="py-2 px-3 bg-white/5 text-white/70 rounded-xl text-xs font-medium hover:bg-white/10 transition-all">
                          Edit
                        </button>
                        <button onClick={() => setDeleteConfirm(p.id)}
                          className="py-2 px-3 bg-red-500/10 text-red-400 rounded-xl text-xs font-medium hover:bg-red-500/20 transition-all">
                          Del
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── Content Management ── */}
          {view === 'content' && (
            modulesLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#E4B61A] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4 max-w-4xl">
                {modules.length === 0 ? (
                  <div className="text-center py-20 bg-[#0F1A2E] rounded-2xl border border-white/5">
                    <p className="text-white/40 mb-4">No modules yet. Add your first module to get started.</p>
                    <button onClick={() => { setEditingModule(null); setModuleForm(EMPTY_MODULE); setShowModuleForm(true); }}
                      className="px-5 py-2.5 bg-[#E4B61A] text-[#0F1A2E] rounded-xl font-bold text-sm">
                      Add First Module
                    </button>
                  </div>
                ) : (
                  modules.map((module, mi) => (
                    <div key={module.id} className="bg-[#0F1A2E] border border-white/5 rounded-2xl overflow-hidden">
                      {/* Module header */}
                      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
                        <button onClick={() => setExpandedModules(p => ({ ...p, [module.id]: !p[module.id] }))}
                          className="p-1 rounded-lg text-white/40 hover:text-white transition-all">
                          <svg className={`w-4 h-4 transition-transform ${expandedModules[module.id] ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <div className="w-7 h-7 rounded-xl bg-[#E4B61A]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[#E4B61A]">{mi + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-sm truncate">{module.title}</h3>
                          <p className="text-white/40 text-xs">{module.lessons?.length || 0} lessons {module.isLocked ? '· Locked' : ''}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => openCreateLesson(module.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E4B61A]/10 text-[#E4B61A] rounded-lg text-xs font-bold hover:bg-[#E4B61A]/20 transition-all">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                            Add Lesson
                          </button>
                          <button onClick={() => { setEditingModule(module); setModuleForm({ title: module.title, description: module.description || '', order: module.order, isLocked: module.isLocked }); setShowModuleForm(true); setError(''); }}
                            className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => setDeleteModuleConfirm(module.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>

                      {/* Lessons */}
                      {expandedModules[module.id] && (
                        <div className="divide-y divide-white/5">
                          {(module.lessons || []).length === 0 ? (
                            <p className="px-6 py-4 text-white/30 text-sm">No lessons yet.</p>
                          ) : (
                            module.lessons.map((lesson, li) => (
                              <div key={lesson.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/2 transition-all">
                                <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs text-white/30">{li + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white/80 text-sm font-medium truncate">{lesson.title}</p>
                                  <div className="flex items-center gap-3 mt-0.5">
                                    {lesson.duration && <span className="text-xs text-white/30">{lesson.duration}</span>}
                                    <div className="flex items-center gap-1.5">
                                      {lesson.videoUrl720p && <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded font-semibold">720p</span>}
                                      {lesson.videoUrl480p && <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-semibold">480p</span>}
                                      {lesson.videoUrl360p && <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded font-semibold">360p</span>}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => openEditLesson(lesson)}
                                    className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                  </button>
                                  <button onClick={() => setDeleteLessonConfirm(lesson.id)}
                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )
          )}
        </div>
      </main>

      {/* ── Program Form Modal ── */}
      {showProgramForm && (
        <Modal title={editingProgram ? 'Edit Program' : 'Create Program'} onClose={() => setShowProgramForm(false)}>
          <form onSubmit={handleSaveProgram} className="space-y-4">
            {error && <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}
            {[
              { label: 'Title', key: 'title', type: 'text' },
              { label: 'Instructor', key: 'instructor', type: 'text' },
              { label: 'Thumbnail URL', key: 'thumbnail', type: 'url', required: false },
            ].map(({ label, key, type, required = true }) => (
              <FormField key={key} label={label}>
                <input type={type} required={required} value={programForm[key]} onChange={(e) => setProgramForm(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E4B61A]" />
              </FormField>
            ))}
            <FormField label="Description">
              <textarea rows={3} required value={programForm.description} onChange={(e) => setProgramForm(p => ({ ...p, description: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E4B61A] resize-none" />
            </FormField>
            <FormField label="Price (₹, 0 = Free)">
              <input type="number" min="0" value={programForm.price} onChange={(e) => setProgramForm(p => ({ ...p, price: e.target.value }))}
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E4B61A]" />
            </FormField>
            {[
              { label: 'Domain', key: 'domain', options: DOMAINS },
              { label: 'Level', key: 'level', options: LEVELS },
              { label: 'Duration', key: 'duration', options: DURATIONS },
            ].map(({ label, key, options }) => (
              <FormField key={key} label={label}>
                <select value={programForm[key]} onChange={(e) => setProgramForm(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full bg-[#0a1220] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E4B61A]">
                  {options.map(o => <option key={o}>{o}</option>)}
                </select>
              </FormField>
            ))}
            {editingProgram && (
              <label className="flex items-center gap-3 text-sm text-white/70 cursor-pointer">
                <input type="checkbox" checked={programForm.isActive} onChange={(e) => setProgramForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 accent-[#E4B61A]" />
                Active
              </label>
            )}
            <ModalActions saving={saving} onCancel={() => setShowProgramForm(false)} label={editingProgram ? 'Update' : 'Create'} />
          </form>
        </Modal>
      )}

      {/* ── Module Form Modal ── */}
      {showModuleForm && (
        <Modal title={editingModule ? 'Edit Module' : 'Add Module'} onClose={() => setShowModuleForm(false)}>
          <form onSubmit={handleSaveModule} className="space-y-4">
            {error && <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}
            <FormField label="Title">
              <input type="text" required value={moduleForm.title} onChange={(e) => setModuleForm(p => ({ ...p, title: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E4B61A]" />
            </FormField>
            <FormField label="Description (optional)">
              <textarea rows={2} value={moduleForm.description} onChange={(e) => setModuleForm(p => ({ ...p, description: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E4B61A] resize-none" />
            </FormField>
            <FormField label="Order">
              <input type="number" min="0" value={moduleForm.order} onChange={(e) => setModuleForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E4B61A]" />
            </FormField>
            <label className="flex items-center gap-3 text-sm text-white/70 cursor-pointer">
              <input type="checkbox" checked={moduleForm.isLocked} onChange={(e) => setModuleForm(p => ({ ...p, isLocked: e.target.checked }))} className="w-4 h-4 accent-[#E4B61A]" />
              Lock this module
            </label>
            <ModalActions saving={saving} onCancel={() => setShowModuleForm(false)} label={editingModule ? 'Update' : 'Add Module'} />
          </form>
        </Modal>
      )}

      {/* ── Lesson Form Modal ── */}
      {showLessonForm && (
        <Modal title={editingLesson ? 'Edit Lesson' : 'Add Lesson'} onClose={() => setShowLessonForm(false)} wide>
          <form onSubmit={handleSaveLesson} className="space-y-4">
            {error && <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Title" className="col-span-2">
                <input type="text" required value={lessonForm.title} onChange={(e) => setLessonForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E4B61A]" />
              </FormField>
              <FormField label="Duration (e.g. 12:30)">
                <input type="text" value={lessonForm.duration} onChange={(e) => setLessonForm(p => ({ ...p, duration: e.target.value }))}
                  placeholder="12:30"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E4B61A]" />
              </FormField>
              <FormField label="Order">
                <input type="number" min="0" value={lessonForm.order} onChange={(e) => setLessonForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E4B61A]" />
              </FormField>
            </div>

            {/* Video URLs */}
            <div className="bg-white/3 border border-white/10 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Video Files</p>
              {[
                { label: '720p (HD)', key: 'videoUrl720p' },
                { label: '480p', key: 'videoUrl480p' },
                { label: '360p', key: 'videoUrl360p' },
                { label: 'Default URL', key: 'videoUrl' },
              ].map(({ label, key }) => (
                <VideoUploadField
                  key={key}
                  label={label}
                  value={lessonForm[key]}
                  onChange={(url) => setLessonForm(p => ({ ...p, [key]: url }))}
                  onUpload={(file) => handleVideoUpload(file, key, setLessonForm)}
                  uploading={uploadProgress[key] !== undefined}
                  progress={uploadProgress[key] || 0}
                />
              ))}
            </div>

            <FormField label="Description (optional)">
              <textarea rows={2} value={lessonForm.description} onChange={(e) => setLessonForm(p => ({ ...p, description: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E4B61A] resize-none" />
            </FormField>
            <FormField label="Key Takeaway (optional)">
              <textarea rows={2} value={lessonForm.keyTakeaway} onChange={(e) => setLessonForm(p => ({ ...p, keyTakeaway: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E4B61A] resize-none" />
            </FormField>
            <FormField label={<span>Resources <span className="text-white/30 font-normal">(JSON array)</span></span>}>
              <textarea rows={3} value={lessonForm.resources} onChange={(e) => setLessonForm(p => ({ ...p, resources: e.target.value }))}
                placeholder={'[{"type":"pdf","title":"Slides","url":"https://..."}]'}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E4B61A] resize-none font-mono" />
            </FormField>
            <ModalActions saving={saving} onCancel={() => setShowLessonForm(false)} label={editingLesson ? 'Update Lesson' : 'Add Lesson'} />
          </form>
        </Modal>
      )}

      {/* ── Confirm Delete Modals ── */}
      {deleteConfirm && (
        <ConfirmDelete onConfirm={() => handleDeleteProgram(deleteConfirm)} onCancel={() => setDeleteConfirm(null)}
          title="Delete Program?" message="This will permanently delete the program and all its content." />
      )}
      {deleteModuleConfirm && (
        <ConfirmDelete onConfirm={() => handleDeleteModule(deleteModuleConfirm)} onCancel={() => setDeleteModuleConfirm(null)}
          title="Delete Module?" message="All lessons in this module will be permanently deleted." />
      )}
      {deleteLessonConfirm && (
        <ConfirmDelete onConfirm={() => handleDeleteLesson(deleteLessonConfirm)} onCancel={() => setDeleteLessonConfirm(null)}
          title="Delete Lesson?" message="This lesson and its video data will be permanently deleted." />
      )}
    </div>
  );
};

// ── Reusable modal components ────────────────────────────────

const Modal = ({ title, onClose, children, wide }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div className={`bg-[#0F1A2E] border border-white/10 rounded-2xl ${wide ? 'w-full max-w-2xl' : 'w-full max-w-lg'} max-h-[90vh] overflow-y-auto`}>
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0F1A2E] z-10">
        <h2 className="text-white font-bold">{title}</h2>
        <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none transition-all">&times;</button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const FormField = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-white/50 mb-1.5">{label}</label>
    {children}
  </div>
);

const ModalActions = ({ saving, onCancel, label }) => (
  <div className="flex gap-3 pt-2">
    <button type="submit" disabled={saving}
      className="flex-1 py-3 bg-[#E4B61A] text-[#0F1A2E] rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-yellow-300 transition-all">
      {saving ? 'Saving...' : label}
    </button>
    <button type="button" onClick={onCancel}
      className="flex-1 py-3 bg-white/5 text-white rounded-xl font-medium text-sm hover:bg-white/10 transition-all">
      Cancel
    </button>
  </div>
);

const ConfirmDelete = ({ title, message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div className="bg-[#0F1A2E] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
      <h3 className="text-white font-bold mb-2">{title}</h3>
      <p className="text-white/50 text-sm mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all">Delete</button>
        <button onClick={onCancel} className="flex-1 py-2.5 bg-white/5 text-white rounded-xl font-medium text-sm hover:bg-white/10 transition-all">Cancel</button>
      </div>
    </div>
  </div>
);

const VideoUploadField = ({ label, value, onChange, onUpload, uploading, progress }) => {
  const fileRef = useRef();
  return (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#E4B61A]"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 bg-[#E4B61A]/10 text-[#E4B61A] rounded-xl text-xs font-semibold hover:bg-[#E4B61A]/20 transition-all disabled:opacity-50 flex-shrink-0"
        >
          {uploading ? `${progress}%` : 'Upload'}
        </button>
        <input ref={fileRef} type="file" accept="video/*" className="hidden"
          onChange={(e) => { if (e.target.files[0]) onUpload(e.target.files[0]); }} />
      </div>
      {uploading && (
        <div className="mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-1 bg-[#E4B61A] rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      {value && !uploading && (
        <p className="text-[10px] text-green-400 mt-0.5 truncate">✓ {value.split('/').pop()}</p>
      )}
    </div>
  );
};

export default AdminProgramsPage;
