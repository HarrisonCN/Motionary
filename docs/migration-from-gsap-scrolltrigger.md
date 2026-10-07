# Migrating from GSAP ScrollTrigger

GSAP + ScrollTrigger is a full animation platform; `use-scroll-animate` covers the common scroll cases — reveal on enter, staggered lists, timelines, scrubbed progress and parallax — in a few kB with no dependencies. If you rely on pinning, `snap`, morphing or arbitrary property tweens, keep GSAP for those parts.

## Reveal on enter

```diff
- gsap.from('.card', { opacity: 0, y: 40, duration: 0.6, scrollTrigger: { trigger: '.card', start: 'top 90%', once: true } });
+ ScrollAnimate.observe('.card', { animation: 'fade-in-up', duration: 600 });
```

| ScrollTrigger | use-scroll-animate |
|---|---|
| `start: 'top 90%'` | `threshold` / `rootMargin` (`'0px 0px -10% 0px'`) or `offset` (px) |
| `once: true` | `once: true` (default) |
| `toggleActions: 'play none none reverse'` | `exit: true` (reverse on leave, replay on enter) |
| `toggleActions: 'restart none none reset'` | `repeat: true` |
| `onEnter`, `onLeave`, `onEnterBack`, `onLeaveBack` | `onEnter`, `onLeave` (both directions) |
| custom `from` vars (`{ opacity: 0, rotate: -10 }`) | `animation: { from: { opacity: 0, transform: 'rotate(-10deg)' }, to: { opacity: 1, transform: 'rotate(0deg)' } }` |
| `ease: 'back.out(1.7)'` | `easing: 'soft-spring'`, `[0.34, 1.56, 0.64, 1]` or `(t) => …` |

## Staggered lists

```diff
- gsap.from('.list li', { opacity: 0, y: 20, stagger: 0.08, scrollTrigger: '.list' });
+ staggerChildren(document.querySelector('.list'), { animation: 'fade-in-up', stagger: 80 });
```

`observeChildren: true` also animates items appended later (infinite lists).

## Timelines

```diff
- const tl = gsap.timeline({ scrollTrigger: '.hero' });
- tl.from('.title', { opacity: 0, y: 40 })
-   .from('.subtitle', { opacity: 0 }, '-=0.2')
-   .from('.cta', { scale: 0.8, opacity: 0 }, 1.2);
+ const tl = timeline()
+   .to('.title', 'fade-up')
+   .to('.subtitle', 'fade', { at: '-=200' })
+   .to('.cta', 'scale', { at: 1200 });
+ tl.scrub(document.querySelector('.hero')); // or tl.play() when it enters
```

`play()` / `reverse()` return Promises; `seek()`, `progress()`, labels and `scrub()` work like GSAP's timeline controls.

## Scrub (progress-linked) animations

```diff
- gsap.to('.bar', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.bar', start: 'top bottom', end: 'bottom top', scrub: true } });
+ ScrollAnimate.observe('.bar', { progressVar: '--p', progressMode: 'scroll' });
+ /* CSS */ .bar { transform: scaleX(var(--p, 0)); }
```

Or let the browser drive a preset natively where scroll-driven animations are supported:

```js
ScrollAnimate.observe('.card', { animation: 'zoom-in', engine: 'auto', viewRange: ['entry 0%', 'cover 50%'] });
```

`progressMode: 'scroll'` matches ScrollTrigger's `start: 'top bottom', end: 'bottom top'`; `onProgress(el, p)` is the equivalent of `onUpdate: self => self.progress`.

## Parallax

```diff
- gsap.to('.bg', { yPercent: 20, ease: 'none', scrollTrigger: { trigger: '.hero', scrub: true } });
+ parallax('.bg', { speed: 0.2 });
```

## Cleanup

| GSAP | use-scroll-animate |
|---|---|
| `ScrollTrigger.refresh()` | `refresh()` |
| `trigger.kill()` / `ScrollTrigger.getAll().forEach(t => t.kill())` | `unobserve(target)` / `destroy()` |
| `gsap.matchMedia()` for reduced motion | built in: `prefers-reduced-motion` shows content without motion |

## Not covered

Pinning (`pin: true`), `snap`, horizontal scroll sections driven by a pinned container, and non-CSS tweening (canvas, SVG morphing, number counters) have no equivalent — combine `onProgress` with your own code, or keep GSAP for those.
