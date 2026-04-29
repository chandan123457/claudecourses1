import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDashboard } from '../contexts/DashboardContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { formatDisplayDate, getProgramAccessState } from '../utils/programAccess';

const PAGE_SIZE = 6;

const DOMAIN_CARD_COLORS = {
  'Engineering & Tech': { gradient: 'from-[#2B2F36] via-[#4A4338] to-[#9A7A2F]', badge: 'Engineering' },
  'Business Management': { gradient: 'from-[#173255] via-[#224D7D] to-[#3C77B7]', badge: 'Management' },
  'Data Science': { gradient: 'from-[#22234E] via-[#2F3E84] to-[#6A5EEB]', badge: 'Data' },
  'Product Design': { gradient: 'from-[#5A3119] via-[#8A4D23] to-[#C56C28]', badge: 'Product Design' },
  'Marketing & Growth': { gradient: 'from-[#0F4D46] via-[#11786C] to-[#1BB4A0]', badge: 'Marketing' },
};

const ProgramsPage = () => {
  const navigate = useNavigate();
  const {
    programs,
    programsPagination,
    programsLoading,
    filterOptions,
    fetchPrograms,
    fetchFilterOptions,
  } = useDashboard();

  const [filters, setFilters] = useState({
    domain: '',
    level: '',
    duration: '',
    search: '',
    page: 1,
  });
  const [sortBy, setSortBy] = useState('Popularity');
  const [savedPrograms, setSavedPrograms] = useState(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  const loadPrograms = useCallback((nextFilters) => {
    fetchPrograms(nextFilters);
  }, [fetchPrograms]);

  useEffect(() => {
    loadPrograms(filters);
  }, [filters, loadPrograms]);

  const setFilter = (key, value) =>
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? '' : value,
      page: 1,
    }));

  const setSearch = (value) =>
    setFilters((prev) => ({
      ...prev,
      search: value,
      page: 1,
    }));

  const clearFilters = () =>
    setFilters({ domain: '', level: '', duration: '', search: '', page: 1 });

  const handleEnroll = (programId) => {
    navigate(`/enroll/${programId}/payment`);
  };

  const toggleSave = (id) =>
    setSavedPrograms((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const domains = filterOptions?.domains || [];
  const levels = filterOptions?.levels || ['Beginner', 'Intermediate', 'Advanced'];
  const durations = filterOptions?.durations || [];

  const domainCounts = useMemo(
    () => programs.reduce((acc, program) => {
      acc[program.domain] = (acc[program.domain] || 0) + 1;
      return acc;
    }, {}),
    [programs]
  );

  const sortedPrograms = useMemo(() => {
    return [...programs].sort((a, b) => {
      if (sortBy === 'Popularity') return (b._count?.enrollments || 0) - (a._count?.enrollments || 0);
      if (sortBy === 'Newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (sortBy === 'Level') {
        const rank = { Beginner: 1, Intermediate: 2, Advanced: 3 };
        return (rank[b.level] || 0) - (rank[a.level] || 0);
      }
      if (sortBy === 'Duration') return parseDurationWeeks(b.duration) - parseDurationWeeks(a.duration);
      return 0;
    });
  }, [programs, sortBy]);

  const total = programsPagination?.total || programs.length;
  const page = programsPagination?.page || filters.page;
  const totalPages = programsPagination?.totalPages || 1;
  const from = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = total ? Math.min(page * PAGE_SIZE, total) : 0;
  const activeCount = [filters.domain, filters.level, filters.duration].filter(Boolean).length;

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-68px)] bg-[#F5F5F2]">
        <div className="flex min-h-[calc(100vh-68px)]">
          <aside className="hidden w-[320px] flex-shrink-0 border-r border-[#E4E1DA] bg-[#FAFAF8] xl:block">
            <div className="sticky top-[68px] h-[calc(100vh-68px)] overflow-y-auto px-6 pb-10 pt-7">
              <div className="border-t border-[#CFCBC2] pt-10">
                <div className="flex items-center justify-between border-b border-[#D9D5CD] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#FFF3C9] text-[#E6B408]">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M7 12h10M10 18h4" />
                      </svg>
                    </span>
                    <span className="text-[18px] font-bold text-[#161616]">Filters</span>
                  </div>
                  <button
                    onClick={clearFilters}
                    className="text-sm font-semibold uppercase tracking-[0.04em] text-[#84807A] transition-all hover:text-[#161616]"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-9 pt-10">
                  <FilterSection title="DOMAIN">
                    {domains.map((domain) => (
                      <FilterCheckRow
                        key={domain}
                        label={domain}
                        active={filters.domain === domain}
                        count={domainCounts[domain] || 0}
                        onClick={() => setFilter('domain', domain)}
                      />
                    ))}
                  </FilterSection>

                  <Divider />

                  <FilterSection title="SKILL LEVEL">
                    {levels.map((level) => (
                      <FilterCheckRow
                        key={level}
                        label={level}
                        active={filters.level === level}
                        onClick={() => setFilter('level', level)}
                      />
                    ))}
                  </FilterSection>

                  <Divider />

                  <FilterSection title="DURATION">
                    <div className="flex flex-wrap gap-3">
                      {durations.map((duration) => (
                        <DurationChip
                          key={duration}
                          label={duration}
                          active={filters.duration === duration}
                          onClick={() => setFilter('duration', duration)}
                        />
                      ))}
                    </div>
                  </FilterSection>
                </div>
              </div>
            </div>
          </aside>

          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 xl:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-full max-w-[340px] overflow-y-auto bg-[#FAFAF8] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#DDD8CD] px-5 py-4">
                  <span className="text-lg font-bold text-[#161616]">Filters</span>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="rounded-xl border border-[#E0DDD6] p-2 text-[#6B6B6B]"
                    aria-label="Close filters"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="px-5 py-6">
                  <div className="space-y-8">
                    <FilterSection title="DOMAIN">
                      {domains.map((domain) => (
                        <FilterCheckRow
                          key={domain}
                          label={domain}
                          active={filters.domain === domain}
                          count={domainCounts[domain] || 0}
                          onClick={() => setFilter('domain', domain)}
                        />
                      ))}
                    </FilterSection>

                    <Divider />

                    <FilterSection title="SKILL LEVEL">
                      {levels.map((level) => (
                        <FilterCheckRow
                          key={level}
                          label={level}
                          active={filters.level === level}
                          onClick={() => setFilter('level', level)}
                        />
                      ))}
                    </FilterSection>

                    <Divider />

                    <FilterSection title="DURATION">
                      <div className="flex flex-wrap gap-3">
                        {durations.map((duration) => (
                          <DurationChip
                            key={duration}
                            label={duration}
                            active={filters.duration === duration}
                            onClick={() => setFilter('duration', duration)}
                          />
                        ))}
                      </div>
                    </FilterSection>

                    {activeCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-[#161616] px-5 text-sm font-semibold text-white"
                      >
                        Reset filters
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <main className="min-w-0 flex-1">
            <div className="px-7 py-8 xl:px-8">
              <div className="mx-auto max-w-[1040px]">
                <div className="flex flex-col gap-7">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setMobileFiltersOpen(true)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#DFDBD2] bg-white text-[#5A5A5A] shadow-[0_6px_20px_rgba(0,0,0,0.05)] xl:hidden"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M7 12h10M10 18h4" />
                          </svg>
                        </button>
                        <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[#161616] sm:text-[24px]">
                          All Programs
                        </h1>
                      </div>

                      <div className="relative w-full max-w-[340px]">
                        <select
                          value={sortBy}
                          onChange={(event) => setSortBy(event.target.value)}
                          className="h-[46px] w-full appearance-none rounded-xl border border-[#E3E0D8] bg-white pl-6 pr-12 text-[15px] font-medium text-[#161616] shadow-[0_14px_30px_rgba(0,0,0,0.10)] outline-none"
                        >
                          <option value="Popularity">Sort by: Popularity</option>
                          <option value="Newest">Sort by: Newest</option>
                          <option value="Level">Sort by: Level</option>
                          <option value="Duration">Sort by: Duration</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#262626]">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <svg className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#888888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.3-4.3m1.8-5.2a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search for skills, domains, or certifications ..."
                        value={filters.search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="h-[54px] w-full rounded-[14px] border border-[#E3E0D8] bg-white pl-16 pr-4 text-[15px] text-[#555555] shadow-[0_14px_30px_rgba(0,0,0,0.10)] outline-none placeholder:text-[#8C8C8C] focus:border-[#E8B80D] focus:ring-4 focus:ring-[#F1C232]/15"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {filters.domain && (
                        <ActiveChip
                          label={shortDomainLabel(filters.domain)}
                          onRemove={() => setFilter('domain', '')}
                        />
                      )}
                      {filters.duration && (
                        <ActiveChip
                          label={filters.duration}
                          onRemove={() => setFilter('duration', '')}
                        />
                      )}
                      {filters.level && (
                        <ActiveChip
                          label={filters.level}
                          onRemove={() => setFilter('level', '')}
                        />
                      )}
                      {activeCount > 0 && (
                        <button
                          onClick={clearFilters}
                          className="text-[15px] font-medium text-[#737373] transition-all hover:text-[#161616]"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>

                  {programsLoading ? (
                    <div className="flex items-center justify-center py-24">
                      <LoadingSpinner message="Loading programs..." />
                    </div>
                  ) : sortedPrograms.length === 0 ? (
                    <EmptyState onClear={clearFilters} />
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-7 md:grid-cols-2 2xl:grid-cols-3">
                        {sortedPrograms.map((program) => (
                          <ProgramCard
                            key={program.id}
                            program={program}
                            onEnroll={handleEnroll}
                            saved={savedPrograms.has(program.id)}
                            onSave={() => toggleSave(program.id)}
                          />
                        ))}
                      </div>

                      <div className="border-t border-[#D6D2CA] pt-10">
                        <Pagination
                          current={page}
                          total={totalPages}
                          from={from}
                          to={to}
                          count={total}
                          onPage={(nextPage) => setFilters((prev) => ({ ...prev, page: nextPage }))}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
};

const FilterSection = ({ title, children }) => (
  <section>
    <p className="mb-5 text-[15px] font-bold uppercase tracking-[-0.01em] text-[#151515]">{title}</p>
    <div className="space-y-4">{children}</div>
  </section>
);

const Divider = () => <div className="border-t border-[#D6D2CA]" />;

const FilterCheckRow = ({ label, active, count, onClick }) => (
  <button
    onClick={onClick}
    className="flex w-full items-center gap-4 text-left"
  >
    <span
      className={`flex h-6 w-6 items-center justify-center rounded-[4px] border text-[13px] transition-all ${
        active
          ? 'border-[#E8B80D] bg-[#E8B80D] text-white'
          : 'border-[#D1D1D1] bg-white text-transparent'
      }`}
    >
      ✓
    </span>
    <span className={`flex-1 text-[17px] leading-none ${active ? 'font-medium text-[#222222]' : 'text-[#626262]'}`}>
      {label}
    </span>
    {typeof count === 'number' && count > 0 ? (
      <span className="inline-flex min-w-[38px] items-center justify-center rounded-full bg-[#EEF0F3] px-3 py-0.5 text-[14px] font-semibold text-[#A0A7B4]">
        {count}
      </span>
    ) : null}
  </button>
);

const DurationChip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`rounded-[13px] border px-4 py-2 text-[14px] font-medium transition-all ${
      active
        ? 'border-[#E8B80D] bg-[#FFF7DA] text-[#D1A10C]'
        : 'border-[#C9CCD2] bg-white text-[#1E1E1E] hover:border-[#B6BBC4]'
    }`}
  >
    {label}
  </button>
);

const ActiveChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-3 rounded-full border border-[#F3E1A1] bg-white px-4 py-2 text-[15px] font-medium text-[#D1A10C] shadow-sm">
    {label}
    <button
      onClick={onRemove}
      aria-label={`Remove ${label}`}
      className="text-[#D1A10C] transition-all hover:text-[#161616]"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </span>
);

const ProgramCard = ({ program, onEnroll, saved, onSave }) => {
  const style = DOMAIN_CARD_COLORS[program.domain] || { gradient: 'from-[#8792A2] to-[#B0B8C2]', badge: 'Program' };
  const access = getProgramAccessState(program);
  const isEnrolled = Boolean(program.isEnrolled && access.active);

  return (
    <article className="flex min-h-[500px] flex-col overflow-hidden rounded-[10px] border border-[#DCE2EA] bg-white shadow-[0_4px_18px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(15,23,42,0.12)]">
      <div className="relative h-[220px] overflow-hidden">
        {program.thumbnail ? (
          <img src={program.thumbnail} alt={program.title} className="h-full w-full object-cover" />
        ) : (
          <div className={`relative flex h-full w-full items-center justify-center bg-gradient-to-br ${style.gradient}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.14),transparent_18%),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.1),transparent_20%)]" />
            <span className="relative z-10 px-4 text-center text-lg font-black text-white/40">
              {style.badge}
            </span>
          </div>
        )}

        <span className="absolute left-3 top-5 inline-flex h-[30px] items-center rounded-[4px] bg-white px-4 text-[14px] font-medium text-[#111111] shadow-sm">
          {style.badge}
        </span>

        <button
          onClick={(event) => {
            event.stopPropagation();
            onSave();
          }}
          aria-label="Save program"
          className="absolute right-3 top-5 flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7DCE3] bg-white text-[#111111] transition-all hover:bg-[#FAFAFA]"
        >
          <svg className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-4 pt-3">
        <h3 className="min-h-[64px] text-[24px] font-semibold leading-[1.15] tracking-[-0.02em] text-[#111827]">
          {program.title}
        </h3>

        <p
          className="mt-2 min-h-[52px] text-[14px] leading-7 text-[#6B7280]"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {program.description}
        </p>

        <div className="mt-4 border-t border-[#D7DCE3] pt-4">
          <div className="space-y-2.5">
            <MetaRow icon="clock" text={program.duration || '6 Weeks'} />
            <MetaRow icon="certificate" text={`Professional Certificate${program.level ? ` · ${program.level}` : ''}`} />
          </div>
        </div>

        {isEnrolled ? (
          <div className="mt-auto flex flex-col gap-2 pt-4">
            <span className="flex w-full items-center justify-center gap-1.5 rounded-[8px] bg-green-100 py-2 text-xs font-bold text-green-700">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Enrolled
            </span>
            {access.endDate && (
              <p className="text-center text-xs font-medium text-[#6B7280]">
                Access until {formatDisplayDate(access.endDate)}
              </p>
            )}
            <Link
              to={`/programs/${program.id}/learn`}
              className="flex h-[46px] items-center justify-center rounded-[8px] bg-[#F4C20D] text-[17px] font-bold text-[#111827] transition-all hover:brightness-95"
            >
              Continue Learning
            </Link>
          </div>
        ) : (
          <div className="mt-auto pt-4">
            {access.expired && access.endDate ? (
              <p className="mb-2 text-center text-xs font-medium text-red-500">
                Previous access ended on {formatDisplayDate(access.endDate)}
              </p>
            ) : null}
            <button
              onClick={() => onEnroll(program.id)}
              className="h-[46px] w-full rounded-[8px] bg-[#F4C20D] text-[17px] font-bold text-[#111827] transition-all hover:brightness-95"
            >
              Enroll Now
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

const MetaRow = ({ icon, text }) => (
  <div className="flex items-center gap-3 text-[14px] text-[#6B7280]">
    {icon === 'clock' && (
      <svg className="h-5 w-5 flex-shrink-0 text-[#F0B90B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )}
    {icon === 'certificate' && (
      <svg className="h-5 w-5 flex-shrink-0 text-[#F0B90B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    )}
    {icon === 'level' && (
      <svg className="h-5 w-5 flex-shrink-0 text-[#F0B90B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17 17 7M7 12h5v5" />
      </svg>
    )}
    <span>{text}</span>
  </div>
);

const EmptyState = ({ onClear }) => (
  <div className="flex flex-col items-center justify-center rounded-[18px] border border-dashed border-[#D7D2C8] bg-white py-24 text-center shadow-sm">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F2F2EF]">
      <svg className="h-8 w-8 text-[#B6B6B6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <p className="mb-1 text-lg font-semibold text-[#2A2A2A]">No programs found</p>
    <p className="mb-6 text-sm text-[#7A7A7A]">Try adjusting your filters or search terms.</p>
    <button
      onClick={onClear}
      className="rounded-xl bg-[#F3C206] px-5 py-2.5 text-sm font-bold text-[#111111] transition-all hover:brightness-95"
    >
      Clear All Filters
    </button>
  </div>
);

const Pagination = ({ current, total, from, to, count, onPage }) => {
  const pages = buildPageRange(current, total);

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <p className="text-[18px] font-semibold text-[#6A6A6A]">
        Showing {from} to {to} of {count} results
      </p>

      {total > 1 && (
        <div className="flex items-center gap-2">
          <NavBtn onClick={() => onPage(current - 1)} disabled={current <= 1} aria="Previous page">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </NavBtn>

          {pages.map((entry, index) =>
            entry === '…' ? (
              <span key={`ellipsis-${index}`} className="flex h-8 w-8 items-center justify-center text-sm text-[#7D7D7D]">
                …
              </span>
            ) : (
              <button
                key={entry}
                onClick={() => onPage(entry)}
                className={`flex h-8 min-w-[32px] items-center justify-center rounded-[6px] border text-xs font-semibold transition-all ${
                  entry === current
                    ? 'border-[#6558FF] bg-white text-[#6558FF]'
                    : 'border-[#D8DCE3] bg-white text-[#3B3B3B] hover:bg-[#F8F8F8]'
                }`}
              >
                {entry}
              </button>
            )
          )}

          <NavBtn onClick={() => onPage(current + 1)} disabled={current >= total} aria="Next page">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D8DCE3] bg-[#EEF0F3] text-[#9AA0AA] transition-all hover:bg-[#E6E8EC] disabled:cursor-not-allowed disabled:opacity-40"
  >
    {children}
  </button>
);

function shortDomainLabel(value = '') {
  const map = {
    'Engineering & Tech': 'Engineering',
    'Business Management': 'Management',
    'Data Science': 'Data Science',
    'Product Design': 'Product Design',
    'Marketing & Growth': 'Marketing',
  };
  return map[value] || value;
}

function parseDurationWeeks(value = '') {
  const match = String(value).match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function buildPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = [1];
  if (current > 3) pages.push('…');
  for (let page = Math.max(2, current - 1); page <= Math.min(total - 1, current + 1); page += 1) {
    pages.push(page);
  }
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}

export default ProgramsPage;
