/**
 * Returns today's date in YYYY-MM-DD format using the browser's local timezone.
 * Unlike `new Date().toISOString().split('T')[0]`, this does not use UTC,
 * so it works correctly for users in timezones behind UTC (e.g. Colombia UTC-5).
 */
export function getTodayLocal() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
