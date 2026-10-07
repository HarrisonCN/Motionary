/** Helpers shared by the component gallery catalog files (pure data, no DOM). */

export const defineName = (tag) => 'define' + tag.replace(/^usa-/, '').replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());

/** An element card: C(tag, category, titleEn, titleZh, descEn, descZh, tags, usage, demo?, extra?) */
export const C = (tag, category, en, zh, descEn, descZh, tags, usage, demo, extra = {}) => ({
  id: tag.replace(/^usa-/, ''),
  kind: 'element',
  tag,
  category,
  define: extra.define || defineName(tag),
  title: { en, zh },
  desc: { en: descEn, zh: descZh },
  tags,
  usage,
  demo: demo || usage,
  ...extra,
});

/** A JS helper card: H(id, category, fn, descEn, descZh, tags, usage, demo) */
export const H = (id, category, fn, descEn, descZh, tags, usage, demo, extra = {}) => ({
  id,
  kind: 'helper',
  category,
  fn,
  title: { en: `${fn}()`, zh: `${fn}()` },
  desc: { en: descEn, zh: descZh },
  tags,
  usage,
  demo,
  ...extra,
});

/** A category: K(id, icon, en, zh, descEn, descZh) */
export const K = (id, icon, en, zh, descEn, descZh) => ({ id, icon, en, zh, desc: { en: descEn, zh: descZh } });

export const pills = (n, cls = 'demo-pill') => Array.from({ length: n }, (_, i) => `<span class="${cls}">${i + 1}</span>`).join('');
