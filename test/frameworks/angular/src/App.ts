// Angular 21 (JIT, zoneless, standalone): CUSTOM_ELEMENTS_SCHEMA allows <usa-*>; `[checked]` binds the property.
// 13.5.0 finding: `(usa:change)` does NOT compile in Angular ≥ 17 ("Unexpected global target 'usa'" — a colon in an
// event binding names a global target: window / document / body), so the event is bound with a 10-line directive
// over `bindUsa` (the pattern docs/frameworks-ssr.md now recommends). Server: renderApplication; client: hydration.
import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, Directive, ElementRef, Input, inject, signal } from '@angular/core';
import { bindUsa, usaDetail } from 'motionary/angular';

/** `[usaOn]="{ change: handler }"` — listens to `usa:*` events (keys as in bindUsa: `change` = `usa:change`). */
@Directive({ selector: '[usaOn]', standalone: true })
export class UsaOn {
  private binding = bindUsa(inject(ElementRef).nativeElement);
  @Input({ required: true }) set usaOn(on: Record<string, (e: CustomEvent) => void>) {
    this.binding.update({ on });
  }
  constructor() {
    inject(DestroyRef).onDestroy(() => this.binding.destroy());
  }
}

const fx = (): any => (globalThis as any).__fx;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UsaOn],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<section id="fx">
    <p id="status">{{ checked() ? 'on' : 'off' }}</p>
    @if (show()) {
      <usa-switch id="sw" label="Wifi" [checked]="checked()" [usaOn]="{ change: onChange }"></usa-switch>
    }
  </section>`,
})
export class App {
  checked = signal(false);
  show = signal(true);
  constructor() {
    const f = fx();
    if (f) Object.assign(f, { setChecked: (v: boolean) => this.checked.set(v), show: (v: boolean) => this.show.set(v) });
  }
  onChange = (e: Event): void => {
    const { checked } = usaDetail<{ checked: boolean }>(e);
    fx().log.push('change:' + checked);
    this.checked.set(checked);
  };
}
