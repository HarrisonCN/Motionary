import { defineElement, type UsaElement } from '../base';
import { describeMotion, motionSnippet, type MotionIntent, type MotionSuggestion } from '../core/intent';
import css from './motion-prompt.css?raw';

/**
 * `<usa-motion-prompt></usa-motion-prompt>` (10.7, AI-assisted motion) — type
 * what you want ("fade the cards up slowly, one after another" / "卡片从下往上
 * 依次淡入") and get a live preview plus ready code: Web Animations, CSS or a
 * Motionary component. Runs `describeMotion()` from
 * `motionary/tooling/ai` — a small deterministic parser (English and
 * Chinese), **no model and no network**; the same parser backs the
 * `suggest_motion` tool of `motionary-mcp`.
 *
 * Attributes: `value` (initial prompt), `format` (waapi · css · component,
 * default waapi), `placeholder`, `label`. The preview respects reduced
 * motion (shows the end state). API: `intent`, `suggest(text)`; events
 * `usa:suggest` ({ intent, source, errors }), `usa:copy` ({ format, code }).
 * 11.6: `suggester` — optional, e.g. `(text) => suggestMotion(text, { provider })` from `motionary/tooling/ai` (docs/ai-provider.md):
 * the local suggestion shows at once and is replaced by the validated answer (kept on any failure). No network unless you set it.
 */
export interface UsaMotionPromptElement extends UsaElement {
  readonly intent: MotionIntent | null;
  /** 11.6: optional async suggester, e.g. `(t) => suggestMotion(t, { provider })` (motionary/tooling/ai). */
  suggester: ((text: string) => Promise<MotionSuggestion>) | null;
  suggest(text: string): MotionIntent;
}

const FORMATS = ['waapi', 'css', 'component'] as const;
type Fmt = (typeof FORMATS)[number];

export function defineMotionPrompt(tag = 'usa-motion-prompt'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaMotionPrompt extends Base {
        static get observedAttributes(): string[] {
          return ['value', 'format', 'placeholder', 'label'];
        }
        private cur: MotionIntent | null = null;
        suggester: ((text: string) => Promise<MotionSuggestion>) | null = null;
        private seq = 0;
        private render: ((i: MotionIntent) => void) | null = null;
        get intent(): MotionIntent | null {
          return this.cur;
        }
        suggest(text: string): MotionIntent {
          const i = describeMotion(text);
          this.cur = i;
          this.render?.(i);
          this.emit('suggest', { intent: i, source: 'local', errors: [] });
          const n = ++this.seq;
          if (this.suggester)
            void Promise.resolve()
              .then(() => this.suggester!(text))
              .then((r) => {
                if (n !== this.seq || !r?.intent) return;
                this.cur = r.intent;
                this.render?.(r.intent);
                this.emit('suggest', { intent: r.intent, source: r.source, errors: r.errors });
              })
              .catch(() => undefined);
          return i;
        }
        mount(): void {
          let fmt: Fmt = (FORMATS as readonly string[]).includes(this.str('format')) ? (this.str('format') as Fmt) : 'waapi';
          const root = document.createElement('div');
          root.className = 'usa-mp';
          const uid = Math.random().toString(36).slice(2, 8);
          root.innerHTML = `<form class="usa-mp-form"><label class="usa-mp-label" for="usa-mp-${uid}"></label><div class="usa-mp-row"><input id="usa-mp-${uid}" class="usa-mp-input" type="text" autocomplete="off" spellcheck="false"><button class="usa-mp-go" type="submit">Suggest</button></div></form><div class="usa-mp-out" aria-live="polite"><div class="usa-mp-stage"><div class="usa-mp-dot"></div><div class="usa-mp-dot"></div><div class="usa-mp-dot"></div></div><p class="usa-mp-summary"></p><div class="usa-mp-tabs" role="tablist"></div><pre class="usa-mp-code"><code></code></pre><button class="usa-mp-copy" type="button">Copy</button></div>`;
          this.querySelector(':scope > .usa-mp')?.remove();
          this.prepend(root);
          this.onCleanup(() => root.remove());
          const $ = <T extends Element>(s: string) => root.querySelector(s) as T;
          const input = $<HTMLInputElement>('.usa-mp-input');
          $<HTMLLabelElement>('.usa-mp-label').textContent = this.str('label', 'Describe the motion');
          input.placeholder = this.str('placeholder', 'e.g. fade the cards up slowly, one after another');
          input.value = this.str('value', 'fade the cards up, one after another');
          const tabs = $<HTMLDivElement>('.usa-mp-tabs');
          const code = $<HTMLElement>('.usa-mp-code code');
          const summary = $<HTMLParagraphElement>('.usa-mp-summary');
          const dots = Array.from(root.querySelectorAll<HTMLElement>('.usa-mp-dot'));
          let anims: Animation[] = [];
          const showCode = () => {
            if (!this.cur) return;
            code.textContent = motionSnippet(this.cur, fmt);
            tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.fmt === fmt)));
          };
          for (const f of FORMATS) {
            const b = document.createElement('button');
            b.type = 'button';
            b.setAttribute('role', 'tab');
            b.dataset.fmt = f;
            b.textContent = f === 'waapi' ? 'WAAPI' : f === 'css' ? 'CSS' : 'Component';
            this.listen(b, 'click', () => {
              fmt = f;
              showCode();
            });
            tabs.append(b);
          }
          this.render = (i) => {
            const pct = Math.round(i.confidence * 100);
            const bits = [i.effect, i.direction, `${i.duration} ms`, i.easingName || 'ease', `on ${i.trigger}`, i.stagger ? `stagger ${i.stagger} ms` : '', i.iterations === Infinity ? 'loops' : ''].filter(Boolean);
            summary.textContent = `${bits.join(' · ')} — ${pct}% understood${i.components[0] ? ` · try <${i.components[0].tag}>` : ''}`;
            showCode();
            anims.forEach((a) => a.cancel());
            anims = [];
            if (this.reduced || typeof dots[0].animate !== 'function' || !i.keyframes.length) return;
            dots.forEach((d, k) => {
              const o: KeyframeAnimationOptions = { ...i.options, delay: (Number(i.options.delay) || 0) + k * (i.stagger || 0), iterations: i.iterations === Infinity ? Infinity : 1, fill: 'both' };
              try {
                anims.push(d.animate(i.keyframes, o));
              } catch {
                /* a keyframe the browser rejects: leave the preview still */
              }
            });
          };
          this.listen($('.usa-mp-form'), 'submit', (e: Event) => {
            e.preventDefault();
            this.suggest(input.value);
          });
          this.listen($('.usa-mp-copy'), 'click', () => {
            const text = code.textContent || '';
            (navigator as any).clipboard?.writeText?.(text)?.catch?.(() => {});
            this.emit('copy', { format: fmt, code: text });
          });
          this.onCleanup(() => anims.forEach((a) => a.cancel()));
          this.suggest(input.value);
        }
      }
      return UsaMotionPrompt as unknown as CustomElementConstructor;
    },
    { id: 'motion-prompt', text: css }
  );
}
