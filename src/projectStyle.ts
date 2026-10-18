// 似た色が隣り合わないよう、色相順に並べた落ち着いた中間色
export const PROJECT_COLORS = [
  '#5B7FA6', '#4A8FC2', '#4F9A9A', '#3E8C76',
  '#5E9478', '#7E9A4A', '#B08A3E', '#C07A3A',
  '#B8645A', '#C0566E', '#B76E8E', '#9A5FA6',
  '#8C6BAE', '#6A6FC0', '#8A7560', '#7A7F87',
];

// 新しいプロジェクトには、まだ使われていない（または一番使われていない）色を選んでおく
export function leastUsedColor(used: string[]): string {
  const count = (c: string) => used.filter((u) => u.toLowerCase() === c.toLowerCase()).length;
  return PROJECT_COLORS.reduce((best, c) => (count(c) < count(best) ? c : best), PROJECT_COLORS[0]);
}

// 明るい色の上では文字を濃くする（自由に選んだ色向け）
export function textOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 170 ? '#1f2328' : '#ffffff';
}

// 最初に作りやすいよう例として出すプロジェクト
export const SUGGESTED_PROJECTS = [
  { name: '家事', color: '#4F9A9A' },
  { name: '買い物', color: '#B08A3E' },
  { name: '旅行計画', color: '#5B7FA6' },
  { name: '子どものこと', color: '#B76E8E' },
];
