import { kindOf, defineElement, shadowStyles, EASE_OUT, FLUENT_DECELERATE, type UsaElement } from '../base';
import shadowCss from './dialog.shadow.css?raw';
import css from './dialog.css?raw';

export type DialogVariant = 'modal' | 'drawer-start' | 'drawer-end' | 'drawer-bottom' | 'sheet';

/**
 * `<usa-dialog>` — an animated modal or drawer built on the native
 * `<dialog>` (top layer, focus trapping, inert page, Esc to close). Its
 * children are slotted into the panel (they stay in the light DOM, so
 * React / Vue / Svelte keep owning them). Style with `::part(panel)`,
 * `::part(backdrop)` and the `--usa-dialog-*` custom properties.
 *
 * Attributes: `open` (reflects; set/remove to open/close), `variant`
 * (`modal` default — Fluent scale + fade; `drawer-start` / `drawer-end`
 * slide from the side, `drawer-bottom` / `sheet` from below), `label`
 * (accessible name), `no-backdrop-close`, `no-esc`. Elements inside
 * with `data-close` close it. Events: `usa:open`, `usa:close` (cancelable
 * `usa:beforeclose`). Reduced motion: fade only.
 */
export interface UsaDialogElement extends UsaElement {
  open: boolean;
  show(): Promise<void>;
  close(returnValue?: string): Promise<void>;
  readonly dialog: HTMLDialogElement | null;
  returnValue: string;
}

const FROM: Record<string, string> = {
  modal: 'scale(0.94)',
  'drawer-start': 'translateX(-100%)',
  'drawer-end': 'translateX(100%)',
  'drawer-bottom': 'translateY(100%)',
  sheet: 'translateY(40px)',
};

export function defineDialog(tag = 'usa-dialog'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaDialog extends Base {
        static get observedAttributes(): string[] {
          return ['open', 'kind', 'variant', 'label'];
        }

        private _dialog: HTMLDialogElement | null = null;
        private _panel: HTMLElement | null = null;
        private _backdrop: HTMLElement | null = null;
        private _busy: Promise<void> | null = null;
        private _syncing = false;
        returnValue = '';

        get dialog(): HTMLDialogElement | null {
          return this._dialog;
        }
        get open(): boolean {
          return this.hasAttribute('open');
        }
        set open(v: boolean) {
          this.toggleAttribute('open', !!v);
        }

        private get variant(): string {
          return kindOf(this, FROM, 'modal');
        }

        changed(name: string): void {
          if (name === 'open') {
            if (this._syncing) return;
            if (this.open) this.show();
            else this.close();
          } else this.syncAttrs();
        }

        private syncAttrs(): void {
          if (!this._dialog) return;
          this._dialog.setAttribute('data-variant', this.variant);
          this._dialog.setAttribute('aria-modal', 'true');
          const label = this.getAttribute('label');
          if (label) this._dialog.setAttribute('aria-label', label);
        }

        mount(): void {
          if (!this._dialog) {
            const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
            root.innerHTML = '<dialog part="dialog"><div part="backdrop" aria-hidden="true"></div><div part="panel"><slot></slot></div></dialog>';
            shadowStyles(root, shadowCss);
            this._dialog = root.querySelector('dialog');
            this._backdrop = root.querySelector('[part=backdrop]');
            this._panel = root.querySelector('[part=panel]');
          }
          this.syncAttrs();
          const dlg = this._dialog!;
          this.listen(dlg, 'cancel', (e: Event) => {
            e.preventDefault();
            if (!this.flag('no-esc')) this.close('cancel');
          });
          this.listen(this._backdrop!, 'click', () => !this.flag('no-backdrop-close') && this.close('backdrop'));
          this.listen(this, 'click', (e: Event) => {
            const t = (e.target as Element).closest?.('[data-close]');
            if (t && this.contains(t)) this.close((t as HTMLElement).getAttribute('data-close') || 'close');
          });
          if (this.open && !dlg.open) this.show();
        }

        unmount(): void {
          if (this._dialog?.open) this._dialog.close();
        }

        private setOpenAttr(on: boolean): void {
          this._syncing = true;
          this.toggleAttribute('open', on);
          this._syncing = false;
        }

        async show(): Promise<void> {
          await this._busy;
          const dlg = this._dialog;
          if (!dlg) {
            this.setOpenAttr(true); // opens on connect
            return;
          }
          if (dlg.open) return;
          this.setOpenAttr(true);
          try {
            if (typeof dlg.showModal === 'function') dlg.showModal();
            else dlg.setAttribute('open', '');
          } catch {
            dlg.setAttribute('open', '');
          }
          this.emit('open');
          if (this.reduced) {
            await this.animate2([{ opacity: 0 }, { opacity: 1 }], [{ opacity: 0 }, { opacity: 1 }], 160, EASE_OUT);
            return;
          }
          await this.animate2(
            [{ opacity: 0, transform: FROM[this.variant] }, { opacity: 1, transform: 'none' }],
            [{ opacity: 0 }, { opacity: 1 }],
            this.variant === 'modal' ? 260 : 360,
            FLUENT_DECELERATE
          );
        }

        async close(returnValue = ''): Promise<void> {
          await this._busy;
          const dlg = this._dialog;
          if (!dlg || !dlg.open) {
            this.setOpenAttr(false);
            return;
          }
          if (!this.emit('beforeclose', { returnValue })) {
            this.setOpenAttr(true);
            return;
          }
          this.returnValue = returnValue;
          this._busy = (async () => {
            const panelTo = this.reduced ? { opacity: 0 } : { opacity: 0, transform: FROM[this.variant] };
            const panelFrom = this.reduced ? { opacity: 1 } : { opacity: 1, transform: 'none' };
            await this.animate2([panelFrom, panelTo], [{ opacity: 1 }, { opacity: 0 }], this.reduced ? 120 : 200, 'cubic-bezier(0.7, 0, 0.84, 0)', 'forwards');
            try {
              if (typeof dlg.close === 'function') dlg.close(returnValue);
              else dlg.removeAttribute('open');
            } catch {
              dlg.removeAttribute('open');
            }
            dlg.removeAttribute('open');
            this._panel?.getAnimations?.().forEach((a) => a.cancel());
            this._backdrop?.getAnimations?.().forEach((a) => a.cancel());
            this.setOpenAttr(false);
            this.emit('close', { returnValue });
          })();
          await this._busy;
          this._busy = null;
        }

        private animate2(panel: Keyframe[], backdrop: Keyframe[], duration: number, easing: string, fill: FillMode = 'none'): Promise<void> {
          const a = this._panel ? this.motion(this._panel, panel, { duration, easing, fill }) : null;
          const b = this._backdrop ? this.motion(this._backdrop, backdrop, { duration, easing: 'linear', fill }) : null;
          return Promise.all([a?.finished, b?.finished].map((p) => p?.catch(() => undefined))).then(() => undefined);
        }
      },
    { id: 'dialog', text: css }
  );
}
