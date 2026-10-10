# `<usa-pack>` — E-commerce pack

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Product cards reveal and lift, “Add to cart” presses and flies the product into the cart (which bumps), prices count up, badges pulse.

- **Category:** packs · **since** 3.9
- **Import:** `import { definePack } from 'motionary/components/packs'` then `definePack();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `name`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/packs/pack-el.ts](../../src/components/packs/pack-el.ts)

## Minimal example

```html
<usa-pack name="ecommerce">
  <article data-role="product">
    <img src="shoe.jpg" alt="Runner">
    <span data-role="price">$129</span>
    <button data-role="add-to-cart">Add to cart</button>
  </article>
  <a data-role="cart" href="/cart">Cart</a>
</usa-pack>
```

## ES module

```js
import { definePack } from 'motionary/components/packs';

definePack(); // registers <usa-pack>

/* then use it in your HTML:
<usa-pack name="ecommerce">
  <article data-role="product">
    <img src="shoe.jpg" alt="Runner">
    <span data-role="price">$129</span>
    <button data-role="add-to-cart">Add to cart</button>
  </article>
  <a data-role="cart" href="/cart">Cart</a>
</usa-pack>
*/
```

## Variants

### E-commerce pack

Product cards reveal and lift, “Add to cart” presses and flies the product into the cart (which bumps), prices count up, badges pulse.

```html
<usa-pack name="ecommerce">
  <article data-role="product">
    <img src="shoe.jpg" alt="Runner">
    <span data-role="price">$129</span>
    <button data-role="add-to-cart">Add to cart</button>
  </article>
  <a data-role="cart" href="/cart">Cart</a>
</usa-pack>
```

### Portfolio pack

Headings and projects reveal in sequence, projects lift on hover, stats count up, the contact button pulses.

```html
<usa-pack name="portfolio">
  <h2 data-role="heading">Selected work</h2>
  <a data-role="project" href="/work/1">…</a>
  <b data-role="stat">120</b> clients
  <a data-role="contact" href="mailto:…">Say hi</a>
</usa-pack>
```

### Dashboard pack

KPI cards reveal, numbers count up from zero, alerts pulse, action buttons press.

```html
<usa-pack name="dashboard">
  <div data-role="card">Revenue <b data-role="stat">48,210</b></div>
  <span data-role="alert">3 incidents</span>
</usa-pack>
```

### Game UI pack

Buttons press, the score counts up and bumps, items float, a hit shakes, rewards pulse.

```html
<usa-pack name="game">
  <b data-role="score">9,800</b>
  <img data-role="item" src="gem.png" alt="Gem">
  <button data-role="button">Play</button>
</usa-pack>
```

### Landing page pack

Hero and features reveal in sequence, features lift, logos float gently, stats count up, the CTA pulses and presses.

```html
<usa-pack name="landing">
  <header data-role="hero">…</header>
  <section data-role="feature">…</section>
  <a data-role="cta" href="/signup">Start free</a>
</usa-pack>
```
