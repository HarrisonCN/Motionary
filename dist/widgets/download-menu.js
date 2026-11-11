import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';

var css = ":is(usa-download-menu,mo-download-menu){display:inline-block}:is(usa-download-menu,mo-download-menu) summary{cursor:pointer;border:1px solid currentColor;border-radius:.5em;padding:.55em .9em}:is(usa-download-menu,mo-download-menu) a{display:block;padding:.45em .9em;color:inherit}";

/** A download picker. The author supplies a details element with a summary and download links. */
function defineDownloadMenu(tag = 'usa-download-menu') {
    const C = defineElement(tag, Base => class extends Base {
        mount() {
            const openMenu = () => this.querySelector(':scope > details[open]');
            this.listen(this, 'keydown', (event) => {
                const disclosure = openMenu();
                if (event.key === 'Escape' && disclosure) {
                    event.preventDefault();
                    disclosure.open = false;
                    disclosure.querySelector('summary')?.focus();
                }
            });
            this.listen(this.ownerDocument, 'pointerdown', (event) => {
                const disclosure = openMenu();
                if (disclosure && !event.composedPath().includes(this))
                    disclosure.open = false;
            });
            this.listen(this, 'click', (event) => {
                const disclosure = openMenu();
                const link = event.target instanceof Element && event.target.closest('a[href]');
                if (disclosure && link && disclosure.contains(link)) {
                    disclosure.open = false;
                    disclosure.querySelector('summary')?.focus();
                }
            });
        }
    }, { id: 'download-menu', text: css });
    // 17.3.1: ships its default <mo-download-menu> name itself, like the other 17.3 widgets.
    defineMoName(tag, C);
    return C;
}

export { defineDownloadMenu };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.3.1/dist/widgets/download-menu.js.map