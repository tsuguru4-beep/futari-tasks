const WEEKDAY = '日月火水木金土';
const pad = (n: number) => String(n).padStart(2, '0');

export const toDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayStr = () => toDateStr(new Date());

function parse(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(s: string, n: number): string {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

// b − a の日数
export const diffDays = (a: string, b: string) => Math.round((parse(b).getTime() - parse(a).getTime()) / 86400000);

export function fmtMD(s: string): string {
  const d = parse(s);
  return `${d.getMonth() + 1}/${d.getDate()}（${WEEKDAY[d.getDay()]}）`;
}

export function fmtLong(s: string): string {
  const d = parse(s);
  return `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAY[d.getDay()]}）`;
}

// 今日が土曜なら今日、それ以外は次の土曜
export const nextSaturday = (today: string) => addDays(today, (6 - parse(today).getDay() + 7) % 7);

export type DueTone = 'over' | 'today' | 'soon' | 'normal';

export function dueInfo(due: string, today: string): { text: string; tone: DueTone } {
  const n = diffDays(today, due);
  if (n < 0) return { text: `${fmtMD(due)}・${-n}日超過`, tone: 'over' };
  if (n === 0) return { text: '今日', tone: 'today' };
  if (n === 1) return { text: '明日', tone: 'soon' };
  return { text: fmtMD(due), tone: 'normal' };
}

export const isLocalToday = (iso: string | null, today: string) => !!iso && toDateStr(new Date(iso)) === today;
