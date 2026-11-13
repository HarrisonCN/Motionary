'use strict';

const finite = (n, fallback, min = -Infinity, max = Infinity) => {
    const v = typeof n === 'number' ? n : Number(n);
    return Math.max(min, Math.min(max, Number.isFinite(v) ? v : fallback));
};
function randomSeed(seed) {
    let s = seed >>> 0;
    return () => { s += 0x6D2B79F5; let v = s; v = Math.imul(v ^ v >>> 15, v | 1); v ^= v + Math.imul(v ^ v >>> 7, v | 61); return ((v ^ v >>> 14) >>> 0) / 4294967296; };
}
/** Unit-step displacement for an actual damped mass/spring system. */
function springResponse(t, stiffness = 180, damping = 12, mass = 1) {
    t = finite(t, 0, 0, 60);
    stiffness = finite(stiffness, 180, 1, 800);
    damping = finite(damping, 12, 0, 100);
    mass = finite(mass, 1, .1, 5);
    const w = Math.sqrt(stiffness / mass), z = damping / (2 * Math.sqrt(stiffness * mass));
    if (Math.abs(z - 1) < .0001)
        return 1 - Math.exp(-w * t) * (1 + w * t);
    if (z < 1) {
        const d = w * Math.sqrt(1 - z * z);
        return 1 - Math.exp(-z * w * t) * (Math.cos(d * t) + z * w / d * Math.sin(d * t));
    }
    const d = Math.sqrt(z * z - 1), a = -w * (z - d), b = -w * (z + d);
    return 1 + (b * Math.exp(a * t) - a * Math.exp(b * t)) / (a - b);
}
/** CSS cubic-bezier: invert x first; its parameter is not elapsed time. */
function cubicResponse(x, x1, y1, x2, y2) {
    x = finite(x, 0, 0, 1);
    x1 = finite(x1, .32, 0, 1);
    x2 = finite(x2, 0, 0, 1);
    y1 = finite(y1, .72, -2, 3);
    y2 = finite(y2, 1, -2, 3);
    const f = (t, a, b) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
    let lo = 0, hi = 1;
    for (let i = 0; i < 30; i++) {
        const t = (lo + hi) / 2;
        if (f(t, x1, x2) < x)
            lo = t;
        else
            hi = t;
    }
    return f((lo + hi) / 2, y1, y2);
}
/** Gray–Scott chemistry on a wrapping grid; double buffers prevent directional bias. */
function reactionGrid(width = 80, height = 52, seed = 1) {
    const n = width * height, rnd = randomSeed(seed);
    let a = new Float32Array(n).fill(1), b = new Float32Array(n), aa = new Float32Array(n), bb = new Float32Array(n);
    for (let k = 0; k < 26; k++) {
        const x = Math.floor(rnd() * width), y = Math.floor(rnd() * height);
        for (let yy = -2; yy <= 2; yy++)
            for (let xx = -2; xx <= 2; xx++)
                b[((y + yy + height) % height) * width + (x + xx + width) % width] = .7;
    }
    return {
        get values() { return b; },
        paint(x, y, erase = false) {
            const cx = Math.round(finite(x, .5, 0, 1) * (width - 1)), cy = Math.round(finite(y, .5, 0, 1) * (height - 1));
            for (let dy = -3; dy <= 3; dy++)
                for (let dx = -3; dx <= 3; dx++) {
                    const i = ((cy + dy + height) % height) * width + (cx + dx + width) % width;
                    b[i] = erase ? 0 : .9;
                    a[i] = erase ? 1 : .2;
                }
        },
        step(feed = .037, kill = .06) {
            feed = finite(feed, .037, .01, .09);
            kill = finite(kill, .06, .02, .09);
            for (let y = 0; y < height; y++)
                for (let x = 0; x < width; x++) {
                    const i = y * width + x, l = y * width + (x + width - 1) % width, r = y * width + (x + 1) % width;
                    const u = (y + height - 1) % height * width, d = (y + 1) % height * width;
                    const lap = (v) => -v[i] + .2 * (v[l] + v[r] + v[u + x] + v[d + x]) + .05 * (v[u + (x + width - 1) % width] + v[u + (x + 1) % width] + v[d + (x + width - 1) % width] + v[d + (x + 1) % width]);
                    const ab = a[i] * b[i] * b[i];
                    aa[i] = Math.max(0, Math.min(1, a[i] + lap(a) - ab + feed * (1 - a[i])));
                    bb[i] = Math.max(0, Math.min(1, b[i] + .5 * lap(b) + ab - (feed + kill) * b[i]));
                }
            [a, aa] = [aa, a];
            [b, bb] = [bb, b];
        },
    };
}
function createMatterEngine(kind, options = {}) {
    const rnd = randomSeed(finite(options.seed, 1)), count = Math.round(finite(options.count, 900, 32, 3000));
    const color = options.color || '#e7e8df', accent = options.accent || '#74aaff';
    const particles = Array.from({ length: count }, (_, i) => ({ r: .06 + Math.sqrt(rnd()) * .4, a: rnd() * Math.PI * 2, v: rnd(), x: .32 + (i % 2) * .36 + (rnd() - .5) * .1, y: .5 + (rnd() - .5) * .45 }));
    const grid = kind === 'reaction' ? reactionGrid(80, 52, finite(options.seed, 1)) : null;
    if (grid)
        for (let i = 0; i < 160; i++)
            grid.step(options.feed, options.kill);
    const mesh = Array.from({ length: 18 * 12 }, (_, i) => ({ x: (i % 18) / 17, y: Math.floor(i / 18) / 11, dx: 0, dy: 0, vx: 0, vy: 0 }));
    let mask, maskW = 0, maskH = 0, maskTop = 0, maskBottom = 340, fluidTilt = 0, fluidVelocity = 0;
    const dot = (c, x, y, r) => { c.beginPath(); c.arc(x, y, Math.max(.15, r), 0, Math.PI * 2); c.fill(); };
    return { draw(ctx, width, height, time, dt, p) {
            const w = 560, h = 340, px = finite(p.x, .5, 0, 1) * w, py = finite(p.y, .5, 0, 1) * h;
            dt = finite(dt, 0, 0, .04);
            time = finite(time, 0, 0, 1e8);
            ctx.save();
            ctx.clearRect(0, 0, width, height);
            ctx.scale(width / w, height / h);
            ctx.fillStyle = color;
            if (kind === 'gravity') {
                const strength = finite(options.strength, 1, .1, 3);
                for (const q of particles) {
                    q.a += dt * (.3 + .07 / q.r) * strength;
                    const spiral = q.a + Math.sin(q.r * 24 + time * .13) * .34;
                    let x = w / 2 + Math.cos(spiral) * q.r * h * 1.23, y = h / 2 + Math.sin(spiral) * q.r * h;
                    if (p.active) {
                        const d = Math.hypot(px - x, py - y), force = Math.exp(-d / 130) * (p.pressed ? .8 : .28);
                        x += (px - x) * force;
                        y += (py - y) * force;
                    }
                    ctx.globalAlpha = .2 + q.v * .72;
                    dot(ctx, x, y, .35 + q.v * 1.05);
                }
                ctx.globalAlpha = .8;
                ctx.strokeStyle = accent;
                ctx.lineWidth = .65;
                ctx.beginPath();
                ctx.arc(p.active ? px : w / 2, p.active ? py : h / 2, p.pressed ? 15 : 7, 0, Math.PI * 2);
                ctx.stroke();
            }
            else if (kind === 'metal') {
                const pull = p.active ? .2 * finite(options.strength, 1, .1, 3) : 0, cx = w / 2 + (px - w / 2) * pull, cy = h / 2 + (py - h / 2) * pull;
                const blobs = Array.from({ length: 5 }, (_, i) => ({ x: cx + Math.cos(time * .4 + i * 1.9) * (40 + i * 6), y: cy + Math.sin(time * .51 + i * 2) * 38, r: 33 + i * 3 }));
                if (p.pressed)
                    blobs.push({ x: px, y: py, r: 30 });
                for (let y = 22; y < h - 20; y += 4)
                    for (let x = 32; x < w - 30; x += 4) {
                        let value = 0;
                        for (const b of blobs)
                            value += b.r ** 2 / Math.max(4, (x - b.x) ** 2 + (y - b.y) ** 2);
                        if (value < 1)
                            continue;
                        const light = .45 + .55 * Math.sin((x + y) * .026 + time * .1) ** 2;
                        ctx.globalAlpha = light;
                        dot(ctx, x, y, Math.min(1.65, .5 + (value - 1) * .6));
                    }
            }
            else if (kind === 'reaction' && grid) {
                if (p.active && p.pressed)
                    grid.paint(p.x, p.y, options.mode === 'contour');
                if (dt)
                    for (let i = 0; i < 4; i++)
                        grid.step(options.feed, options.kill);
                const values = grid.values, dx = 6, dy = 5.4, ox = 40, oy = 30;
                const inside = (x, y) => options.shape === 'disc' ? ((x - 40) * dx / 130) ** 2 + ((y - 26) * dy / 130) ** 2 < 1 : options.shape === 'pill' ? ((x - 40) / 35) ** 4 + ((y - 26) / 16) ** 4 < 1 : ((x - 40) * dx / 130) ** 8 + ((y - 26) * dy / 130) ** 8 < 1;
                if (options.mode === 'contour') {
                    ctx.strokeStyle = color;
                    ctx.lineWidth = .7;
                    ctx.globalAlpha = .7;
                    for (const level of [.12, .23, .34]) {
                        ctx.beginPath();
                        for (let y = 0; y < 51; y++)
                            for (let x = 0; x < 79; x++) {
                                if (!inside(x, y))
                                    continue;
                                const v = [values[y * 80 + x], values[y * 80 + x + 1], values[(y + 1) * 80 + x + 1], values[(y + 1) * 80 + x]], xy = [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]], hits = [];
                                for (let k = 0; k < 4; k++) {
                                    const j = (k + 1) % 4;
                                    if ((v[k] < level) !== (v[j] < level)) {
                                        const a = (level - v[k]) / (v[j] - v[k]);
                                        hits.push([ox + (xy[k][0] + (xy[j][0] - xy[k][0]) * a) * dx, oy + (xy[k][1] + (xy[j][1] - xy[k][1]) * a) * dy]);
                                    }
                                }
                                for (let i = 0; i + 1 < hits.length; i += 2) {
                                    ctx.moveTo(hits[i][0], hits[i][1]);
                                    ctx.lineTo(hits[i + 1][0], hits[i + 1][1]);
                                }
                            }
                        ctx.stroke();
                    }
                }
                else
                    for (let y = 0; y < 52; y++)
                        for (let x = 0; x < 80; x++)
                            if (inside(x, y)) {
                                const v = values[y * 80 + x];
                                ctx.globalAlpha = Math.min(1, v * 2.5);
                                dot(ctx, ox + x * dx, oy + y * dy, .25 + Math.min(1.7, v * 4));
                            }
            }
            else if (kind === 'ink') {
                particles.forEach((q, i) => {
                    const x = q.x, y = q.y, dist = Math.hypot(q.x * w - px, q.y * h - py) + 20;
                    const force = p.active ? Math.exp(-dist / 130) * (p.pressed ? 2 : 1) * finite(options.strength, 1, .1, 3) : 0;
                    if (dt) {
                        q.x += dt * (.018 * Math.sin(y * 13 + time * .2) - (py / h - y) * force);
                        q.y += dt * (.025 * Math.cos(x * 9 - time * .2) + (px / w - x) * force);
                        q.x = (q.x + 1) % 1;
                        q.y = (q.y + 1) % 1;
                    }
                    ctx.strokeStyle = i % 2 ? accent : color;
                    ctx.globalAlpha = .2 + q.v * .6;
                    ctx.lineWidth = .5;
                    ctx.beginPath();
                    ctx.moveTo(x * w, y * h);
                    ctx.lineTo(q.x * w + 2 * Math.cos(q.a + time), q.y * h + 2 * Math.sin(q.a + time));
                    ctx.stroke();
                });
            }
            else if (kind === 'fluid') {
                if (!mask || maskW !== w || maskH !== h) {
                    const doc = ctx.canvas.ownerDocument;
                    const c = doc?.createElement('canvas');
                    if (c) {
                        c.width = w;
                        c.height = h;
                        const m = c.getContext('2d');
                        if (m) {
                            let size = 175;
                            const text = (options.text || 'flow').slice(0, 32);
                            m.font = `650 ${size}px system-ui,sans-serif`;
                            size *= Math.min(1, w * .88 / Math.max(1, m.measureText(text).width));
                            m.font = `650 ${size}px system-ui,sans-serif`;
                            m.textAlign = 'center';
                            m.textBaseline = 'middle';
                            m.fillText(text, w / 2, h / 2);
                            mask = m.getImageData(0, 0, w, h)?.data;
                            maskW = w;
                            maskH = h;
                            if (mask?.length) {
                                let first = h, last = 0;
                                for (let y = 0; y < h; y++)
                                    for (let x = 0; x < w; x++)
                                        if (mask[(y * w + x) * 4 + 3] >= 80) {
                                            first = Math.min(first, y);
                                            last = y + 1;
                                            break;
                                        }
                                if (last > first) {
                                    maskTop = first;
                                    maskBottom = last;
                                }
                            }
                        }
                    }
                }
                const fill = finite(options.fill, .5, .05, .95), target = p.active ? (finite(p.x, .5, 0, 1) - .5) * .4 : 0;
                if (p.instant) {
                    fluidTilt = target;
                    fluidVelocity = 0;
                }
                else if (dt) {
                    fluidVelocity += ((target - fluidTilt) * 40 - fluidVelocity * 3.2) * dt;
                    fluidTilt += fluidVelocity * dt;
                }
                const tilt = fluidTilt;
                if (mask?.length)
                    for (let y = 20; y < h - 20; y += 3)
                        for (let x = 18; x < w - 18; x += 3) {
                            if (mask[(y * w + x) * 4 + 3] < 80)
                                continue;
                            const surface = maskBottom - (maskBottom - maskTop) * fill + (x - w / 2) * tilt + Math.sin(x * .035 + time * 2) * 3;
                            const wet = y > surface;
                            ctx.fillStyle = Math.abs(y - surface) < 4 ? accent : color;
                            ctx.globalAlpha = wet ? .9 : .16;
                            dot(ctx, x, y, wet ? .95 : .5);
                        }
                else {
                    ctx.globalAlpha = .9;
                    ctx.font = '650 100px system-ui';
                    ctx.textAlign = 'center';
                    ctx.fillText(options.text || 'flow', w / 2, h / 2);
                }
            }
            else if (kind === 'magnetic') {
                const tx = p.active ? px : w * .55, ty = p.active ? py : h * .5;
                for (let y = 30; y < h - 20; y += 15)
                    for (let x = 28; x < w - 20; x += 15) {
                        const rx = x - tx, ry = y - ty, r2 = Math.max(240, rx * rx + ry * ry), a = Math.atan2(3 * rx * ry / r2, 3 * rx * rx / r2 - 1);
                        const len = (p.pressed ? 6.8 : 5.2) * finite(options.strength, 1, .3, 1.5);
                        ctx.strokeStyle = r2 < 5500 ? accent : color;
                        ctx.globalAlpha = .24 + .6 * Math.exp(-r2 / 70000);
                        ctx.lineWidth = .8;
                        ctx.beginPath();
                        ctx.moveTo(x - Math.cos(a) * len, y - Math.sin(a) * len);
                        ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
                        ctx.stroke();
                    }
            }
            else if (kind === 'mesh') {
                for (const q of mesh) {
                    const x = 50 + q.x * 460, y = 35 + q.y * 270, d = Math.hypot(x - px, y - py), f = p.active ? Math.exp(-d * d / 18000) * (p.pressed ? .8 : .23) * finite(options.strength, 1, .1, 2) : 0;
                    const tx = (px - x) * f, ty = (py - y) * f;
                    if (dt) {
                        q.vx = (q.vx + (tx - q.dx) * dt * 80) * Math.exp(-dt * 13);
                        q.vy = (q.vy + (ty - q.dy) * dt * 80) * Math.exp(-dt * 13);
                        q.dx += q.vx * dt;
                        q.dy += q.vy * dt;
                    }
                    else if (p.instant) {
                        q.dx = tx;
                        q.dy = ty;
                    }
                }
                ctx.globalAlpha = .5;
                ctx.strokeStyle = color;
                ctx.lineWidth = .65;
                ctx.beginPath();
                mesh.forEach((q, i) => { const x = 50 + q.x * 460 + q.dx, y = 35 + q.y * 270 + q.dy; for (const n of [i % 18 < 17 ? mesh[i + 1] : null, i < 18 * 11 ? mesh[i + 18] : null])
                    if (n) {
                        ctx.moveTo(x, y);
                        ctx.lineTo(50 + n.x * 460 + n.dx, 35 + n.y * 270 + n.dy);
                    } });
                ctx.stroke();
                ctx.fillStyle = accent;
                ctx.globalAlpha = .8;
                mesh.forEach(q => dot(ctx, 50 + q.x * 460 + q.dx, 35 + q.y * 270 + q.dy, 1));
            }
            ctx.restore();
        } };
}

exports.createMatterEngine = createMatterEngine;
exports.cubicResponse = cubicResponse;
exports.finite = finite;
exports.springResponse = springResponse;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/chunks/engine-D89D-YmJ.cjs.map