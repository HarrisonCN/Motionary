# `<usa-notification-bell>` — Notification bell

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.4: a bell with an unread badge and a dropdown — notify() swings the bell, bumps the badge and slides the notice in; “Mark all read” shrinks the badge away. Esc / outside click close it.

- **Category:** ui · **since** 7.4
- **Import:** `import { defineNotificationBell } from 'motionary/components/widgets'` then `defineNotificationBell();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `label`
- **Events:** `usa:notify`, `usa:read`
- **Slots:** —
- **Methods:** `notify()`, `markAllRead()`, `ring()`
- **Source:** [src/components/widgets/notification-bell.ts](../../src/components/widgets/notification-bell.ts)

## Minimal example

```html
<usa-notification-bell>
  <li data-time="2m">Ada liked your post</li>
</usa-notification-bell>
<script>bell.notify({ text: 'New follower', time: 'now' });</script>
```

## ES module

```js
import { defineNotificationBell } from 'motionary/components/widgets';

defineNotificationBell(); // registers <usa-notification-bell>

/* then use it in your HTML:
<usa-notification-bell>
  <li data-time="2m">Ada liked your post</li>
</usa-notification-bell>
*/
```
