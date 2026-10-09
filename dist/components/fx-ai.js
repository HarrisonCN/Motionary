import { registerEffects } from '../chunks/registry-CnO7ZVPK.js';
import '../chunks/base-CLuqlLfG.js';

/** Split text into words, keeping the whitespace after each (7.8). */
function splitWords(text) {
    return text.match(/\S+\s*|\s+/g) || [];
}
const fade = (el, ctx) => ctx.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 })?.finished.catch(() => undefined);
function textNodes(el) {
    const out = [];
    const walk = (n) => n.childNodes.forEach((c) => (c.nodeType === 3 ? (c.textContent || '').trim() && out.push(c) : c.nodeType === 1 && walk(c)));
    walk(el);
    return out;
}
const AI_FX = [
    {
        name: 'stream-text',
        kind: 'enter',
        description: 'The text appears word by word like a streamed LLM reply, with a blinking caret (`speed` ms per word).',
        defaults: { speed: 45 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const speed = Math.max(5, Number(o.speed) || 45);
            const spans = [];
            const restores = [];
            for (const t of textNodes(el)) {
                const wrap = document.createElement('span');
                wrap.setAttribute('data-usa-stream', '');
                for (const w of splitWords(t.textContent || '')) {
                    const s = document.createElement('span');
                    s.textContent = w;
                    s.style.opacity = '0';
                    wrap.appendChild(s);
                    spans.push(s);
                }
                t.parentNode.replaceChild(wrap, t);
                restores.push(() => wrap.isConnected && wrap.replaceWith(t));
            }
            const caret = document.createElement('span');
            caret.setAttribute('aria-hidden', 'true');
            caret.textContent = '▍';
            Object.assign(caret.style, { opacity: '.7', marginLeft: '1px' });
            el.appendChild(caret);
            const blink = ctx.animate(caret, [{ opacity: 0.8 }, { opacity: 0 }], { duration: 500, iterations: Infinity, direction: 'alternate' });
            let done = false;
            const finish = () => {
                if (done)
                    return;
                done = true;
                blink?.cancel();
                caret.remove();
                restores.forEach((r) => r());
            };
            ctx.onCleanup(finish);
            const runs = spans.map((s, i) => {
                const a = ctx.animate(s, [{ opacity: 0, filter: 'blur(3px)' }, { opacity: 1, filter: 'none' }], { duration: 220, delay: i * speed, fill: 'both', easing: 'ease-out' });
                if (!a)
                    s.style.opacity = '';
                return a?.finished.catch(() => undefined);
            });
            return Promise.all(runs).then(finish);
        },
    },
    {
        name: 'thinking-glow',
        kind: 'loop',
        description: 'A soft colour glow breathes and drifts round the element while a model is "thinking" (`colors`, comma-separated). Stops on cleanup.',
        defaults: { colors: '#6366f1,#ec4899,#22d3ee', duration: 2400 },
        run: (el, o, ctx) => {
            const cs = String(o.colors).split(',').map((c) => c.trim()).filter(Boolean);
            const c = cs.length ? cs : ['#6366f1'];
            const frames = c.map((col, i) => ({ boxShadow: `0 0 ${i % 2 ? 26 : 14}px ${i % 2 ? 4 : 1}px ${col}`, offset: i / c.length }));
            frames.push({ boxShadow: `0 0 14px 1px ${c[0]}`, offset: 1 });
            const a = ctx.animate(el, frames, { duration: o.duration, iterations: Infinity, easing: 'ease-in-out' });
            return () => a?.cancel();
        },
    },
    {
        name: 'voice-wave',
        kind: 'attention',
        description: "The element's children bounce in a wave like voice level bars, or the element pulses when it has none (`cycles`).",
        defaults: { cycles: 2, duration: 700 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const kids = Array.from(el.children);
            const n = Math.max(1, Math.min(6, Number(o.cycles) || 2));
            if (!kids.length)
                return ctx.animate(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: o.duration, iterations: n, easing: 'ease-in-out' })?.finished.catch(() => undefined);
            return Promise.all(kids.map((k, i) => ctx.animate(k, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(1.9)' }, { transform: 'scaleY(.6)' }, { transform: 'scaleY(1)' }], { duration: o.duration, delay: i * (o.duration / (kids.length * 2)), iterations: n, easing: 'ease-in-out' })?.finished.catch(() => undefined))).then(() => undefined);
        },
    },
    {
        name: 'gen-skeleton',
        kind: 'enter',
        description: 'A shimmering skeleton covers the element, then dissolves to reveal the generated content (`hold` ms).',
        defaults: { hold: 900, duration: 500 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return fade(el, ctx);
            if (getComputedStyle(el).position === 'static') {
                const prev = el.style.position;
                el.style.position = 'relative';
                ctx.onCleanup(() => (el.style.position = prev));
            }
            const sk = document.createElement('span');
            sk.setAttribute('aria-hidden', 'true');
            Object.assign(sk.style, { position: 'absolute', inset: '0', borderRadius: 'inherit', pointerEvents: 'none', background: 'linear-gradient(100deg,#e2e8f0 30%,#f8fafc 50%,#e2e8f0 70%)', backgroundSize: '200% 100%', zIndex: '1' });
            el.appendChild(sk);
            const end = () => sk.remove();
            ctx.onCleanup(end);
            const hold = Math.max(0, Number(o.hold) || 0);
            ctx.animate(sk, [{ backgroundPosition: '120% 0' }, { backgroundPosition: '-20% 0' }], { duration: 900, iterations: Math.max(1, Math.ceil(hold / 900)) });
            const a = ctx.animate(sk, [{ opacity: 1 }, { opacity: 0 }], { duration: o.duration, delay: hold, fill: 'both', easing: 'ease-out' });
            return a ? a.finished.then(end, end) : (end(), undefined);
        },
    },
];
/** Register stream-text, thinking-glow, voice-wave and gen-skeleton (7.8). */
function registerAiPack() {
    registerEffects(AI_FX);
}

export { AI_FX, registerAiPack, splitWords };
//# sourceMappingURL=fx-ai.js.map
