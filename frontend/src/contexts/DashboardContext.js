import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../config/api';

const DashboardContext = createContext();
const DEFAULT_PROGRAM_PAGE_SIZE = 6;

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within DashboardProvider');
  return context;
};

export const DashboardProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);

  const [programs, setPrograms] = useState([]);
  const [programsPagination, setProgramsPagination] = useState(null);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState({ domains: [], levels: [], durations: [] });

  const [interviewData, setInterviewData] = useState(null);
  const [interviewLoading, setInterviewLoading] = useState(false);

  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // ── Dashboard ──────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const res = await api.get('/dashboard');
      setDashboardData(res.data.data);
    } catch (err) {
      setDashboardError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  // ── Programs ───────────────────────────────────────────────
  const fetchPrograms = useCallback(async (filters = {}) => {
    setProgramsLoading(true);
    try {
      const params = new URLSearchParams();
      const requestFilters = { limit: DEFAULT_PROGRAM_PAGE_SIZE, ...filters };
      Object.entries(requestFilters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await api.get(`/programs?${params.toString()}`);
      setPrograms(res.data.programs);
      setProgramsPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch programs:', err);
    } finally {
      setProgramsLoading(false);
    }
  }, []);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const res = await api.get('/programs/filters');
      setFilterOptions(res.data.data);
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    }
  }, []);

  const enrollInProgram = useCallback(async (programId) => {
    const res = await api.post('/programs/enroll', { programId });
    return res.data;
  }, []);

  // ── Interviews ─────────────────────────────────────────────
  const fetchInterviewData = useCallback(async () => {
    setInterviewLoading(true);
    try {
      const res = await api.get('/interviews');
      setInterviewData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch interview data:', err);
    } finally {
      setInterviewLoading(false);
    }
  }, []);

  const bookInterview = useCallback(async (domain, preferredDate) => {
    const res = await api.post('/interviews/book', { domain, preferredDate });
    await fetchInterviewData();
    return res.data;
  }, [fetchInterviewData]);

  const cancelBooking = useCallback(async (bookingId) => {
    await api.delete(`/interviews/bookings/${bookingId}`);
    await fetchInterviewData();
  }, [fetchInterviewData]);

  // ── Profile ────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const res = await api.get('/profile');
      setProfileData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    const res = await api.patch('/profile', data);
    setProfileData(res.data.data);
    return res.data;
  }, []);

  return (
    <DashboardContext.Provider value={{
      // Dashboard
      dashboardData, dashboardLoading, dashboardError, fetchDashboard,
      // Programs
      programs, programsPagination, programsLoading, filterOptions,
      fetchPrograms, fetchFilterOptions, enrollInProgram,
      // Interviews
      interviewData, interviewLoading,
      fetchInterviewData, bookInterview, cancelBooking,
      // Profile
      profileData, profileLoading,
      fetchProfile, updateProfile,
    }}>
      {children}
    </DashboardContext.Provider>
  );
};
