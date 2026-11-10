/** 17.3: register the default `mo-*` name next to `usa-*` (new widgets ship `mo-*` without `defineMoAliases()`). */
export function defineMoName(tag: string, ctor: CustomElementConstructor | undefined): void {
  const m = tag.startsWith('usa-') ? 'mo-' + tag.slice(4) : '';
  if (!ctor || !m || customElements.get(m)) return;
  try {
    customElements.define(m, class extends (ctor as any) {} as unknown as CustomElementConstructor);
  } catch {
    /* the name is taken by another library */
  }
}
