# Gallery components

For ESM, enable the public names and register only the widgets you use.

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineFileTree } from 'motionary/widgets/file-tree';
import { defineDownloadMenu } from 'motionary/widgets/download-menu';
import { defineTitleSequence } from 'motionary/widgets/title-sequence';

defineMoAliases();
defineFileTree();
defineDownloadMenu();
defineTitleSequence();
```

```html
<nav aria-label="Project files">
  <mo-file-tree>
    <details open><summary>Photographs</summary><a href="/portraits">Portraits</a></details>
  </mo-file-tree>
</nav>

<mo-download-menu>
  <details><summary>Download the press kit</summary>
    <a href="/press.pdf" download>PDF</a><a href="/press.zip" download>ZIP</a>
  </details>
</mo-download-menu>

<mo-title-sequence>
  <details open><summary>Overture</summary><p>Morning at the harbour.</p></details>
  <details><summary>Credits</summary><p>Photography by Jo.</p></details>
</mo-title-sequence>
```

The file index uses native disclosures and normal link navigation. Left and right arrow keys collapse, expand and navigate folders. Download links keep their native browser behaviour. Escape closes their picker and restores focus. Title cards use native summaries and reveal the selected credits with a circular mask when motion is enabled.

The prebuilt `components.css` and category stylesheets match both public and legacy tags, including on pages that disable automatic style injection.

The file index draws on Scrolltide’s File Tree and Navbar Gallery’s sidebar category. The format picker draws on CTA Gallery’s Download category. Motion Prompt’s iris transition and Refero’s Freshman cinematic typography informed the title cards. The implementations, styles and examples are original.

[Scrolltide](https://www.scrolltide.co/components) · [Navbar Gallery](https://www.navbar.gallery/) · [CTA Gallery](https://www.cta.gallery/categories/download) · [Motion Prompt](https://showheyohtaki.github.io/motion-prompt/) · [Refero](https://styles.refero.design/style/a6284fcd-fa69-4469-ac40-4239e5b84a39)
