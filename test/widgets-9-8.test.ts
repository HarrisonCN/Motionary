import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS } from '../src/components/widgets';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { toReactNative, toFlutter, nativeEasing, nativeTokens, entranceFrom } from '../src/components/native';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineWidgets();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  configureComponents({ reducedMotion: 'user' });
});

const ctx = (reduced = false): any => ({ reduced, animate: (el: Element, k: Keyframe[], o: any) => (el as any).animate(k, o), onCleanup() {} });
void ctx; void anims; void tick; void playEffect; void mount;

describe('9.8 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['9.8'])).toEqual(["usa-native-preview"]);
    for (const t of Object.keys(WIDGETS['9.8'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['9.8'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('9.8');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    for (const id of ["native-preview"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-native-preview"]) expect(doc).toContain(s);
  });
});


describe('9.8 native 2.0', () => {
  it('code generators and tokens', () => {
    const rn = toReactNative('enter: fade-up 500ms smooth stagger 80ms; click: pop', { name: 'card-view' });
    expect(rn).toContain('export function CardView(');
    expect(rn).toContain('duration: 500, delay: 0 + index * 80, easing: Easing.bezier(0.22, 1, 0.36, 1), useNativeDriver: true');
    expect(rn).toContain('outputRange: [24, 0]');
    expect(rn).toContain('<Pressable onPressIn={pressIn}');
    expect(rn).toContain('isReduceMotionEnabled');
    expect(toReactNative('enter: fade')).not.toContain('Pressable');
    const fl = toFlutter('enter: scale 300ms ease-out', { name: 'Pop' });
    expect(fl).toContain('class Pop extends StatefulWidget');
    expect(fl).toContain('curve: const Cubic(0, 0, 0.58, 1)');
    expect(fl).toContain('disableAnimations');
    expect(fl).toContain('Transform.scale(scale: 0.85 +');
    expect(nativeEasing('spring', 'flutter')).toBe('Cubic(0.34, 1.56, 0.64, 1)');
    expect(nativeEasing('linear', 'react-native')).toBe('Easing.bezier(0, 0, 1, 1)');
    expect(entranceFrom('nope')).toEqual({ opacity: 0, x: 0, y: 0, scale: 1 });
    const t = nativeTokens();
    expect(t.duration.normal).toBe(300);
    expect(t.easing.standard).toEqual([0.2, 0, 0, 1]);
    expect(t.spring.snappy.stiffness).toBe(300);
  });
  it('<usa-native-preview>: device frame, code tabs, replay staggered', () => {
    configureComponents({ reducedMotion: 'user' });
    const p = mount<any>('<usa-native-preview platform="android" rules="enter: fade-up 400ms stagger 50ms"><div>a</div><div>b</div></usa-native-preview>');
    expect(p.getAttribute('data-platform')).toBe('android');
    expect(p.querySelectorAll('.usa-np-screen > div').length).toBe(2);
    expect(p.querySelector('.usa-np-code code').textContent).toContain("from 'react-native'");
    p.querySelector('[data-p=flutter]').click();
    expect(p.querySelector('.usa-np-code code').textContent).toContain("package:flutter/material.dart");
    expect(p.querySelector('[data-p=flutter]').getAttribute('aria-selected')).toBe('true');
    const ev = vi.fn();
    p.addEventListener('usa:replay', ev);
    const n = anims.length;
    p.querySelector('.usa-np-replay').click();
    expect(ev).toHaveBeenCalledTimes(1);
    expect(anims.length - n).toBe(2);
    expect(p.code('flutter')).toContain('class MotionView');
  });
  it('native samples ship', () => {
    expect(readFileSync('examples/native/react-native/MotionView.tsx', 'utf8')).toContain('export function MotionView(');
    expect(readFileSync('examples/native/flutter/lib/motion_view.dart', 'utf8')).toContain('class MotionView extends StatefulWidget');
  });
});
