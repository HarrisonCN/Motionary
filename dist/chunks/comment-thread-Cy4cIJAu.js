import { f as defineElement } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { m as make } from './moments-Cg_NlOYG.js';
import { c as css } from './ui-kit-13-brWzveAE.js';

/** "3 replies" style text: `{n}` in `label` is replaced by the count; a separate singular form is used for 1. */
function replyCount(n, one = '1 reply', many = '{n} replies') {
    return n === 1 ? one : many.replace('{n}', String(n));
}
function defineCommentThread(tag = 'usa-comment-thread') {
    const ctor = defineElement(tag, Base => class CommentThread extends Base {
        static get observedAttributes() { return ['label', 'you', 'reply-label', 'like-label', 'send-label', 'hide-label', 'show-label', 'show-one-label', 'placeholder']; }
        mount() {
            const added = [];
            const hiddenWas = new Map();
            const classed = [];
            const posted = [];
            this.classList.add('usa-kit', 'usa-cthread');
            this.setAttribute('role', this.getAttribute('role') || 'region');
            const hadLabel = this.hasAttribute('aria-label');
            if (!hadLabel)
                this.setAttribute('aria-label', this.str('label', 'Comments'));
            this.toggleAttribute('data-static', this.reduced);
            const all = () => Array.from(this.querySelectorAll('article[data-author]'));
            const replies = (a) => Array.from(a.children).filter((c) => c.matches('article[data-author]'));
            const decorate = (a) => {
                a.classList.add('usa-cthread-item');
                classed.push(a);
                const author = a.dataset.author || '';
                const head = make('header', 'usa-cthread-head');
                const av = make('span', 'usa-cthread-av', author.slice(0, 1).toUpperCase());
                av.setAttribute('aria-hidden', 'true');
                av.style.setProperty('--h', String(([...author].reduce((s, c) => s + c.charCodeAt(0), 0) * 47) % 360));
                head.append(av, make('strong', 'usa-cthread-author', author));
                if (a.dataset.time)
                    head.append(make('span', 'usa-cthread-time', a.dataset.time));
                a.prepend(head);
                added.push(head);
                const bar = make('div', 'usa-cthread-bar');
                let likes = Math.max(0, Math.round(Number(a.dataset.likes) || 0));
                const like = make('button', 'usa-cthread-like');
                like.type = 'button';
                like.setAttribute('aria-pressed', 'false');
                const heart = make('span', 'usa-cthread-heart', '♥');
                heart.setAttribute('aria-hidden', 'true');
                const n = make('span', 'usa-cthread-n', likes ? String(likes) : '');
                like.append(heart, make('span', 'usa-kit-sr', this.str('like-label', 'Like')), n);
                const reply = make('button', 'usa-cthread-reply', this.str('reply-label', 'Reply'));
                reply.type = 'button';
                reply.setAttribute('aria-expanded', 'false');
                bar.append(like, reply);
                const kids = replies(a);
                let toggle = null;
                if (kids.length) {
                    toggle = make('button', 'usa-cthread-toggle');
                    toggle.type = 'button';
                    toggle.setAttribute('aria-expanded', 'true');
                    bar.append(toggle);
                }
                const firstKid = kids[0];
                if (firstKid)
                    a.insertBefore(bar, firstKid);
                else
                    a.append(bar);
                added.push(bar);
                const index = () => all().indexOf(a);
                const paintToggle = () => {
                    if (!toggle)
                        return;
                    const open = toggle.getAttribute('aria-expanded') === 'true';
                    const count = replies(a).length;
                    toggle.textContent = open ? this.str('hide-label', 'Hide replies') : replyCount(count, this.str('show-one-label', '1 reply'), this.str('show-label', '{n} replies'));
                };
                paintToggle();
                this.listen(like, 'click', () => {
                    const on = like.getAttribute('aria-pressed') !== 'true';
                    likes += on ? 1 : -1;
                    like.setAttribute('aria-pressed', String(on));
                    n.textContent = likes ? String(likes) : '';
                    like.removeAttribute('data-pop');
                    void like.offsetWidth;
                    if (on)
                        like.setAttribute('data-pop', '');
                    this.emit('like', { index: index(), liked: on, likes });
                });
                if (toggle)
                    this.listen(toggle, 'click', () => {
                        if (!toggle)
                            return;
                        const open = toggle.getAttribute('aria-expanded') !== 'true';
                        toggle.setAttribute('aria-expanded', String(open));
                        for (const k of replies(a)) {
                            if (!hiddenWas.has(k))
                                hiddenWas.set(k, k.hidden);
                            k.hidden = !open;
                        }
                        paintToggle();
                        this.emit('toggle', { index: index(), open });
                    });
                let form = null;
                this.listen(reply, 'click', () => {
                    if (form) {
                        form.remove();
                        form = null;
                        reply.setAttribute('aria-expanded', 'false');
                        reply.focus();
                        return;
                    }
                    form = make('form', 'usa-cthread-form');
                    const ta = make('textarea', 'usa-cthread-field');
                    ta.rows = 2;
                    ta.placeholder = this.str('placeholder', 'Write a reply…');
                    ta.setAttribute('aria-label', `${this.str('reply-label', 'Reply')}: ${author}`);
                    const send = make('button', 'usa-cthread-send', this.str('send-label', 'Post'));
                    send.type = 'submit';
                    form.append(ta, send);
                    bar.after(form);
                    added.push(form);
                    reply.setAttribute('aria-expanded', 'true');
                    ta.focus();
                    const f = form;
                    f.addEventListener('keydown', (e) => { if (e.key === 'Escape') {
                        e.preventDefault();
                        reply.click();
                    } });
                    f.addEventListener('submit', (e) => {
                        e.preventDefault();
                        const text = ta.value.trim();
                        if (!text) {
                            ta.focus();
                            return;
                        }
                        const art = make('article', 'usa-cthread-new');
                        art.dataset.author = this.str('you', 'You');
                        art.append(make('p', '', text));
                        const at = Array.from(a.children).filter((c) => c.matches('article[data-author]')).pop();
                        (at ?? f).after(art);
                        posted.push(art);
                        f.remove();
                        form = null;
                        reply.setAttribute('aria-expanded', 'false');
                        decorate(art);
                        if (toggle) {
                            toggle.setAttribute('aria-expanded', 'true');
                            for (const k of replies(a))
                                k.hidden = false;
                            paintToggle();
                        }
                        this.emit('reply', { index: index(), text });
                        art.querySelector('.usa-cthread-reply')?.focus();
                    });
                });
            };
            for (const a of all())
                decorate(a);
            this.onCleanup(() => {
                for (const p of posted)
                    p.classList.remove('usa-cthread-new');
                for (const el of added)
                    el.remove();
                for (const [k, h] of hiddenWas)
                    k.hidden = h;
                for (const a of classed) {
                    a.classList.remove('usa-cthread-item');
                    if (!a.classList.length)
                        a.removeAttribute('class');
                }
                this.classList.remove('usa-kit', 'usa-cthread');
                this.removeAttribute('data-static');
                if (this.getAttribute('role') === 'region')
                    this.removeAttribute('role');
                if (!hadLabel)
                    this.removeAttribute('aria-label');
            });
        }
    }, { id: 'ui-kit-13', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineCommentThread as d, replyCount as r };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/chunks/comment-thread-Cy4cIJAu.js.map