import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import api from '../config/api';

const DEFAULT_FILTERS = {
  domain: '',
  difficulty: '',
  eligibility: '',
  search: '',
  sort: 'Newest',
  page: 1,
};

const DOMAIN_BADGES = {
  'Supply Chain': 'bg-[#F4C20D] text-[#111827]',
  Fintech: 'bg-[#54C0FF] text-[#102A43]',
  'E-Commerce': 'bg-[#5B57E6] text-white',
};

const FALLBACK_FILTERS = {
  domains: ['Supply Chain', 'Fintech', 'Healthcare', 'Automotive', 'E-Commerce'],
  difficulties: ['Beginner', 'Intermediate', 'Advanced'],
  eligibility: ['Certification Eligible', 'Practice Only'],
};

const CertificationLibraryPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [projects, setProjects] = useState([]);
  const [filterOptions, setFilterOptions] = useState(FALLBACK_FILTERS);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1, limit: 6 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });

        const response = await api.get(`/certification/projects?${params.toString()}`);
        setProjects(response.data.projects || []);
        setFilterOptions({
          domains: response.data.filters?.domains?.length ? response.data.filters.domains : FALLBACK_FILTERS.domains,
          difficulties: response.data.filters?.difficulties?.length ? response.data.filters.difficulties : FALLBACK_FILTERS.difficulties,
          eligibility: response.data.filters?.eligibility?.length ? response.data.filters.eligibility : FALLBACK_FILTERS.eligibility,
        });
        setPagination(response.data.pagination || { total: 0, page: 1, totalPages: 1, limit: 6 });
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load certification projects right now.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [filters]);

  const visibleProjects = useMemo(() => projects.slice(0, 6), [projects]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? '' : value,
      page: 1,
    }));
  };

  const changePage = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const openProject = (project) => {
    if (project.isEnrolled && project.enrollmentId) {
      navigate(`/certification/workspace/${project.enrollmentId}`);
      return;
    }

    navigate(`/certification/program/${project.slug}`);
  };

  const from = visibleProjects.length ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const to = visibleProjects.length ? from + visibleProjects.length - 1 : 0;

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-68px)] bg-[#F3F2ED]">
        <section className="border-b border-[#E8E6DE] bg-white">
          <div className="mx-auto max-w-[1380px] px-6 pb-14 pt-14 lg:px-8 lg:pb-16 lg:pt-16">
            <div className="max-w-[760px] pl-0 lg:pl-[66px]">
              <h1 className="text-[48px] font-black leading-[1.1] tracking-[-0.03em] text-[#111A44]">
                Industrial Projects Library
              </h1>
              <p className="mt-7 max-w-[760px] text-[19px] leading-[2.2rem] text-[#66748F]">
                Gain real-world experience by solving industry-standard problems. Filter by your
                domain expertise and start building your portfolio.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1380px] px-6 py-10 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[286px_minmax(0,1fr)] lg:items-start">
            <aside className="space-y-6">
              <FilterCard
                title="DOMAIN"
                options={filterOptions.domains}
                activeValue={filters.domain}
                onSelect={(value) => updateFilter('domain', value)}
                checkedStyle
              />
              <FilterCard
                title="Difficulty"
                options={filterOptions.difficulties}
                activeValue={filters.difficulty}
                onSelect={(value) => updateFilter('difficulty', value)}
              />
              <FilterCard
                title="Eligibility"
                options={filterOptions.eligibility}
                activeValue={filters.eligibility}
                onSelect={(value) => updateFilter('eligibility', value)}
              />
              <button
                onClick={resetFilters}
                className="h-[47px] w-full rounded-full border border-[#CBD5E1] bg-white text-[15px] font-semibold text-[#475569] shadow-[0_4px_16px_rgba(15,23,42,0.04)]"
              >
                Reset Filters
              </button>
            </aside>

            <div>
              <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full max-w-[410px]">
                  <svg className="pointer-events-none absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-[#98A2B3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                  </svg>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value, page: 1 }))}
                    placeholder="Search projects by keyword.."
                    className="h-[60px] w-full rounded-[22px] border border-[#E5E7EB] bg-white pl-16 pr-5 text-[16px] text-[#667085] shadow-[0_10px_30px_rgba(15,23,42,0.08)] outline-none"
                  />
                </div>

                <div className="relative w-full max-w-[340px]">
                  <select
                    value={filters.sort}
                    onChange={(event) => setFilters((prev) => ({ ...prev, sort: event.target.value, page: 1 }))}
                    className="h-[60px] w-full appearance-none rounded-[22px] border border-[#E5E7EB] bg-white px-7 text-[16px] font-medium text-[#111827] shadow-[0_10px_30px_rgba(15,23,42,0.08)] outline-none"
                  >
                    <option>Newest</option>
                    <option>Popular</option>
                  </select>
                  <svg className="pointer-events-none absolute right-6 top-1/2 h-5 w-5 -translate-y-1/2 text-[#334155]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>

              {error && (
                <div className="mb-8 rounded-[22px] border border-[#FECACA] bg-[#FFF1F2] px-5 py-4 text-[15px] font-medium text-[#FF3152]">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-[490px] rounded-[14px] bg-white shadow-[0_6px_22px_rgba(15,23,42,0.08)] animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {visibleProjects.map((project) => (
                      <article
                        key={project.id}
                        className="overflow-hidden rounded-[10px] border border-[#DCE2EA] bg-white shadow-[0_4px_18px_rgba(15,23,42,0.08)]"
                      >
                        <div className="relative h-[200px] overflow-hidden">
                          <img src={project.thumbnail} alt={project.title} className="h-full w-full object-cover" />
                          <span className={`absolute left-10 bottom-9 inline-flex h-[34px] items-center rounded-[4px] px-4 text-[14px] font-medium ${DOMAIN_BADGES[project.domain] || 'bg-white text-[#111827]'}`}>
                            {project.domain}
                          </span>
                        </div>

                        <div className="px-3 pb-4 pt-3">
                          <h2 className="min-h-[86px] text-[24px] font-semibold leading-[1.15] tracking-[-0.02em] text-[#111827]">
                            {project.title}
                          </h2>
                          <p className="mt-2 min-h-[70px] text-[14px] leading-8 text-[#6B7280]">
                            {project.shortDescription}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {project.tags.map((tag) => (
                              <span key={tag} className="inline-flex h-[30px] items-center rounded-full border border-[#C8D0DA] px-4 text-[13px] text-[#111827]">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="mt-5 flex items-center gap-4 text-[14px] text-[#6B7280]">
                            <span className="inline-flex items-center gap-2">
                              <svg className="h-5 w-5 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                              </svg>
                              {project.durationWeeks} Weeks
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <svg className="h-4 w-4 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17 17 7M7 12h5v5" />
                              </svg>
                              {project.difficulty}
                            </span>
                          </div>

                          <button
                            onClick={() => openProject(project)}
                            className="mt-4 h-[46px] w-full rounded-[8px] bg-[#F4C20D] text-[17px] font-bold text-[#111827]"
                          >
                            {project.isEnrolled ? 'Continue Workspace' : 'Enroll Now'}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="mt-14 border-t border-[#CCD4DE] pt-7">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <p className="text-[17px] font-semibold text-[#475569]">
                        Showing {from} to {to} of {pagination.total} results
                      </p>

                      <div className="flex items-center gap-2">
                        <PageButton disabled={pagination.page <= 1} onClick={() => changePage(Math.max(1, pagination.page - 1))}>
                          &lt;
                        </PageButton>
                        {Array.from({ length: Math.max(1, pagination.totalPages) }).slice(0, 5).map((_, index) => {
                          const page = index + 1;
                          return (
                            <PageButton key={page} active={page === pagination.page} onClick={() => changePage(page)}>
                              {page}
                            </PageButton>
                          );
                        })}
                        <PageButton disabled={pagination.page >= pagination.totalPages} onClick={() => changePage(Math.min(pagination.totalPages, pagination.page + 1))}>
                          &gt;
                        </PageButton>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

const FilterCard = ({ title, options, activeValue, onSelect, checkedStyle = false }) => (
  <div className="bg-white px-6 py-7 shadow-[0_6px_22px_rgba(15,23,42,0.04)]">
    <h3 className="text-[18px] font-black tracking-[0.06em] text-[#111827]">{title}</h3>
    <div className="mt-6 space-y-5">
      {options.map((option) => {
        const active = activeValue === option;
        return (
          <button key={option} onClick={() => onSelect(option)} className="flex w-full items-center gap-4 text-left">
            <span className={`flex h-6 w-6 items-center justify-center rounded-[4px] border text-[13px] ${
              active
                ? 'border-[#F4C20D] bg-[#F4C20D] text-white'
                : 'border-[#D1D5DB] bg-white text-transparent'
            }`}>
              {checkedStyle ? '✓' : active ? '✓' : '·'}
            </span>
            <span className={`text-[16px] ${active ? 'font-medium text-[#111827]' : 'text-[#6B7280]'}`}>
              {option}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

const PageButton = ({ children, active = false, disabled = false, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex h-10 min-w-[40px] items-center justify-center rounded-[6px] border text-[14px] font-semibold ${
      active
        ? 'border-[#6D28FF] bg-white text-[#6D28FF]'
        : 'border-[#D7DCE3] bg-white text-[#94A3B8]'
    } ${disabled ? 'opacity-50' : ''}`}
  >
    {children}
  </button>
);

export default CertificationLibraryPage;

