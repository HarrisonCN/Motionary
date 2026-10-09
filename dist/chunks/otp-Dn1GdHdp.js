import { f as defineElement } from './base-BTev8qxg.js';

var css = "usa-otp{display:inline-block;max-width:100%;--usa-otp-accent:#6366f1;--usa-otp-size:44px}.usa-otp{display:flex;gap:var(--usa-otp-gap,8px)}.usa-otp-box{box-sizing:border-box;width:var(--usa-otp-size);height:calc(var(--usa-otp-size)*1.18);min-width:0;flex:0 1 auto;padding:0;text-align:center;font:700 calc(var(--usa-otp-size)*.48)/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:inherit;background:var(--usa-otp-bg,rgba(148,163,184,.12));border:2px solid var(--usa-otp-rule,rgba(100,116,139,.35));border-radius:10px;outline:none;caret-color:var(--usa-otp-accent);transition:border-color .2s,box-shadow .2s,background .2s}.usa-otp-box:focus{border-color:var(--usa-otp-accent);box-shadow:0 0 0 4px color-mix(in srgb,var(--usa-otp-accent) 22%,transparent)}.usa-otp-box[data-filled]{border-color:color-mix(in srgb,var(--usa-otp-accent) 60%,transparent)}usa-otp[data-state=error] .usa-otp-box{border-color:#e11d48;background:rgba(225,29,72,.08)}usa-otp[data-state=success] .usa-otp-box{border-color:#16a34a;background:rgba(22,163,74,.1);color:#15803d}@media (prefers-reduced-motion:reduce){.usa-otp-box{transition:none}}";

/** Keep only the characters an OTP accepts (7.7). */
function sanitizeCode(s, mode = 'numeric') {
    return (mode === 'alnum' ? s.replace(/[^0-9a-z]/gi, '').toUpperCase() : s.replace(/\D/g, ''));
}
function defineOtp(tag = 'usa-otp') {
    return defineElement(tag, (Base) => {
        class UsaOtp extends Base {
            static get observedAttributes() {
                return ['length', 'mode', 'label'];
            }
            boxes() {
                return Array.from(this.querySelectorAll('.usa-otp-box'));
            }
            get value() {
                return this.boxes()
                    .map((b) => b.value)
                    .join('');
            }
            get mode() {
                return this.str('mode') === 'alnum' ? 'alnum' : 'numeric';
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const n = Math.max(3, Math.min(10, Math.round(this.num('length', 6))));
                const label = this.str('label', 'Verification code');
                const im = this.mode === 'alnum' ? 'text' : 'numeric';
                let html = `<div class="usa-otp" role="group" aria-label="${label.replace(/"/g, '&quot;')}" data-usa-part>`;
                for (let i = 0; i < n; i++)
                    html += `<input class="usa-otp-box" maxlength="1" inputmode="${im}" aria-label="Digit ${i + 1} of ${n}"${i === 0 ? ' autocomplete="one-time-code"' : ' autocomplete="off"'}>`;
                html += '</div>';
                this.insertAdjacentHTML('beforeend', html);
                const boxes = this.boxes();
                boxes.forEach((b, i) => {
                    this.listen(b, 'input', () => {
                        const v = sanitizeCode(b.value, this.mode);
                        if (v.length > 1)
                            return this.fill(v, i);
                        b.value = v;
                        if (v) {
                            this.pop(b);
                            boxes[i + 1]?.focus();
                        }
                        this.check();
                    });
                    this.listen(b, 'keydown', (e) => {
                        if (e.key === 'Backspace' && !b.value && i > 0) {
                            e.preventDefault();
                            boxes[i - 1].value = '';
                            boxes[i - 1].focus();
                            this.check();
                        }
                        else if (e.key === 'ArrowLeft' && i > 0)
                            boxes[i - 1].focus();
                        else if (e.key === 'ArrowRight' && i < boxes.length - 1)
                            boxes[i + 1].focus();
                    });
                    this.listen(b, 'paste', (e) => {
                        const t = e.clipboardData?.getData('text') || '';
                        if (!t)
                            return;
                        e.preventDefault();
                        this.fill(sanitizeCode(t, this.mode), i);
                    });
                    this.listen(b, 'focus', () => b.select?.());
                });
                const init = sanitizeCode(this.str('value'), this.mode);
                if (init)
                    this.fill(init, 0, false);
            }
            /** Types `code` into the boxes (no focus move), e.g. from an SMS autofill or a demo. */
            fillCode(code) {
                this.boxes().forEach((b) => (b.value = ''));
                this.fill(sanitizeCode(code, this.mode), 0, false);
            }
            fill(code, from = 0, focus = true) {
                const boxes = this.boxes();
                const chars = code.split('');
                let last = from;
                for (let i = from; i < boxes.length && chars.length; i++) {
                    boxes[i].value = chars.shift();
                    this.pop(boxes[i], (i - from) * 40);
                    last = i;
                }
                if (focus)
                    boxes[Math.min(boxes.length - 1, last + 1)]?.focus();
                this.check();
            }
            pop(b, delay = 0) {
                if (!this.reduced)
                    this.motion(b, [{ transform: 'scale(.7)' }, { transform: 'scale(1.12)' }, { transform: 'none' }], { duration: 240, delay, easing: 'ease-out' });
            }
            check() {
                this.removeAttribute('data-state');
                const boxes = this.boxes();
                boxes.forEach((b) => b.toggleAttribute('data-filled', !!b.value));
                if (boxes.every((b) => b.value))
                    this.emit('complete', { code: this.value });
            }
            clear() {
                const boxes = this.boxes();
                boxes.forEach((b) => {
                    b.value = '';
                    b.removeAttribute('data-filled');
                });
            }
            error(message = 'Wrong code') {
                this.setAttribute('data-state', 'error');
                const row = this.querySelector('.usa-otp');
                row?.setAttribute('aria-description', message);
                const done = () => {
                    if (this.getAttribute('data-state') === 'error') {
                        this.clear();
                        this.setAttribute('data-state', 'error');
                    }
                };
                const a = this.reduced || !row ? null : this.motion(row, [{ transform: 'none' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(9px)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(4px)' }, { transform: 'none' }], { duration: 450, easing: 'ease-out' });
                if (a)
                    a.finished.then(done, () => undefined);
                else
                    done();
            }
            success() {
                this.setAttribute('data-state', 'success');
                if (this.reduced)
                    return;
                this.boxes().forEach((b, i) => this.motion(b, [{ transform: 'none' }, { transform: 'translateY(-8px)' }, { transform: 'none' }], { duration: 360, delay: i * 55, easing: 'ease-out' }));
            }
        }
        return UsaOtp;
    }, { id: 'otp', text: css });
}

export { defineOtp as d, sanitizeCode as s };
//# sourceMappingURL=otp-Dn1GdHdp.js.map
