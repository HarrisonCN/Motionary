import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { use } from '../src/runtime';
import { registry, RUNTIME_VERSION } from '../src/runtime/registry';
import { defineWidgets } from '../src/components/widgets';
import { installComponentMocks } from './components-setup';
import { MockIO } from './setup';

const view = { render: vi.fn(), resize: vi.fn(), dispose: vi.fn() };
const createInstrument = vi.fn(() => view);

beforeEach(() => {
  installComponentMocks({ reducedMotion: true });
  use({ id: 'spatial-instruments', version: RUNTIME_VERSION, api: { createInstrument } });
  defineWidgets('17.8');
});
afterEach(() => {
  document.body.replaceChildren();
  registry().modules.delete('spatial-instruments');
  vi.clearAllMocks();
});

it.each(['lens-stack', 'iris-diaphragm', 'contour-relief'])('bounds values, renders on visibility and disposes %s on detach', name => {
  const host = document.createElement('mo-' + name) as HTMLElement & { value: number };
  host.setAttribute('value', '400');
  document.body.append(host);
  expect(host.value).toBe(100);
  expect(host.querySelector('input')?.value).toBe('100');
  expect(createInstrument).not.toHaveBeenCalled();
  MockIO.instances.forEach(io => io.fire(host, true));
  expect(createInstrument).toHaveBeenCalledTimes(1);
  host.value = -15;
  expect(host.querySelector('input')?.value).toBe('0');
  host.remove();
  expect(view.dispose).toHaveBeenCalledTimes(1);
  document.body.append(host);
  expect(host.querySelectorAll('input')).toHaveLength(1);
  expect(host.querySelector('input')?.value).toBe('0');
});
