import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { MOTION_TOKENS, motionTokensToCss, motionTokensToVars, motionTokensToJSON, importMotionTokens, applyMotionTokens, motionToken, motionVar, parseDuration, parseEasing, mergeMotionTokens } from '../src/components/tokens';
import { timeline } from '../src/components/timeline';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';

let undo: (() => void) | null = null;
afterEach(() => (undo?.(), (undo = null)));

describe('motion design tokens (4.2)', () => {
  it('exports CSS variables and a stylesheet', () => {
    const v = motionTokensToVars(MOTION_TOKENS);
    expect(v['--usa-duration-fast']).toBe('150ms');
    expect(v['--usa-easing-emphasized']).toBe('cubic-bezier(0.22, 1, 0.36, 1)');
    expect(v['--usa-spring-bouncy-damping']).toBe('12');
    expect(motionTokensToCss(MOTION_TOKENS, ':root')).toMatch(/^:root \{\n  --usa-duration-instant: 0ms;/);
  });

  it('round-trips through W3C DTCG JSON', () => {
    const json = motionTokensToJSON(MOTION_TOKENS) as any;
    expect(json.motion.duration.slow).toEqual({ $type: 'duration', $value: '600ms' });
    expect(json.motion.easing.standard).toEqual({ $type: 'cubicBezier', $value: [0.2, 0, 0, 1] });
    expect(importMotionTokens(json)).toEqual(MOTION_TOKENS);
  });

  it('imports Figma Tokens (Tokens Studio) and Style Dictionary shapes', () => {
    const figma = { global: { animation: { duration: { quick: { value: '0.12s', type: 'other' } }, easing: { out: { value: '0.16, 1, 0.3, 1', type: 'other' } } } } };
    const t = importMotionTokens(figma);
    expect(t.duration.quick).toBe(120);
    expect(t.easing.out).toBe('cubic-bezier(0.16, 1, 0.3, 1)');
    expect(t.duration.fast).toBe(150); // defaults kept
    const sd = { motion: { spring: { soft: { value: { stiffness: 90, damping: 20 } } }, transition: { enter: { $type: 'transition', $value: { duration: '250ms', timingFunction: [0, 0, 0.2, 1] } } } } };
    const s = importMotionTokens(sd);
    expect(s.spring.soft).toEqual({ stiffness: 90, damping: 20, mass: 1 });
    expect(s.duration.enter).toBe(250);
    expect(s.easing.enter).toBe('cubic-bezier(0, 0, 0.2, 1)');
  });

  it('parses durations and easings', () => {
    expect(parseDuration('0.3s')).toBe(300);
    expect(parseDuration(200)).toBe(200);
    expect(parseDuration({ value: 2, unit: 's' })).toBe(2000);
    expect(parseDuration('fast')).toBeUndefined();
    expect(parseEasing([0.4, 0, 0.2, 1])).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
    expect(parseEasing('ease-in')).toBe('ease-in');
  });

  it('applyMotionTokens writes vars, sets the active scale, and undoes', () => {
    undo = applyMotionTokens({ duration: { fast: 90 } });
    expect(document.documentElement.style.getPropertyValue('--usa-duration-fast')).toBe('90ms');
    expect(motionToken('duration', 'fast')).toBe(90);
    expect(motionVar('duration', 'fast')).toBe('var(--usa-duration-fast, 90ms)');
    expect(motionVar('spring', 'bouncy', 'mass')).toBe('var(--usa-spring-bouncy-mass, 1)');
    undo();
    undo = null;
    expect(document.documentElement.style.getPropertyValue('--usa-duration-fast')).toBe('');
    expect(motionToken('duration', 'fast')).toBe(150);
  });

  it('timeline() accepts token names for duration and easing', () => {
    const el = document.createElement('i');
    const tl = timeline({ defaults: { duration: 'slow', easing: 'spring' } }).to(el, 'fade').to(el, 'fade', { duration: 'fast' });
    expect(tl.duration).toBe(600 + 150);
    expect(mergeMotionTokens({ easing: { x: 'linear' } }).easing.x).toBe('linear');
  });

  it('ships as motionary/components/tokens with generated docs files', () => {
    expect(COMPONENT_ENTRIES.tokens).toBe('tokens/index');
    const json = JSON.parse(readFileSync(`${process.cwd()}/docs/motion.tokens.json`, 'utf8'));
    expect(json).toEqual(motionTokensToJSON(MOTION_TOKENS));
    expect(readFileSync(`${process.cwd()}/docs/motion-tokens.css`, 'utf8')).toContain(motionTokensToCss(MOTION_TOKENS));
  });
});
