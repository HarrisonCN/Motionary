export interface FormChoice { value: string; label: string; disabled?: boolean; group?: string; }
export function choices(value: unknown): FormChoice[] {
  if (typeof value === 'string') { try { value = JSON.parse(value); } catch { return []; } }
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.filter(v => v && typeof v === 'object' && typeof v.value === 'string' && !seen.has(v.value) && (seen.add(v.value), true)).slice(0, 1000).map(v => ({ value: v.value, label: String(v.label ?? v.value), disabled: v.disabled === true, group: v.group ? String(v.group) : undefined }));
}
let sequence = 0;
export function choiceId(): string { return `usa-choice-${++sequence}`; }
