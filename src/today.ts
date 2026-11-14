// 한국 시각 기준 오늘 날짜(YYYY-MM-DD).
// [시험용] ?testDate= 는 미리보기 빌드(VITE_PREVIEW=1)에서만 켜져요. 콘솔에 올라가는 .ait 번들에는 들어가지 않아요.
export function todayKST(): string {
  if (import.meta.env.VITE_PREVIEW === '1') {
    const t = new URLSearchParams(location.search).get('testDate');
    if (t && /^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  }
  return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
}
export function dayDiff(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400e3);
}
export function labelKR(d: string): string {
  const dt = new Date(d + 'T00:00:00Z');
  const w = '일월화수목금토'[dt.getUTCDay()];
  return `${dt.getUTCMonth() + 1}월 ${dt.getUTCDate()}일 ${w}요일`;
}
