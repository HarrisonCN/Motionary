import { defineElement } from '../base';
import { runtimeModule } from './runtime-link';
import { defineLottiePlayer, type UsaLottiePlayerElement } from './lottie-player';
import type { LottieStateApi, StateMachine, SmState } from '../../runtime/lottie-state';
import css from './lottie-player.css?raw';

/**
 * `<usa-dotlottie src="button.lottie" state-machine="toggle"></usa-dotlottie>`
 * (10.9) — `<usa-lottie-player>` for interactive **dotLottie** files:
 * `theme` (a theme id from the file's `t/` folder; slots are resolved by
 * `motionary/runtime/lottie-state`) and `state-machine` (a state machine
 * id from `s/`, subset: playback states, Event / Numeric / String /
 * Boolean guards, pointer + completion interactions, input / theme / frame
 * actions; OpenUrl is ignored). Requires `use(vector, lottieState)`.
 * Same attributes as `<usa-lottie-player>`; API adds `stateMachine`,
 * `state`, `fire(name)`, `setInput(name, value)`, `setTheme(id)`; events
 * `usa:state` { state, from }, `usa:custom` { name }. Reduced motion: the
 * first frame of each state is shown instead of playing. Its own entry
 * point: `motionary/components/dotlottie`.
 */
export interface UsaDotLottieElement extends UsaLottiePlayerElement {
  readonly stateMachine: StateMachine | null;
  readonly state: string | null;
  fire(name: string): void;
  setInput(name: string, value: unknown): void;
  setTheme(id: string | null): void;
}

export function defineDotLottie(tag = 'usa-dotlottie'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    () => {
      const Player = (customElements.get('usa-lottie-player') || defineLottiePlayer()) as unknown as new () => any;
      class UsaDotLottie extends Player {
        static get observedAttributes(): string[] {
          return [...((Player as any).observedAttributes || []), 'theme', 'state-machine'];
        }
        sm: StateMachine | null = null;
        private themeId: string | null = null;
        get stateMachine(): StateMachine | null {
          return this.sm;
        }
        get state(): string | null {
          return this.sm?.state.name ?? null;
        }
        fire(name: string): void {
          this.sm?.fire(name);
        }
        setInput(name: string, value: unknown): void {
          this.sm?.set(name, value);
        }
        setTheme(id: string | null): void {
          this.themeId = id;
          this.retheme?.();
        }
        private retheme: (() => void) | null = null;
        /** Hook called by <usa-lottie-player> before the player is built. */
        prepareAnimation(animation: any, dl: any, animationId: string | undefined): any {
          const S = runtimeModule<LottieStateApi>(this as unknown as HTMLElement, 'lottie-state');
          if (!S || !dl) return animation;
          if (this.themeId === null) this.themeId = this.str('theme') || null;
          const theme = this.themeId ? dl.themes?.[this.themeId] : null;
          if (this.themeId && !theme) this.emit('error', { error: `no theme "${this.themeId}" (have: ${Object.keys(dl.themes || {}).join(', ') || 'none'})` });
          return S.applyTheme(animation, theme as any, animationId);
        }
        /** Hook called after the player exists. */
        playerReady(ctx: { player: any; animation: any; dotLottie: any; canvas: HTMLCanvasElement; rebuild: (a: any) => any; source: any; animationId?: string }): boolean {
          const S = runtimeModule<LottieStateApi>(this as unknown as HTMLElement, 'lottie-state');
          const dl = ctx.dotLottie;
          if (!S || !dl) return false;
          this.retheme = () => {
            const theme = this.themeId ? dl.themes?.[this.themeId] : null;
            ctx.player = ctx.rebuild(S.applyTheme(ctx.source, theme as any, ctx.animationId));
            if (this.sm) apply(this.sm.state, null);
          };
          const id = this.str('state-machine');
          if (!id) return false;
          const def: any = dl.stateMachines?.[id];
          if (!def) {
            this.emit('error', { error: `no state machine "${id}" (have: ${Object.keys(dl.stateMachines || {}).join(', ') || 'none'})` });
            return false;
          }
          const skipped = S.inspectStateMachine(def);
          if (skipped.length) this.dataset.smSkipped = skipped.join(', ');
          const apply = (st: SmState, from: SmState | null) => {
            const p = ctx.player;
            p.setSegment(st.segment || null);
            p.timeScale = Math.abs(st.speed ?? 1) || 1;
            p.repeat = st.loop ? -1 : 0;
            p.yoyo = /bounce/i.test(st.mode || '');
            if (this.reduced || st.autoplay === false) {
              p.pause();
              p.seek(0);
            } else {
              p.restart();
              if (/^reverse/i.test(st.mode || '')) p.reverse();
            }
            this.emit('state', { state: st.name, from: from?.name ?? null });
          };
          this.sm = S.createStateMachine(def, {
            onState: (st, from) => apply(st, from),
            onTheme: (t) => this.setTheme(t),
            onFrame: (f) => ctx.player.goToFrame(f),
            onProgress: (v) => (ctx.player.progress = v),
            onCustomEvent: (name) => this.emit('custom', { name }),
          });
          const map: [string, string][] = [['pointerdown', 'PointerDown'], ['pointerup', 'PointerUp'], ['pointerenter', 'PointerEnter'], ['pointerleave', 'PointerExit'], ['click', 'Click']];
          for (const [ev, type] of map) this.listen(ctx.canvas, ev, () => this.sm?.interact(type));
          ctx.canvas.tabIndex = 0;
          this.listen(ctx.canvas, 'keydown', (e: KeyboardEvent) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            this.sm?.interact('PointerDown');
            this.sm?.interact('Click');
          });
          this.onCleanup(() => {
            this.sm = null;
            this.retheme = null;
          });
          return true; // the state machine drives playback
        }
        completed(): void {
          this.sm?.interact('OnComplete');
        }
      }
      return UsaDotLottie as unknown as CustomElementConstructor;
    },
    { id: 'lottie-player', text: css }
  );
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-dotlottie': UsaDotLottieElement;
  }
}
