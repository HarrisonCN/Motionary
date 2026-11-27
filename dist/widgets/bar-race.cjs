'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var kit15 = require('../chunks/kit-15-D1Ovwhys.cjs');
var dataKit15 = require('../chunks/data-kit-15-IPVVtUNE.cjs');

const PALETTE = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#14b8a6', '#f97316', '#ec4899', '#84cc16'];
function defineBarRace(tag = 'usa-bar-race') {
    const ctor = base.defineElement(tag, Base => class BarRace extends Base {
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
            const labels = kit.list(this.str('labels'), 24);
            const frames = kit15.frameValues(this.str('values'), 60, 24);
            const names = this.str('frames').split('|').map((s) => s.trim()).slice(0, 60);
            const colors = kit.list(this.str('colors'), 24).map(kit.cleanColor);
            const top = Math.max(2, Math.min(16, Math.round(this.num('top', 8))));
            const every = Math.max(400, Math.min(10000, this.num('interval', 1600)));
            const unit = this.str('unit');
            const nameOf = (i) => names[i] || String(i + 1);
            const root = moments.make('figure', 'usa-kit usa-race');
            root.toggleAttribute('data-static', this.reduced);
            root.style.setProperty('--rows', String(Math.min(top, labels.length || 1)));
            const caption = moments.make('figcaption', 'usa-race-title', this.str('label', 'Ranking'));
            const stage = moments.make('div', 'usa-race-stage');
            stage.setAttribute('aria-hidden', 'true');
            const big = moments.make('span', 'usa-race-frame');
            const bars = labels.map((l, i) => {
                const row = moments.make('div', 'usa-race-row');
                row.style.setProperty('--c', colors[i] || PALETTE[i % PALETTE.length]);
                const bar = moments.make('span', 'usa-race-bar');
                const name = moments.make('span', 'usa-race-name', l);
                const val = moments.make('span', 'usa-race-val');
                bar.append(name);
                row.append(bar, val);
                stage.append(row);
                return { row, val };
            });
            stage.append(big);
            const sr = moments.make('p', 'usa-kit-sr');
            const controls = moments.make('div', 'usa-race-controls');
            const play = moments.make('button', 'usa-race-play');
            play.type = 'button';
            const slider = moments.make('input', 'usa-race-slider');
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
                const ranks = kit15.raceRanks(labels.map((_, k) => vals[k] ?? 0), top);
                const lead = ranks[0]?.value || 1;
                const place = new Map(ranks.map((r) => [r.index, r]));
                bars.forEach(({ row, val }, k) => {
                    const r = place.get(k);
                    row.toggleAttribute('data-out', !r);
                    row.style.setProperty('--place', String(r ? r.place : top));
                    row.style.setProperty('--w', String(r ? Math.max(0.02, r.value / lead) : 0));
                    val.textContent = kit.formatNumber(vals[k] ?? 0, 1);
                });
                big.textContent = nameOf(i);
                slider.value = String(i);
                slider.setAttribute('aria-valuetext', nameOf(i));
                sr.textContent = `${nameOf(i)}: ${ranks.map((r) => `${r.place + 1}. ${labels[r.index]} ${kit.formatNumber(r.value, 1)}${unit ? ` ${unit}` : ''}`).join(', ')}`;
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
    }, { id: 'data-kit-15', text: dataKit15.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineBarRace = defineBarRace;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/bar-race.cjs.map