import { beforeAll, beforeEach, afterEach, expect, it, vi } from 'vitest';
import { defineWidgets } from '../src/components/widgets';
import { configureComponents } from '../src/components/base';
import { DRAW_FX, registerDrawPack } from '../src/components/fx2/draw';
import { bindEffect, playEffect } from '../src/components/fx/registry';
import { installComponentMocks, tick, anims } from './components-setup';
const names = ['select', 'combobox', 'multi-select', 'number-stepper', 'password', 'range-slider', 'consent', 'cta-popup', 'validation-summary'];
const options = [{ value: 'a', label: '<img src=x onerror=1>' }, { value: 'b', label: 'Blocked', disabled: true }, { value: 'c', label: 'Cinema', group: 'Art' }];
const host = (name: string): any => document.querySelector('mo-' + name)!;
beforeAll(() => { defineWidgets('17.7'); registerDrawPack(); });
beforeEach(() => { installComponentMocks(); configureComponents({ reducedMotion: 'user', motionSensitivity: 'full' }); vi.spyOn(document, 'hidden', 'get').mockReturnValue(false); });
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });
it('registers nine aliases, reconnects once, and keeps option text inert', () => {
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
  form.reset(); await tick(); expect([el.low, el.high]).toEqual([20, 80]); form.reset(); await tick(); expect(new FormData(form).get('budget-low')).toBe('20'); el.update({ min: 'Infinity', max: 'NaN' }); expect(Number.isFinite(el.low) && Number.isFinite(el.high)).toBe(true);
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
  configureComponents({ reducedMotion: 'always' }); await playEffect(el, 'focus-brackets'); expect(el.querySelector('svg')).toBeNull();
});
