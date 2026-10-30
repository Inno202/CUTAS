const dateFmt = new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
const longDateFmt = new Intl.DateTimeFormat('en-ZA', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('en-ZA', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
});

/** "2026-11-04" (a calendar date, no time zone) -> Date at local midnight. */
function parseDateOnly(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = parseDateOnly(value) ?? new Date(value);
  return Number.isNaN(d.getTime()) ? value : dateFmt.format(d);
}

export function formatLongDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = parseDateOnly(value) ?? new Date(value);
  return Number.isNaN(d.getTime()) ? value : longDateFmt.format(d);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : dateTimeFmt.format(d);
}

/** "10:00:00" -> "10:00" */
export function formatTime(value: string | null | undefined): string {
  return value ? value.slice(0, 5) : '';
}

export function timeRange(start: string | null | undefined, end: string | null | undefined): string {
  const s = formatTime(start);
  const e = formatTime(end);
  return e ? `${s} – ${e}` : s;
}

export function isPastDate(value: string): boolean {
  const d = parseDateOnly(value);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

export function initials(first: string, last: string, fallback = '?'): string {
  const a = (first || '').trim()[0] ?? '';
  const b = (last || '').trim()[0] ?? '';
  return (a + b).toUpperCase() || fallback;
}

export function nameInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return ((parts[0][0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function fullName(u: { title?: string; firstName: string; lastName: string; username?: string }): string {
  const name = `${u.firstName} ${u.lastName}`.trim() || u.username || '';
  return u.title ? `${u.title} ${name}` : name;
}

/** Only http(s) links are ever rendered as clickable; DOIs ("10.xxxx/...") go through doi.org. */
export function safeHref(value: string | null | undefined): string | null {
  const v = (value || '').trim();
  if (!v) return null;
  if (/^10\.\d{4,9}\/\S+$/.test(v)) return `https://doi.org/${v}`;
  try {
    const url = new URL(v);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export function currentYear(): number {
  return new Date().getFullYear();
}
