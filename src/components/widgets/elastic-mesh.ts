import { defineElement } from '../base';
import { defineMoName } from './mo-name';
import { matterClass, type UsaMatterElement } from './matter-common';
import type { MatterData } from './matter-common';
import css from './matter.css?raw';

/** `<mo-elastic-mesh>` — an original interactive mesh study (17.6), with keyboard controls and motion-safe cleanup. */
export interface UsaElasticMeshElement extends UsaMatterElement {
  update(data: MatterData): void;
  reset(): void;
  play(): void;
  pause(): void;
  activate(): void;
  deactivate(): void;
}
export function defineElasticMesh(tag = 'usa-elastic-mesh'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class ElasticMesh extends matterClass(Base, 'mesh') {
      static get observedAttributes(): string[] { return ['label', 'disabled', 'animated', 'paused', 'color', 'accent', 'strength']; }
      notify(type: 'action' | 'change', detail: Record<string, unknown>): void {
        if (type === 'action') this.emit('action', detail); else this.emit('change', detail);
      }
    }
    return ElasticMesh;
  }, { id: 'matter', text: css });
  defineMoName(tag, ctor); return ctor;
}
