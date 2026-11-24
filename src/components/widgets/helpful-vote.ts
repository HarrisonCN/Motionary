import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import css from './ui-kit-12.css?raw';

const THUMB = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3Zm0 0 4-8a3 3 0 0 1 3 3v4h5.5a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.1 21H7"/></svg>';

/**
 * "Was this helpful?" under an article: two thumb buttons. The chosen thumb pops on a spring and the row turns into a
 * thank-you line. With `ask-why`, a "No" opens a short text box first (and its Send button) before saying thanks. Nothing
 * is sent anywhere: the page reads `usa:vote` / `usa:feedback` and stores the answer itself.
 *
 * Attributes: `question` (Was this helpful?), `yes-label` (Yes), `no-label` (No), `thanks` (Thanks for the feedback!),
 * `ask-why`, `why-label` (What was missing?), `send-label` (Send).
 * Events `usa:vote` ({ vote }), `usa:feedback` ({ vote, text }).
 */
export interface UsaHelpfulVoteElement extends UsaElement {
  readonly vote: '' | 'yes' | 'no';
  reset(): void;
}

export function defineHelpfulVote(tag = 'usa-helpful-vote'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class HelpfulVote extends Base {
    static get observedAttributes(): string[] { return ['question', 'yes-label', 'no-label', 'thanks', 'ask-why', 'why-label', 'send-label']; }
    private _vote: '' | 'yes' | 'no' = '';
    get vote(): '' | 'yes' | 'no' { return this._vote; }
    reset(): void { this._vote = ''; this.changed('question'); }
    mount(): void {
      const root = make('div', 'usa-kit usa-vote');
      root.setAttribute('role', 'group');
      const q = make('span', 'usa-vote-q', this.str('question', 'Was this helpful?'));
      q.id = `usa-vote-${Math.random().toString(36).slice(2, 8)}`;
      root.setAttribute('aria-labelledby', q.id);
      const btn = (kind: 'yes' | 'no') => {
        const b = make('button', `usa-vote-btn usa-vote-${kind}`);
        b.type = 'button';
        b.innerHTML = THUMB;
        b.append(make('span', 'usa-vote-label', kind === 'yes' ? this.str('yes-label', 'Yes') : this.str('no-label', 'No')));
        return b;
      };
      const yes = btn('yes'), no = btn('no');
      const row = make('div', 'usa-vote-row');
      row.append(q, yes, no);
      const why = make('form', 'usa-vote-why');
      why.hidden = true;
      const field = make('textarea');
      field.rows = 2;
      field.maxLength = 500;
      field.setAttribute('aria-label', this.str('why-label', 'What was missing?'));
      field.placeholder = this.str('why-label', 'What was missing?');
      const send = make('button', 'usa-vote-send', this.str('send-label', 'Send'));
      send.type = 'submit';
      why.append(field, send);
      const thanks = make('p', 'usa-vote-thanks');
      thanks.setAttribute('role', 'status');
      root.append(row, why, thanks);
      root.toggleAttribute('data-static', this.reduced);
      this.append(root);
      const finish = () => {
        root.setAttribute('data-done', '');
        thanks.textContent = this.str('thanks', 'Thanks for the feedback!');
      };
      const choose = (v: 'yes' | 'no', b: HTMLButtonElement) => {
        if (this._vote) return;
        this._vote = v;
        b.setAttribute('aria-pressed', 'true');
        (v === 'yes' ? no : yes).disabled = true;
        root.dataset.vote = v;
        this.emit('vote', { vote: v });
        if (v === 'no' && this.flag('ask-why')) {
          why.hidden = false;
          field.focus();
        } else finish();
      };
      if (this._vote) {
        const on = this._vote === 'yes' ? yes : no;
        on.setAttribute('aria-pressed', 'true');
        (on === yes ? no : yes).disabled = true;
        root.dataset.vote = this._vote;
        finish();
      }
      this.listen(yes, 'click', () => choose('yes', yes));
      this.listen(no, 'click', () => choose('no', no));
      this.listen(why, 'submit', (e: Event) => {
        e.preventDefault();
        this.emit('feedback', { vote: this._vote, text: field.value.trim() });
        why.hidden = true;
        finish();
        thanks.tabIndex = -1;
        thanks.focus();
      });
      this.onCleanup(() => root.remove());
    }
  }, { id: 'ui-kit-12', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
