import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../config/api';

const QUALITY_LABELS = { auto: 'Auto', '720p': '720p HD', '480p': '480p', '360p': '360p' };

const CourseContentPage = () => {
  const { programId, lessonId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [courseData, setCourseData] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [error, setError] = useState('');
  const [quality, setQuality] = useState('auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [helpful, setHelpful] = useState(false);
  const [saved, setSaved] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  // Load course structure
  const loadCourse = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/programs/${programId}/content`);
      const data = res.data.data;
      setCourseData(data);
      setCompletedLessons(data.completedLessons || []);

      // Expand the module containing the current lesson
      const modules = data.program.modules || [];
      const initial = {};
      modules.forEach((m, i) => {
        initial[m.id] = i === 0; // open first by default
      });
      setExpandedModules(initial);
    } catch (err) {
      setError('Not enrolled in this program or program not found.');
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => { loadCourse(); }, [loadCourse]);

  // Load specific lesson when lessonId changes
  useEffect(() => {
    if (!lessonId || !courseData) return;
    setLessonLoading(true);
    api.get(`/programs/lessons/${lessonId}`)
      .then(res => {
        setCurrentLesson(res.data.data.lesson);
        // Expand module containing this lesson
        const mod = courseData.program.modules.find(m => m.lessons.some(l => l.id === parseInt(lessonId)));
        if (mod) setExpandedModules(prev => ({ ...prev, [mod.id]: true }));
      })
      .catch(() => {})
      .finally(() => setLessonLoading(false));
  }, [lessonId, courseData]);

  // Load first lesson if none selected
  useEffect(() => {
    if (!lessonId && courseData) {
      const first = courseData.program.modules?.[0]?.lessons?.[0];
      if (first) navigate(`/programs/${programId}/learn/${first.id}`, { replace: true });
    }
  }, [lessonId, courseData, programId, navigate]);

  const getVideoUrl = (lesson) => {
    if (!lesson) return '';
    if (quality === '720p' && lesson.videoUrl720p) return lesson.videoUrl720p;
    if (quality === '480p' && lesson.videoUrl480p) return lesson.videoUrl480p;
    if (quality === '360p' && lesson.videoUrl360p) return lesson.videoUrl360p;
    return lesson.videoUrl720p || lesson.videoUrl480p || lesson.videoUrl360p || lesson.videoUrl || '';
  };

  const getAvailableQualities = (lesson) => {
    if (!lesson) return ['auto'];
    const q = ['auto'];
    if (lesson.videoUrl720p) q.push('720p');
    if (lesson.videoUrl480p) q.push('480p');
    if (lesson.videoUrl360p) q.push('360p');
    return q;
  };

  const handleMarkComplete = async () => {
    if (!currentLesson || completing) return;
    const alreadyDone = completedLessons.includes(currentLesson.id);
    setCompleting(true);
    try {
      await api.post(`/programs/lessons/${currentLesson.id}/complete`, { completed: !alreadyDone });
      if (alreadyDone) {
        setCompletedLessons(prev => prev.filter(id => id !== currentLesson.id));
      } else {
        setCompletedLessons(prev => [...prev, currentLesson.id]);
      }
      await loadCourse();
    } catch (err) {
      console.error('Failed to mark lesson:', err);
    } finally {
      setCompleting(false);
    }
  };

  // Navigate between lessons
  const getAllLessons = () => {
    if (!courseData) return [];
    return courseData.program.modules.flatMap(m => m.lessons);
  };

  const getCurrentLessonIndex = () => {
    const all = getAllLessons();
    return all.findIndex(l => l.id === parseInt(lessonId));
  };

  const navigateLesson = (direction) => {
    const all = getAllLessons();
    const idx = getCurrentLessonIndex();
    const next = idx + direction;
    if (next >= 0 && next < all.length) {
      navigate(`/programs/${programId}/learn/${all[next].id}`);
    }
  };

  const totalLessons = getAllLessons().length;
  const currentIdx = getCurrentLessonIndex();
  const completedCount = completedLessons.length;
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link to="/dashboard" className="px-5 py-2.5 bg-yellow-400 text-gray-900 font-bold rounded-xl text-sm">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const videoUrl = getVideoUrl(currentLesson);
  const availableQualities = getAvailableQualities(currentLesson);
  const isCompleted = currentLesson && completedLessons.includes(currentLesson.id);
  const resources = currentLesson?.resources || [];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      {/* ── Top Nav ── */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <Link to="/dashboard" className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="w-7 h-7 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-black text-gray-900">G</span>
        </div>
        <h1 className="text-sm font-semibold text-white truncate flex-1">{courseData?.program?.title}</h1>
        {/* Progress */}
        <div className="hidden sm:flex items-center gap-2 mr-2">
          <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-1.5 bg-yellow-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-gray-400 font-medium">{progress}%</span>
        </div>
        {/* Mobile sidebar toggle */}
        <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Sidebar ── */}
        <>
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 md:hidden">
              <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-80 bg-[#1a1a1a] overflow-y-auto z-50">
                <SidebarContent
                  courseData={courseData}
                  completedLessons={completedLessons}
                  currentLessonId={parseInt(lessonId)}
                  programId={programId}
                  expandedModules={expandedModules}
                  setExpandedModules={setExpandedModules}
                  onNavigate={() => setSidebarOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Desktop sidebar */}
          <aside className="hidden md:flex w-72 xl:w-80 bg-[#1a1a1a] border-r border-gray-800 flex-col flex-shrink-0 overflow-y-auto">
            <SidebarContent
              courseData={courseData}
              completedLessons={completedLessons}
              currentLessonId={parseInt(lessonId)}
              programId={programId}
              expandedModules={expandedModules}
              setExpandedModules={setExpandedModules}
            />
          </aside>
        </>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto">
          {/* Video Player */}
          <div className="bg-black relative aspect-video max-h-[60vh]">
            {videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  key={`${videoUrl}-${quality}`}
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  controls
                  preload="metadata"
                />
                {/* Quality Selector */}
                {availableQualities.length > 1 && (
                  <div className="absolute bottom-14 right-4">
                    <button
                      onClick={() => setShowQualityMenu(v => !v)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 text-white rounded-lg text-xs font-semibold hover:bg-black/90 transition-all backdrop-blur-sm"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {QUALITY_LABELS[quality] || quality}
                    </button>
                    {showQualityMenu && (
                      <div className="absolute bottom-full right-0 mb-2 bg-[#1a1a1a] border border-gray-700 rounded-xl overflow-hidden shadow-xl min-w-[120px]">
                        {availableQualities.map(q => (
                          <button
                            key={q}
                            onClick={() => { setQuality(q); setShowQualityMenu(false); }}
                            className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-all ${
                              quality === q ? 'bg-yellow-400/20 text-yellow-400' : 'text-gray-300 hover:bg-gray-700/50'
                            }`}
                          >
                            {QUALITY_LABELS[q] || q}
                            {quality === q && <span className="float-right">✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">{lessonLoading ? 'Loading video...' : 'No video available for this lesson'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Lesson Info + Actions */}
          <div className="px-5 sm:px-8 py-5 border-b border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white mb-1">
                  {currentLesson?.title || 'Select a lesson'}
                </h2>
                {currentLesson?.duration && (
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {currentLesson.duration}
                  </p>
                )}
              </div>
              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setHelpful(v => !v)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    helpful ? 'bg-yellow-400/20 border-yellow-400/40 text-yellow-400' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill={helpful ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Helpful
                </button>
                <button
                  onClick={() => setSaved(v => !v)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    saved ? 'bg-blue-400/20 border-blue-400/40 text-blue-400' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Save
                </button>
                {/* Prev / Next */}
                <button
                  onClick={() => navigateLesson(-1)}
                  disabled={currentIdx <= 0}
                  className="p-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:border-gray-600 transition-all disabled:opacity-30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigateLesson(1)}
                  disabled={currentIdx >= totalLessons - 1}
                  className="p-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:border-gray-600 transition-all disabled:opacity-30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {/* Mark Complete */}
                <button
                  onClick={handleMarkComplete}
                  disabled={completing || !currentLesson}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                      : 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
                  }`}
                >
                  {completing ? (
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {isCompleted ? 'Completed' : 'Mark Complete'}
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          {currentLesson?.description && (
            <div className="px-5 sm:px-8 py-5 border-b border-gray-800">
              <p className="text-gray-400 text-sm leading-relaxed">{currentLesson.description}</p>
            </div>
          )}

          {/* Key Takeaway */}
          {currentLesson?.keyTakeaway && (
            <div className="px-5 sm:px-8 py-5 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white mb-3">Key Takeaway</h3>
              <div className="border-l-4 border-yellow-400 pl-4 py-1">
                <p className="text-gray-300 text-sm leading-relaxed">{currentLesson.keyTakeaway}</p>
              </div>
            </div>
          )}

          {/* Lesson Resources */}
          {resources.length > 0 && (
            <div className="px-5 sm:px-8 py-5 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white mb-4">Lesson Resources</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {resources.map((resource, i) => (
                  <ResourceCard key={i} resource={resource} />
                ))}
              </div>
            </div>
          )}

          <div className="h-8" />
        </main>
      </div>
    </div>
  );
};

// ── Sidebar ──────────────────────────────────────────────────

const SidebarContent = ({ courseData, completedLessons, currentLessonId, programId, expandedModules, setExpandedModules, onNavigate }) => {
  const navigate = useNavigate();
  const modules = courseData?.program?.modules || [];
  const allLessons = modules.flatMap(m => m.lessons);
  const total = allLessons.length;
  const completed = completedLessons.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const toggleModule = (id) => setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));

  const handleLessonClick = (lessonId) => {
    navigate(`/programs/${programId}/learn/${lessonId}`);
    if (onNavigate) onNavigate();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Course Progress */}
      <div className="px-5 py-5 border-b border-gray-800">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Course Progress</p>
        <div className="h-1.5 bg-gray-700 rounded-full mb-2">
          <div className="h-1.5 bg-yellow-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-gray-400">{completed}/{total} lessons · {progress}% complete</p>
      </div>

      {/* Modules */}
      <div className="flex-1 overflow-y-auto py-3">
        {modules.map((module, mi) => (
          <div key={module.id} className="mb-1">
            {/* Module header */}
            <button
              onClick={() => toggleModule(module.id)}
              className="w-full flex items-center gap-2.5 px-5 py-3 hover:bg-gray-800/50 transition-all text-left"
            >
              <svg
                className={`w-3.5 h-3.5 text-gray-500 flex-shrink-0 transition-transform ${expandedModules[module.id] ? 'rotate-90' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-300 truncate">
                  Module {mi + 1}: {module.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {module.lessons.filter(l => completedLessons.includes(l.id)).length}/{module.lessons.length} lessons
                </p>
              </div>
              {module.isLocked && (
                <svg className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </button>

            {/* Lessons */}
            {expandedModules[module.id] && (
              <div>
                {module.lessons.map((lesson) => {
                  const isDone = completedLessons.includes(lesson.id);
                  const isActive = lesson.id === currentLessonId;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson.id)}
                      className={`w-full flex items-start gap-3 px-5 py-3 text-left transition-all ${
                        isActive ? 'bg-yellow-400/10 border-l-2 border-yellow-400' : 'hover:bg-gray-800/30 border-l-2 border-transparent'
                      }`}
                    >
                      {/* Status icon */}
                      <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 border-2 transition-all ${
                        isDone
                          ? 'bg-green-500 border-green-500'
                          : isActive
                          ? 'border-yellow-400 bg-yellow-400/20'
                          : 'border-gray-600'
                      }`}>
                        {isDone ? (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : isActive ? (
                          <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium leading-snug truncate ${isActive ? 'text-yellow-400' : isDone ? 'text-gray-400' : 'text-gray-300'}`}>
                          {isActive && <span className="text-[10px] font-bold text-yellow-500 block mb-0.5">NOW PLAYING</span>}
                          {lesson.title}
                        </p>
                        {lesson.duration && (
                          <p className="text-[10px] text-gray-600 mt-0.5">{lesson.duration}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── ResourceCard ─────────────────────────────────────────────

const ResourceCard = ({ resource }) => {
  const icons = {
    pdf: (
      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    link: (
      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    doc: (
      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  };

  const type = resource.type || 'link';
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-4 bg-gray-800/60 rounded-xl border border-gray-700/50 hover:border-gray-600 hover:bg-gray-800 transition-all group"
    >
      <div className="w-9 h-9 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gray-600 transition-all">
        {icons[type] || icons.link}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-200 truncate">{resource.title || resource.name || 'Resource'}</p>
        <p className="text-xs text-gray-500 capitalize">{type}</p>
      </div>
      <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    </a>
  );
};

export default CourseContentPage;
