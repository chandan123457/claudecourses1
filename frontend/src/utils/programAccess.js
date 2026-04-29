const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_ACCESS_DAYS = 45;

const getDurationDays = (durationLabel) => {
  const rawValue = String(durationLabel || '').trim().toLowerCase();
  if (!rawValue) return DEFAULT_ACCESS_DAYS;

  const rangeMatch = rawValue.match(/(\d+)\s*[-to]+\s*(\d+)/i);
  const singleMatch = rawValue.match(/(\d+)/);
  const value = rangeMatch
    ? Math.max(Number(rangeMatch[1]), Number(rangeMatch[2]))
    : singleMatch
      ? Number(singleMatch[1])
      : DEFAULT_ACCESS_DAYS;

  if (!Number.isFinite(value) || value <= 0) return DEFAULT_ACCESS_DAYS;
  if (rawValue.includes('month')) return value * 30;
  if (rawValue.includes('week')) return value * 7;
  if (rawValue.includes('day')) return value;
  return value;
};

export const getProgramAccessState = (entry) => {
  if (!entry) {
    return {
      active: false,
      expired: false,
      endDate: null,
      daysRemaining: 0,
    };
  }

  const durationLabel = entry.program?.duration || entry.duration;
  const enrolledAt = entry.enrolledAt ? new Date(entry.enrolledAt) : null;
  const derivedEndDate = enrolledAt
    ? new Date(enrolledAt.getTime() + getDurationDays(durationLabel) * DAY_IN_MS)
    : null;
  const endDate = entry.accessEndDate ? new Date(entry.accessEndDate) : derivedEndDate;
  const active = typeof entry.accessActive === 'boolean'
    ? entry.accessActive
    : Boolean(endDate && endDate.getTime() > Date.now());
  const expired = typeof entry.accessExpired === 'boolean'
    ? entry.accessExpired
    : Boolean(endDate && endDate.getTime() <= Date.now());
  const daysRemaining = entry.accessDaysRemaining ?? (
    endDate ? Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / DAY_IN_MS)) : 0
  );

  return {
    active,
    expired,
    endDate,
    daysRemaining,
  };
};

export const formatDisplayDate = (value, options = {}) => {
  if (!value) return 'N/A';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
};
