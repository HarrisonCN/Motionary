import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { l as list, c as cleanColor, a as formatNumber } from '../chunks/kit-DugHPVcq.js';
import { b as frameValues, r as raceRanks } from '../chunks/kit-15-gywnm88n.js';
import { c as css } from '../chunks/data-kit-15-BWDqo1L6.js';

const PALETTE = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#14b8a6', '#f97316', '#ec4899', '#84cc16'];
function defineBarRace(tag = 'usa-bar-race') {
    const ctor = defineElement(tag, Base => class BarRace extends Base {
        constructor() {
            super(...arguments);
            this._frame = 0;
        }
        static get observedAttributes() {
            return ['labels', 'frames', 'values', 'colors', 'top', 'interval', 'unit', 'label', 'play-label', 'pause-label', 'frame-label'];
        }
        get frame() { return this._frame; }
        go(index) { this._go?.(index); }
        mount() {
            const labels = list(this.str('labels'), 24);
            const frames = frameValues(this.str('values'), 60, 24);
            const names = this.str('frames').split('|').map((s) => s.trim()).slice(0, 60);
            const colors = list(this.str('colors'), 24).map(cleanColor);
            const top = Math.max(2, Math.min(16, Math.round(this.num('top', 8))));
            const every = Math.max(400, Math.min(10000, this.num('interval', 1600)));
            const unit = this.str('unit');
            const nameOf = (i) => names[i] || String(i + 1);
            const root = make('figure', 'usa-kit usa-race');
            root.toggleAttribute('data-static', this.reduced);
            root.style.setProperty('--rows', String(Math.min(top, labels.length || 1)));
            const caption = make('figcaption', 'usa-race-title', this.str('label', 'Ranking'));
            const stage = make('div', 'usa-race-stage');
            stage.setAttribute('aria-hidden', 'true');
            const big = make('span', 'usa-race-frame');
            const bars = labels.map((l, i) => {
                const row = make('div', 'usa-race-row');
                row.style.setProperty('--c', colors[i] || PALETTE[i % PALETTE.length]);
                const bar = make('span', 'usa-race-bar');
                const name = make('span', 'usa-race-name', l);
                const val = make('span', 'usa-race-val');
                bar.append(name);
                row.append(bar, val);
                stage.append(row);
                return { row, val };
            });
            stage.append(big);
            const sr = make('p', 'usa-kit-sr');
            const controls = make('div', 'usa-race-controls');
            const play = make('button', 'usa-race-play');
            play.type = 'button';
            const slider = make('input', 'usa-race-slider');
            slider.type = 'range';
            slider.min = '0';
            slider.max = String(Math.max(0, frames.length - 1));
            slider.step = '1';
            slider.setAttribute('aria-label', this.str('frame-label', 'Frame'));
            controls.append(play, slider);
            root.append(caption, stage, sr, controls);
            this.append(root);
            const draw = (i) => {
                const vals = frames[i] || [];
                const ranks = raceRanks(labels.map((_, k) => vals[k] ?? 0), top);
                const lead = ranks[0]?.value || 1;
                const place = new Map(ranks.map((r) => [r.index, r]));
                bars.forEach(({ row, val }, k) => {
                    const r = place.get(k);
                    row.toggleAttribute('data-out', !r);
                    row.style.setProperty('--place', String(r ? r.place : top));
                    row.style.setProperty('--w', String(r ? Math.max(0.02, r.value / lead) : 0));
                    val.textContent = formatNumber(vals[k] ?? 0, 1);
                });
                big.textContent = nameOf(i);
                slider.value = String(i);
                slider.setAttribute('aria-valuetext', nameOf(i));
                sr.textContent = `${nameOf(i)}: ${ranks.map((r) => `${r.place + 1}. ${labels[r.index]} ${formatNumber(r.value, 1)}${unit ? ` ${unit}` : ''}`).join(', ')}`;
                return ranks;
            };
            const go = (i) => {
                if (!frames.length)
                    return;
                this._frame = Math.max(0, Math.min(frames.length - 1, Math.round(i) || 0));
                const ranks = draw(this._frame);
                this.emit('frame', { index: this._frame, name: nameOf(this._frame), leader: ranks[0] ? labels[ranks[0].index] : '' });
            };
            this._go = go;
            let timer = 0;
            const playing = (on) => {
                if (timer)
                    clearInterval(timer), (timer = 0);
                play.textContent = on ? '❚❚' : '▶';
                play.setAttribute('aria-label', on ? this.str('pause-label', 'Pause') : this.str('play-label', 'Play'));
                play.setAttribute('aria-pressed', String(on));
                if (!on)
                    return;
                if (this._frame >= frames.length - 1)
                    go(0);
                timer = window.setInterval(() => {
                    if (this._frame >= frames.length - 1) {
                        playing(false);
                        return;
                    }
                    go(this._frame + 1);
                }, every);
            };
            this._frame = Math.min(this._frame, Math.max(0, frames.length - 1));
            draw(this._frame);
            playing(false);
            play.disabled = slider.disabled = frames.length < 2;
            this.listen(play, 'click', () => playing(!timer));
            this.listen(slider, 'input', () => { playing(false); go(Number(slider.value)); });
            let started = false;
            this.inView((vis) => {
                if (!vis || started || this.reduced || frames.length < 2)
                    return;
                started = true;
                playing(true);
            });
            this.onCleanup(() => {
                if (timer)
                    clearInterval(timer);
                timer = 0;
                this._go = undefined;
                root.remove();
            });
        }
    }, { id: 'data-kit-15', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineBarRace };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/bar-race.js.map