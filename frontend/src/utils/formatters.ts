/**
 * Formats a date string (ISO or SQLite format) to "26 Oct 2026 · 09:15"
 */
export function formatIncidentDate(dateStr: string): string {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    // If Date parsing fails (e.g. custom sqlite format without timezone), try replacing space with T
    const fallback = new Date(dateStr.replace(' ', 'T'));
    if (!isNaN(fallback.getTime())) {
      return formatDateObj(fallback);
    }
    return dateStr;
  }

  return formatDateObj(date);
}

function formatDateObj(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${day} ${month} ${year} · ${hours}:${minutes}`;
}
