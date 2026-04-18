import React, { useEffect, useState, useCallback } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import LoadingSpinner from '../components/shared/LoadingSpinner';

// ── Constants ────────────────────────────────────────────────

const DOMAIN_DOTS = {
  'Engineering & Tech':   'bg-yellow-400',
  'Business Management':  'bg-blue-400',
  'Data Science':         'bg-purple-400',
  'Product Design':       'bg-pink-400',
  'Marketing & Growth':   'bg-green-400',
};

const DOMAIN_CARD_COLORS = {
  'Engineering & Tech':   { bg: 'from-yellow-400 to-orange-400',  text: 'text-white' },
  'Business Management':  { bg: 'from-blue-500 to-blue-700',      text: 'text-white' },
  'Data Science':         { bg: 'from-purple-500 to-violet-700',  text: 'text-white' },
  'Product Design':       { bg: 'from-pink-400 to-rose-500',      text: 'text-white' },
  'Marketing & Growth':   { bg: 'from-green-400 to-teal-500',     text: 'text-white' },
};

const LEVEL_COLORS = {
  Beginner:     'bg-green-100 text-green-700',
  Intermediate: 'bg-orange-100 text-orange-700',
  Advanced:     'bg-red-100 text-red-700',
};

// Duration options come from the backend via filterOptions.durations (admin-managed)

const PAGE_SIZE = 6;

// ── Main Page ────────────────────────────────────────────────

const ProgramsPage = () => {
  const {
    programs,
    programsPagination,
    programsLoading,
    filterOptions,
    fetchPrograms,
    fetchFilterOptions,
    enrollInProgram,
  } = useDashboard();

  const [filters, setFilters] = useState({
    domain: '',
    level: '',
    duration: '',
    search: '',
    page: 1,
  });
  const [enrolling, setEnrolling]     = useState(null);
  const [enrollSuccess, setEnrollSuccess] = useState(null);
  const [sortBy, setSortBy]           = useState('Popularity');
  const [savedPrograms, setSavedPrograms] = useState(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => { fetchFilterOptions(); }, [fetchFilterOptions]);

  const load = useCallback((f) => { fetchPrograms(f); }, [fetchPrograms]);
  useEffect(() => { load(filters); }, [filters, load]);

  const setFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? '' : value, page: 1 }));

  const clearFilters = () =>
    setFilters({ domain: '', level: '', duration: '', search: '', page: 1 });

  const handleEnroll = async (programId) => {
    setEnrolling(programId);
    try {
      await enrollInProgram(programId);
      setEnrollSuccess(programId);
      setTimeout(() => setEnrollSuccess(null), 3000);
    } catch (err) {
      console.error('Enrollment error:', err);
    } finally {
      setEnrolling(null);
    }
  };

  const toggleSave = (id) =>
    setSavedPrograms((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const activeCount = [filters.domain, filters.level, filters.duration].filter(Boolean).length;
  const domains   = filterOptions?.domains   || [];
  const levels    = filterOptions?.levels    || ['Beginner', 'Intermediate', 'Advanced'];
  const durations = filterOptions?.durations || [];

  // domain counts derived from current program list (approximate)
  const domainCounts = programs.reduce((acc, p) => {
    acc[p.domain] = (acc[p.domain] || 0) + 1;
    return acc;
  }, {});

  const total  = programsPagination?.total || programs.length;
  const page   = programsPagination?.page  || filters.page;
  const from   = (page - 1) * PAGE_SIZE + 1;
  const to     = Math.min(page * PAGE_SIZE, total);

  return (
    <DashboardLayout>
      <div className="flex min-h-[calc(100vh-64px)]">

        {/* ── Left Sidebar ──────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-60 xl:w-64 bg-white border-r border-gray-100 flex-shrink-0 sticky top-16 self-start h-[calc(100vh-64px)] overflow-y-auto">
          <div className="px-5 py-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </span>
              {activeCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-gray-400 hover:text-gray-700 tracking-widest uppercase"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Domain */}
            <FilterGroup title="Domain">
              {domains.map((d) => (
                <button
                  key={d}
                  onClick={() => setFilter('domain', d)}
                  className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-all group ${
                    filters.domain === d
                      ? 'bg-yellow-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${
                      DOMAIN_DOTS[d] || 'bg-gray-300'
                    } ${filters.domain === d ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}
                  />
                  <span className={`flex-1 text-left truncate ${
                    filters.domain === d ? 'text-gray-900 font-semibold' : 'text-gray-600'
                  }`}>
                    {d}
                  </span>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {programsPagination?.domainCounts?.[d] || ''}
                  </span>
                </button>
              ))}
            </FilterGroup>

            <div className="border-t border-gray-100 my-4" />

            {/* Skill Level */}
            <FilterGroup title="Skill Level">
              {levels.map((l) => (
                <button
                  key={l}
                  onClick={() => setFilter('level', l)}
                  className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-all ${
                    filters.level === l
                      ? 'bg-yellow-50 text-gray-900 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      filters.level === l
                        ? 'border-yellow-400 bg-yellow-400'
                        : 'border-gray-300'
                    }`}
                  >
                    {filters.level === l && (
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </span>
                  {l}
                </button>
              ))}
            </FilterGroup>

            <div className="border-t border-gray-100 my-4" />

            {/* Duration — values come from admin-managed backend data */}
            <FilterGroup title="Duration">
              {durations.length === 0 ? (
                <p className="text-xs text-gray-400">No durations available</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {durations.map((d) => (
                    <button
                      key={d}
                      onClick={() => setFilter('duration', d)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        filters.duration === d
                          ? 'bg-primary text-secondary'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </FilterGroup>
          </div>
        </aside>

        {/* ── Mobile Filter Drawer ───────────────────────────── */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72 bg-white overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <span className="font-bold text-gray-900">Filters</span>
                <button onClick={() => setMobileFiltersOpen(false)}>
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-5 py-5 space-y-5">
                <FilterGroup title="Domain">
                  {domains.map((d) => (
                    <button key={d} onClick={() => setFilter('domain', d)}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm ${
                        filters.domain === d ? 'bg-yellow-50 font-semibold text-gray-900' : 'text-gray-600'
                      }`}>
                      <span className={`w-2 h-2 rounded-sm ${DOMAIN_DOTS[d] || 'bg-gray-300'}`} />
                      {d}
                    </button>
                  ))}
                </FilterGroup>
                <FilterGroup title="Skill Level">
                  {levels.map((l) => (
                    <button key={l} onClick={() => setFilter('level', l)}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm ${
                        filters.level === l ? 'bg-yellow-50 font-semibold text-gray-900' : 'text-gray-600'
                      }`}>
                      <span className={`w-3 h-3 rounded-full border-2 ${
                        filters.level === l ? 'border-yellow-400 bg-yellow-400' : 'border-gray-300'
                      }`} />
                      {l}
                    </button>
                  ))}
                </FilterGroup>
                <FilterGroup title="Duration">
                  <div className="flex flex-wrap gap-2">
                    {durations.map((d) => (
                      <button key={d} onClick={() => setFilter('duration', d)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          filters.duration === d ? 'bg-primary text-secondary' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </FilterGroup>
              </div>
            </div>
          </div>
        )}

        {/* ── Main Content ──────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Top bar: title + search + sort */}
          <div className="bg-white border-b border-gray-100 px-5 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Title + mobile filter btn */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
                <h1 className="text-xl font-bold text-gray-900">All Programs</h1>
              </div>

              {/* Search */}
              <div className="relative flex-1">
                <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search for skills, domains, or certifications..."
                  value={filters.search}
                  onChange={(e) => setFilter('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                />
              </div>

              {/* Sort dropdown */}
              <div className="relative flex-shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white cursor-pointer font-medium"
                >
                  <option value="Popularity">Sort by: Popularity</option>
                  <option value="Newest">Sort by: Newest</option>
                  <option value="Level">Sort by: Level</option>
                  <option value="Duration">Sort by: Duration</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {activeCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                {filters.domain && (
                  <FilterChip label={filters.domain} onRemove={() => setFilter('domain', '')} />
                )}
                {filters.level && (
                  <FilterChip label={filters.level} onRemove={() => setFilter('level', '')} />
                )}
                {filters.duration && (
                  <FilterChip label={filters.duration} onRemove={() => setFilter('duration', '')} />
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-400 hover:text-gray-700 font-medium transition-all"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Programs Grid */}
          <div className="flex-1 px-5 sm:px-6 py-6">
            {programsLoading ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner message="Loading programs..." />
              </div>
            ) : programs.length === 0 ? (
              <EmptyState onClear={clearFilters} />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
                  {programs.map((program) => (
                    <ProgramCard
                      key={program.id}
                      program={program}
                      onEnroll={handleEnroll}
                      enrolling={enrolling === program.id}
                      enrolled={enrollSuccess === program.id}
                      saved={savedPrograms.has(program.id)}
                      onSave={() => toggleSave(program.id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  current={page}
                  total={programsPagination?.totalPages || 1}
                  from={from}
                  to={to}
                  count={total}
                  onPage={(p) => setFilters((prev) => ({ ...prev, page: p }))}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// ── FilterGroup ──────────────────────────────────────────────

const FilterGroup = ({ title, children }) => (
  <div>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</p>
    <div className="space-y-0.5">{children}</div>
  </div>
);

// ── FilterChip ───────────────────────────────────────────────

const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-secondary text-xs font-semibold rounded-full border border-primary/30">
    {label}
    <button
      onClick={onRemove}
      className="text-yellow-600 hover:text-yellow-900 transition-all"
      aria-label={`Remove ${label} filter`}
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </span>
);

// ── ProgramCard ──────────────────────────────────────────────

const ProgramCard = ({ program, onEnroll, enrolling, enrolled, saved, onSave }) => {
  const levelColor = LEVEL_COLORS[program.level] || 'bg-gray-100 text-gray-600';
  const domainStyle = DOMAIN_CARD_COLORS[program.domain] || { bg: 'from-gray-300 to-gray-400', text: 'text-white' };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* ── Thumbnail ── */}
      <div className="relative h-40 overflow-hidden">
        {program.thumbnail ? (
          <img
            src={program.thumbnail}
            alt={program.title}
            className="w-full h-full object-cover"
          />
        ) : (
          /* Gradient fallback matching the design */
          <div className={`w-full h-full bg-gradient-to-br ${domainStyle.bg} flex items-center justify-center relative`}>
            {/* Abstract decorative circles */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
              <div className="absolute bottom-2 -left-6 w-20 h-20 bg-white/10 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 rounded-full" />
            </div>
            {/* Domain short label */}
            <span className={`relative z-10 text-lg font-black ${domainStyle.text} opacity-30 text-center px-4`}>
              {program.domain?.split(' ')[0]}
            </span>
          </div>
        )}

        {/* Domain badge overlay — top left */}
        <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold rounded-md">
          {program.domain?.split(' ')[0] || 'Program'}
        </span>

        {/* Bookmark button — top right */}
        <button
          onClick={(e) => { e.stopPropagation(); onSave(); }}
          className={`absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            saved
              ? 'bg-primary text-secondary'
              : 'bg-black/40 backdrop-blur-sm text-white hover:bg-black/60'
          }`}
          aria-label="Save program"
        >
          <svg className="w-3.5 h-3.5" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>

      {/* ── Card Body ── */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Title */}
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
          {program.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed flex-1">
          {program.description}
        </p>

        {/* Meta: duration + certificate */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{program.duration || '6 Weeks'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span>{program.certificateType || 'Professional Certificate'}</span>
          </div>
        </div>

        {/* Level badge */}
        <div>
          <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${levelColor}`}>
            {program.level || 'Advanced'}
          </span>
        </div>

        {/* Enroll button */}
        <button
          onClick={() => onEnroll(program.id)}
          disabled={enrolling || enrolled}
          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
            enrolled
              ? 'bg-green-100 text-green-700 cursor-default'
              : enrolling
              ? 'bg-primary/50 text-secondary cursor-wait'
              : 'bg-primary text-secondary hover:opacity-90 active:scale-[0.98]'
          }`}
        >
          {enrolled ? 'Enrolled!' : enrolling ? 'Enrolling...' : 'Enroll Now'}
        </button>
      </div>
    </div>
  );
};

// ── EmptyState ───────────────────────────────────────────────

const EmptyState = ({ onClear }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <p className="text-gray-600 font-semibold mb-1">No programs found</p>
    <p className="text-gray-400 text-sm mb-5">Try adjusting your filters or search terms</p>
    <button
      onClick={onClear}
      className="px-5 py-2.5 bg-primary text-secondary font-bold rounded-xl text-sm hover:opacity-90 transition-all"
    >
      Clear All Filters
    </button>
  </div>
);

// ── Pagination ───────────────────────────────────────────────

const Pagination = ({ current, total, from, to, count, onPage }) => {
  const pages = buildPageRange(current, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 pb-4">
      <p className="text-sm text-gray-400">
        Showing{' '}
        <span className="text-gray-600 font-medium">{from}</span>
        {' '}to{' '}
        <span className="text-gray-600 font-medium">{to}</span>
        {' '}of{' '}
        <span className="text-gray-600 font-medium">{count}</span>
        {' '}results
      </p>

      {total > 1 && (
        <div className="flex items-center gap-1">
          {/* Prev */}
          <NavBtn
            onClick={() => onPage(current - 1)}
            disabled={current <= 1}
            aria="Previous page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </NavBtn>

          {pages.map((p, i) =>
            p === '…' ? (
              <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  p === current
                    ? 'bg-primary text-secondary shadow-sm'
                    : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            )
          )}

          {/* Next */}
          <NavBtn
            onClick={() => onPage(current + 1)}
            disabled={current >= total}
            aria="Next page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </NavBtn>
        </div>
      )}
    </div>
  );
};

const NavBtn = ({ children, onClick, disabled, aria }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={aria}
    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
  >
    {children}
  </button>
);

// Build smart page range with ellipsis
function buildPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (current > 3) pages.push('…');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}

export default ProgramsPage;
