import { afterEach, expect, it, vi } from 'vitest';
import { offscreenRender } from '../src/components/fx2/perf3';

afterEach(() => vi.unstubAllGlobals());

it('retains canvas ownership until the worker is ready and draws a still frame on startup rejection', () => {
  const canvas = document.createElement('canvas');
  canvas.transferControlToOffscreen = vi.fn();
  canvas.getContext = vi.fn().mockReturnValue({});
  const revoke = vi.fn();
  vi.stubGlobal('URL', { createObjectURL: () => 'blob:fixture', revokeObjectURL: revoke });
  let worker: Worker;
  const terminate = vi.fn();
  vi.stubGlobal('Worker', class {
    terminate = terminate;
    constructor() { worker = this as unknown as Worker; }
  });
  const draw = vi.fn();
  const renderer = offscreenRender(canvas, draw, { paused: true });
  expect(revoke).not.toHaveBeenCalled();
  renderer.resize(40, 60);
  worker!.onerror!(new ErrorEvent('error'));
  expect(renderer.backend).toBe('main');
  expect(canvas.transferControlToOffscreen).not.toHaveBeenCalled();
  expect(terminate).toHaveBeenCalledOnce();
  expect(revoke).toHaveBeenCalledOnce();
  expect(draw).toHaveBeenCalledWith(expect.anything(), 0, 40, 60, {});
  renderer.stop();
});
