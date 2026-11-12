import { beforeAll, beforeEach, afterEach, expect, it, vi } from 'vitest';
import { defineWidgets } from '../src/components/widgets';
import { configureComponents } from '../src/components/base';
import { DRAW_FX, registerDrawPack } from '../src/components/fx2/draw';
import { bindEffect, playEffect } from '../src/components/fx/registry';
import { installComponentMocks, tick, anims } from './components-setup';
const names = ['select', 'combobox', 'multi-select', 'number-stepper', 'password', 'range-slider', 'consent', 'cta-popup', 'validation-summary', 'textarea', 'search-field', 'form-stepper'];
const options = [{ value: 'a', label: '<img src=x onerror=1>' }, { value: 'b', label: 'Blocked', disabled: true }, { value: 'c', label: 'Cinema', group: 'Art' }];
const host = (name: string): any => document.querySelector('mo-' + name)!;
beforeAll(() => { defineWidgets('17.7'); registerDrawPack(); });
beforeEach(() => { installComponentMocks(); configureComponents({ reducedMotion: 'user', motionSensitivity: 'full' }); vi.spyOn(document, 'hidden', 'get').mockReturnValue(false); });
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });
it('registers twelve aliases, reconnects once, and keeps option text inert', () => {
  document.body.innerHTML = names.map(n => `<mo-${n}></mo-${n}>`).join('');
  for (const name of names) { const el = host(name), count = el.querySelectorAll('input,button,select,dialog').length; expect(customElements.get('usa-' + name)).toBeDefined(); el.remove(); document.body.append(el); expect(el.querySelectorAll('input,button,select,dialog')).toHaveLength(count); }
  const el = host('select'); el.options = options; expect(el.querySelector('img')).toBeNull(); expect(el.input.options[1].textContent).toBe(options[0].label); expect(el.input.querySelector('optgroup')!.label).toBe('Art');
});
it('native select submits, validates, preserves focus and resets even unchanged reflected state', async () => {
  document.body.innerHTML = '<form><mo-select name="project" required></mo-select></form>'; const el = host('select'), form = document.querySelector('form')!; el.options = options;
  expect(form.checkValidity()).toBe(false); el.input.focus(); el.value = 'c'; expect(document.activeElement).toBe(el.input); expect(new FormData(form).get('project')).toBe('c');
  form.reset(); await tick(); expect(el.value).toBe(''); el.value = 'a'; form.reset(); await tick(); expect(el.value).toBe(''); form.reset(); await tick(); expect(el.input.value).toBe('');
});
it('decimal buttons clamp and reset native numeric fields without replacing focused controls', async () => {
  document.body.innerHTML = '<form><mo-number-stepper name="qty" min="0" max="1" step="0.1" value="0.2"></mo-number-stepper></form>'; const el = host('number-stepper'), input = el.querySelector('input') as HTMLInputElement, form = document.querySelector('form')!;
  input.focus(); el.stepUp(); expect(el.value).toBe(.3); expect(document.activeElement).toBe(input); el.stepUp(100); expect(el.value).toBe(1); expect(el.querySelectorAll('button')[1].disabled).toBe(true);
  form.reset(); await tick(); expect(new FormData(form).get('qty')).toBe('0.2'); form.reset(); await tick(); expect(input.value).toBe('0.2');
  form.addEventListener('reset', e => e.preventDefault(), { once: true }); el.value = .9; form.reset(); await tick(); expect(el.value).toBe(.9);
});
it('combobox uses active descendants, skips disabled choices and cancels uncommitted queries', () => {
  document.body.innerHTML = '<form><mo-combobox name="collection" required></mo-combobox></form>'; const el = host('combobox'); el.options = options; const input = el.querySelector('input:not([type=hidden])') as HTMLInputElement;
  input.focus(); input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })); expect(input.getAttribute('aria-expanded')).toBe('true');
  const descendant = input.getAttribute('aria-activedescendant')!; expect(document.getElementById(descendant)).not.toBeNull(); el.querySelectorAll('[role=option]')[2].click(); expect(el.value).toBe('c'); expect(new FormData(document.querySelector('form')!).get('collection')).toBe('c'); expect(document.activeElement).toBe(input);
  input.value = 'unmatched'; input.dispatchEvent(new Event('input', { bubbles: true })); expect(el.textContent).toContain('No results'); input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); expect(input.value).toBe('Cinema');
  el.value = 'b'; expect(el.value).toBe(''); expect(input.validity.valid).toBe(false);
});
it('multi-select submits repeated values, enforces its cap and leaves focus on the remaining native checkbox', async () => {
  document.body.innerHTML = '<form><mo-multi-select name="topics" max="1"></mo-multi-select></form>'; const el = host('multi-select'); el.options = options; const checks = el.querySelectorAll('input[type=checkbox]'), form = document.querySelector('form')!;
  checks[0].focus(); checks[0].click(); expect(el.values).toEqual(['a']); expect(checks[2].disabled).toBe(true); expect(document.activeElement).toBe(checks[0]); expect(new FormData(form).getAll('topics')).toEqual(['a']);
  el.querySelector('button[data-remove]').click(); expect(el.values).toEqual([]); expect(document.activeElement).toBe(el.querySelector('input[type=search]'));
  el.values = ['a', 'c', 'b', 'a']; expect(el.values).toEqual(['a']); form.reset(); await tick(); expect(el.values).toEqual([]); expect(new FormData(form).getAll('topics')).toEqual([]);
});
it('password reveal preserves selection, emits no credential and hides after reconnect or reset', async () => {
  document.body.innerHTML = '<form><mo-password name="secret"></mo-password></form>'; const el = host('password'), details: unknown[] = []; for (const event of ['input', 'change', 'action']) el.addEventListener('usa:' + event, (e: CustomEvent) => details.push(e.detail));
  el.value = 'private-passphrase'; el.input.focus(); el.input.setSelectionRange(2, 6); el.input.dispatchEvent(new Event('input', { bubbles: true })); el.querySelector('button').click(); expect(el.input.type).toBe('text'); expect(el.input.selectionStart).toBe(2); expect(el.input.selectionEnd).toBe(6); expect(document.activeElement).toBe(el.input); expect(JSON.stringify(details)).not.toContain(el.value); expect(el.hasAttribute('value')).toBe(false);
  const form = document.querySelector('form')!; el.remove(); form.append(el); expect(el.value).toBe('private-passphrase'); expect(el.input.type).toBe('password'); form.reset(); await tick(); expect(el.value).toBe('');
});
it('range endpoints never cross, submit both names and restore both endpoints', async () => {
  document.body.innerHTML = '<form><mo-range-slider name="budget" low="20" high="80" min-gap="10"></mo-range-slider></form>'; const el = host('range-slider'), form = document.querySelector('form')!; el.low = 100; expect(el.low).toBe(70); el.high = -1; expect(el.high).toBe(80); expect(new FormData(form).get('budget-low')).toBe('70');
  form.reset(); await tick(); expect([el.low, el.high]).toEqual([20, 80]); form.reset(); await tick(); expect(new FormData(form).get('budget-low')).toBe('20'); el.setAttribute('min', 'Infinity'); el.setAttribute('max', 'NaN'); expect(Number.isFinite(el.low) && Number.isFinite(el.high)).toBe(true);
});
it('range public values, native sliders and form submission share the same fractional step grid', () => {
  document.body.innerHTML = '<form><mo-range-slider name="size" min="0.1" max="1" step="0.2" low="0.24" high="0.86" min-gap="0.21"></mo-range-slider></form>';
  const el = host('range-slider'), form = document.querySelector('form')!, inputs = el.querySelectorAll('input');
  expect(el.low).toBe(.3); expect(el.high).toBe(.9); expect(inputs[0].valueAsNumber).toBe(el.low); expect(inputs[1].valueAsNumber).toBe(el.high);
  el.low = .8; expect(el.low).toBe(.5); expect(new FormData(form).get('size-low')).toBe('0.5'); expect(el.high - el.low).toBeGreaterThanOrEqual(.21); expect(inputs[0].validity.stepMismatch || inputs[1].validity.stepMismatch).toBe(false);
});
it('consent emits explicit choices without writing storage, and required preferences remain checked after reset', async () => {
  const set = vi.spyOn(Storage.prototype, 'setItem'); document.body.innerHTML = '<form><mo-consent></mo-consent></form>'; const el = host('consent'), event = vi.fn(); el.addEventListener('usa:consent', event); el.preferences = { analytics: true, marketing: true }; el.querySelectorAll('button')[0].click(); expect(event.mock.calls[0][0].detail).toEqual({ analytics: false, marketing: false }); expect(set).not.toHaveBeenCalled(); document.querySelector('form')!.reset(); await tick(); const required = el.querySelector('input'); expect(required.checked && required.disabled).toBe(true);
});
it('validation links focus native controls and omit submitted values from their public event', async () => {
  document.body.innerHTML = '<form><input type="email" required value="private" aria-label="Email"><mo-validation-summary></mo-validation-summary></form>'; const el = host('validation-summary'), event = vi.fn(); el.addEventListener('usa:validate', event); expect(el.validate()).toBe(false); expect(event.mock.calls[0][0].detail).toEqual({ valid: false, count: 1 }); el.querySelector('a').click(); const input = document.querySelector('input')!; expect(document.activeElement).toBe(input); input.value = 'a@example.com'; input.dispatchEvent(new Event('input', { bubbles: true })); expect(el.errors).toEqual([]); el.errors = [{ target: input.id, message: '<script>x</script>' }]; expect(el.querySelector('script')).toBeNull(); document.querySelector('form')!.reset(); await tick(); expect(el.errors).toEqual([]);
});
it('finite drawing overlays preserve content, restore shared positioning and cancel on disposal', async () => {
  const el = document.createElement('button'); el.textContent = 'Submit'; el.style.position = 'static'; document.body.append(el);
  const handles = DRAW_FX.slice(0, 2).map(effect => bindEffect(el, effect.name, { duration: 300, trigger: 'load' })); expect(el.querySelectorAll('svg')).toHaveLength(2); expect(el.textContent).toBe('Submit'); expect(el.style.position).toBe('relative'); handles[0](); expect(el.querySelectorAll('svg')).toHaveLength(1); expect(el.style.position).toBe('relative'); handles[1](); expect(el.querySelector('svg')).toBeNull(); expect(el.style.position).toBe('static'); expect(anims.every(a => a.cancelled)).toBe(true);
  configureComponents({ reducedMotion: 'reduce' }); await playEffect(el, 'focus-brackets'); expect(el.querySelector('svg')).toBeNull();
});

it('textarea preserves caret, inert text, form values and reset while enforcing native constraints', async () => {
  document.body.innerHTML = '<form><mo-textarea name="brief" label="Brief" value="A portrait" maxlength="20" required auto-resize></mo-textarea></form>';
  const el: any = host('textarea'), input = el.input as HTMLTextAreaElement, form = document.querySelector('form')!;
  input.focus(); input.value = 'A new portrait'; input.setSelectionRange(5, 5); input.dispatchEvent(new Event('input', { bubbles: true }));
  expect(input.selectionStart).toBe(5); expect(document.activeElement).toBe(input); expect(new FormData(form).get('brief')).toBe('A new portrait'); expect(el.querySelector('output').textContent).toContain('14 / 20');
  el.value = '<img src=x>'; expect(el.querySelector('img')).toBeNull(); el.value = ''; expect(form.checkValidity()).toBe(false);
  form.reset(); await tick(); expect(input.value).toBe('A portrait'); expect(el.value).toBe('A portrait');
});
it('async search aborts previous providers, ignores late results and emits inert choices', async () => {
  document.body.innerHTML = '<form><mo-search-field name="query" delay="0"></mo-search-field></form>';
  const el: any = host('search-field'), calls: { query: string; signal: AbortSignal; resolve: (value: any) => void }[] = [];
  el.provider = (query: string, { signal }: { signal: AbortSignal }) => new Promise(resolve => calls.push({ query, signal, resolve }));
  el.search('old'); await tick(); el.search('new'); await tick(); expect(calls[0].signal.aborted).toBe(true);
  calls[1].resolve([{ value: 'new', label: '<img src=x>', description: 'New result' }]); await tick(); calls[0].resolve([{ value: 'old', label: 'Stale' }]); await tick();
  expect(el.results.map((row: any) => row.value)).toEqual(['new']); expect(el.querySelector('img')).toBeNull(); const selected = vi.fn(); el.addEventListener('usa:select', selected); el.querySelector('ul button').click(); expect(el.value).toBe('<img src=x>'); expect(selected.mock.calls[0][0].detail.value).toBe('new'); expect(new FormData(document.querySelector('form')!).get('query')).toBe('<img src=x>');
  el.search('disconnect'); await tick(); el.remove(); expect(calls[2].signal.aborted).toBe(true); calls[2].resolve([]); await tick(); expect(el.results).toEqual([]);
});
it('search waits for composition and cancels debounce on disable or form reset', async () => {
  document.body.innerHTML = '<form><mo-search-field delay="0" value="initial"></mo-search-field></form>'; const el: any = host('search-field'), provider = vi.fn(() => []); el.provider = provider;
  const input = el.input as HTMLInputElement; input.dispatchEvent(new CompositionEvent('compositionstart')); input.value = '南'; input.dispatchEvent(new Event('input')); await tick(); expect(provider).not.toHaveBeenCalled(); input.dispatchEvent(new CompositionEvent('compositionend')); await tick(); await tick(); expect(provider).toHaveBeenCalledTimes(1);
  input.value = 'cancel'; input.dispatchEvent(new Event('input')); el.setAttribute('disabled', ''); await tick(); expect(provider).toHaveBeenCalledTimes(1); document.querySelector('form')!.reset(); await tick(); expect(el.value).toBe('initial');
});
it('stepper validates skipped steps, retains FormData and original nodes, completes and restores panels', async () => {
  document.body.innerHTML = '<form><mo-form-stepper><section data-form-step data-step-title="Details"><input name="title" required></section><section data-form-step data-step-title="Review"><textarea name="note">Initial note</textarea></section></mo-form-stepper></form>';
  const el: any = host('form-stepper'), form = document.querySelector('form')!, panels = el.querySelectorAll('section'), input = el.querySelector('input');
  expect(el.count).toBe(2); expect(el.next()).toBe(false); expect(el.step).toBe(0); expect(document.activeElement).toBe(input);
  input.value = 'Portrait'; expect(el.next()).toBe(true); expect(el.step).toBe(1); expect(panels[0].hidden).toBe(true); expect(new FormData(form).get('title')).toBe('Portrait');
  const complete = vi.fn(); el.addEventListener('usa:complete', complete); el.querySelector('.usa-form-step-actions button:last-child').click(); expect(complete.mock.calls[0][0].detail).toEqual({ step: 1, count: 2 }); expect(el.querySelector('input')).toBe(input);
  el.setAttribute('disabled', ''); form.reset(); await tick(); expect(el.step).toBe(0); el.remove(); expect(panels[0].hidden || panels[1].hidden).toBe(false); expect(el.querySelector('.usa-form-step-actions')).toBeNull(); form.append(el); expect(el.querySelectorAll('.usa-form-step-actions')).toHaveLength(1);
});
