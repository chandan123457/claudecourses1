const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_PROGRAM_ACCESS_DAYS = 45;

const toDate = (value: Date | string) => (value instanceof Date ? value : new Date(value));

export const getProgramDurationDays = (durationLabel?: string | null) => {
  const rawValue = String(durationLabel || '').trim().toLowerCase();
  if (!rawValue) return DEFAULT_PROGRAM_ACCESS_DAYS;

  const rangeMatch = rawValue.match(/(\d+)\s*[-to]+\s*(\d+)/i);
  const singleMatch = rawValue.match(/(\d+)/);
  const value = rangeMatch
    ? Math.max(Number(rangeMatch[1]), Number(rangeMatch[2]))
    : singleMatch
      ? Number(singleMatch[1])
      : DEFAULT_PROGRAM_ACCESS_DAYS;

  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_PROGRAM_ACCESS_DAYS;
  }

  if (rawValue.includes('month')) return value * 30;
  if (rawValue.includes('week')) return value * 7;
  if (rawValue.includes('day')) return value;

  return value;
};

export const getProgramAccessEndDate = (enrolledAt: Date | string, durationLabel?: string | null) =>
  new Date(toDate(enrolledAt).getTime() + getProgramDurationDays(durationLabel) * DAY_IN_MS);

export const getProgramAccessMeta = (enrolledAt: Date | string, durationLabel?: string | null) => {
  const enrolledDate = toDate(enrolledAt);
  const accessDurationDays = getProgramDurationDays(durationLabel);
  const accessEndDate = getProgramAccessEndDate(enrolledDate, durationLabel);
  const now = new Date();
  const msRemaining = accessEndDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / DAY_IN_MS));

  return {
    enrolledAt: enrolledDate,
    accessDurationDays,
    accessEndDate,
    accessActive: msRemaining > 0,
    accessExpired: msRemaining <= 0,
    accessDaysRemaining: daysRemaining,
  };
};
