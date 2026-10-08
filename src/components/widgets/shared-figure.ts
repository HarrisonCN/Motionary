/** Parse a figure like "$12.4k" / "−3.5%" / "1,204" → number + prefix / suffix / decimals (7.2). */
export function parseFigureText(s: string): { n: number; pre: string; post: string; dec: number } | null {
  const m = /^(\D*?)([-−]?[\d,]*\.?\d+)(.*)$/.exec(String(s).trim());
  if (!m) return null;
  const raw = m[2].replace(/,/g, '').replace('−', '-');
  const n = Number(raw);
  return Number.isFinite(n) ? { n, pre: m[1], post: m[3], dec: (raw.split('.')[1] || '').length } : null;
}
