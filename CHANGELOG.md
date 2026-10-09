# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [8.1.0] - 2026-10-08

### Added
- **2 new components (8.1)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-red-envelope>` — Lunar New Year red envelope (红包): tap / Enter / Space → the flap swings open, the card slides out with `amount` counting up (`currency`, default ¥) and gold coins pop out; `message` (恭喜发财), `from`, `opened`; `open()`, `close()`, `opened`; `usa:open` { amount }.
  - `<usa-festival-banner theme="lunar | xmas | halloween | fireworks">` — announcement banner with an ambient festive scene behind its text (lanterns + sparkles, lights + snow, bats + moon, rockets), animating only while on screen; `dismissible` → close button (`usa:dismiss`), `label`; `FESTIVAL_THEMES`.
- **Festival packs — `motionary/fx/festival`** (= `motionary/components/fx-festival`, `registerFestivalPack()`, also in `registerEffectPacks()`): `firework-burst` (attention), `lantern-rise` (enter), `xmas-snow` (loop), `spooky-float` (attention). `sparkVectors()`.
- Showcase: 4 new gallery cards with copyable code, live demos and live Store thumbnails; Animation Store 334 → 338 items.

### Fixed
- Store live thumbnails (`showcase/thumb.js`): the CDN fallback still pointed at `motionary@7` after 8.0 → `motionary@8`.

### Accessibility
- Red envelope is a real `<button aria-expanded>` with a descriptive label; the amount is announced through a polite live region. Banner: labelled `region`, decorations `aria-hidden`, real dismiss button. Reduced motion: envelope opens without swing / slide / count / coins, the banner scene is static, `firework-burst` / `spooky-float` do nothing, `xmas-snow` is skipped, `lantern-rise` fades in.

## [8.0.0] - 2026-10-08

### ⚠️ Breaking
- **`<usa-rating>` / `defineRating()` removed** (deprecated in 7.9) → `<usa-star-rating>` / `defineStarRating()` from `motionary/components/widgets` (same `value`, `max`, `readonly`, `label`, `name`; `icon="heart"`; `--usa-star-on`). `npx usa-codemod-8 --write src` rewrites tags, icons and the CSS variable. See [docs/upgrading-8.md](./docs/upgrading-8.md).
- Frame loops on the shared scheduler receive a `dt` scaled by the motion clock rate (identical at the default rate 1) and are not called while the clock is paused.

### Added
- **Unified timeline engine — `motionary/engine`** (= `motionary/components/engine`): one clock drives every component, effect and frame loop. `motionClock` (`rate` 0.05–8, `pause()`, `resume()`, `toggle()`, `paused`, `time`, `onChange()`); low-level `getClock()`, `setClock({ rate, paused })`, `onClockChange()`, `trackAnimation()` (also in `motionary/components`' base). Every animation started through the library (`animateWithMotion`, so all `<usa-*>` elements and registered effects) is on the clock.
- **`createTimeline()`** — sequence animations on the clock: `add(target | targets, keyframes, duration | options (+ stagger), position)` with positions `1200`, `'+=200'`, `'-=100'`, `'<'`, `'<+=80'`, `'>'`; `play()`, `pause()`, `seek(ms)`, `restart()`, `cancel()`, `progress` (get / set), `duration`, `playing`, `finished`; `resolvePosition()`.
- **SSR hydration animations** — `ssrHead(nonce?)` (`<style>` + one-line `<script>` for the server-rendered head), `HYDRATION_CSS`, `hydrateMotion(root, { stagger, duration, preset, easing })` animates `[data-usa-hydrate="fade | fade-up | fade-down | scale | blur | slide-left"]` (per-element `data-usa-delay`) and emits `usa:hydrated`; `HYDRATE_PRESETS`. No-JS: content visible; JS that never runs: 3 s CSS fallback.
- **2 new components (8.0)** in `motionary/components/widgets`: `<usa-clock-control>` (pause / speed bar for the motion clock, `speeds`, `usa:change`) and `<usa-hydrate effect stagger duration>` (SSR hydration wrapper for its children, `replay()`, `timeline`, `usa:hydrated`).
- Chinese roadmap v8.1 → v9.0 in [docs/ROADMAP.md](./docs/ROADMAP.md).
- Showcase: 2 new gallery cards with copyable code, live demos and live Store thumbnails; the legacy Rating gallery card is gone (Animation Store 333 → 335 items).
- npm: `motionary` and the `use-scroll-animate` alias are published with the `latest` tag.

### Accessibility
- Clock control: labelled group, play / pause toggle with `aria-pressed` and a changing label, speeds as a `radiogroup` of `radio` buttons — a page-wide "pause animations" control (WCAG 2.2.2). Hydration never hides content without JS or under reduced motion, and the CSS fallback reveals it after 3 s. Reduced motion: timelines jump to their end, hydration shows at once.

## [7.9.0] - 2026-10-08

### Added
- **2 new components (7.9)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-command-palette>` — ⌘K command palette on the native `<dialog>` (top layer, Esc, focus returns): scales in, fuzzy filtering with highlighted letters, results stagger in, a highlight glides between rows (↑ / ↓ / Enter, hover, click), groups. Commands from child `<option value data-group data-keys>` or `setCommands([{ id, label, group, keys }])`; `hotkey` (default `mod+k`, `none`), `inline` (rendered open in the page, no dialog), `placeholder`, `label`; `show()`, `close()`, `toggle()`, `opened`; `usa:run` { id, label }, `usa:open`, `usa:close`. Helpers `fuzzyMatch()`, `keyLabels()`, `matchesKeys()`.
  - `<usa-shortcut keys="mod+k">` — keyboard-shortcut hint as keycaps (⌘ / ⇧ / ⌥ on Apple platforms, Ctrl / Shift / Alt elsewhere) with an optional `label`; pressing the combination anywhere presses the caps one after another and fires `usa:trigger` (`for="id"` clicks that element, `listen="false"` only displays); `press()`.
- **`npx usa-codemod-8`** (new bin) and **[docs/upgrading-8.md](./docs/upgrading-8.md)**.
- `<usa-star-rating>` is now form-associated (`name` submits the value) and also fires a native `change`; `icon` accepts the old `<usa-rating>` characters (★ ♥).
- Showcase: 2 new gallery cards with copyable code, live demos and live Store thumbnails; Animation Store 331 → 333 items.

### Deprecated (removed in 8.0 — warns once in the console)
- `<usa-rating>` / `defineRating()` → `<usa-star-rating>` / `defineStarRating()` (same `value`, `max`, `readonly`, `label`, `name`; `icon="♥"` → `icon="heart"`; `--usa-rating-on` → `--usa-star-on`). `npx usa-codemod-8 --write src` rewrites tags, icons and the CSS variable (manual report for `defineRating`, `createElement` and CSS selectors).

### Accessibility
- Palette: `combobox` input with `aria-activedescendant` over a `listbox` of `option`s (`aria-selected`), group headings are presentational, "No results" is shown as text. Shortcut: keycaps are one `role="img"` with a spoken label ("Command K" / "Control K"). Reduced motion: no scale, stagger, glide or key press.

## [7.8.0] - 2026-10-08

### Added
- **3 new components (7.8)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-chat-composer>` — AI chat input: the textarea grows with its text (up to `rows`, default 6), Enter sends / Shift+Enter new line, the send button pops when there is text and morphs into Stop while `busy`, when a conic "thinking" glow runs round the composer. `usa:send` { text } (cancelable), `usa:stop`; `placeholder`, `label`, `value`, `busy`, `send()`, `clear()`.
  - `<usa-suggestion-chips>` — follow-up prompt chips from `items="a|b|c"` (or child elements): slide in one after another, picking pulses the chip and emits `usa:pick` { text, index }; `dismiss` fades the others; `setItems()` / `items`; arrow keys. `parseChips()`.
  - `<usa-voice-button>` — push-to-talk mic: toggles `listening` (`usa:start` / `usa:stop`), a halo breathes and `bars` (3–9) wave; set `level` (0–1) from an analyser / speech API and both follow it. `toggle()`; `waveBars()`.
- **AI UI motion — `motionary/fx/ai`** (= `motionary/components/fx-ai`, `registerAiPack()`, also in `registerEffectPacks()`): `stream-text` (enter), `thinking-glow` (loop), `voice-wave` (attention), `gen-skeleton` (enter). `splitWords()`.
- Showcase: 5 new gallery cards with copyable code, live demos and live Store thumbnails; Animation Store 326 → 331 items.

### Accessibility
- Composer: labelled textarea, the button's `aria-label` switches Send ↔ Stop generating. Chips: labelled list of real buttons, arrow-key navigation, dismissed chips are disabled. Voice button: a real `<button aria-pressed>`. `stream-text` restores the original text nodes when it finishes (screen readers read the full text). Reduced motion: no glow, pop, slide, halo or wave; `stream-text` shows the text at once, `thinking-glow` is skipped, `voice-wave` does nothing, `gen-skeleton` fades in.

## [7.7.0] - 2026-10-08

### Added
- **3 new components (7.7)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-field>` — animated text input: the `label` floats up on focus / when filled, the underline grows, native validation on blur (`type`, `required`, `pattern`, `minlength`, `maxlength`) — invalid shakes and slides the message in (`usa:invalid`, custom text via `error`), valid draws a check (`usa:valid`); `hint`; `strength` adds a 4-step password meter. The `<input>` is in the light DOM, so forms submit it by `name`. `value`, `validate()`, `input`; `passwordStrength()`.
  - `<usa-otp>` — one-time-code input: `length` boxes (3–10, default 6), auto-advance, Backspace / arrow keys, paste a whole code, `autocomplete="one-time-code"`, `mode="alnum"`, initial `value`; digits pop in; `usa:complete` { code }; `error(message)` shakes red and clears, `success()` green wave, `fillCode(code)`, `clear()`. `sanitizeCode()`.
  - `<usa-upload-progress>` — file row: `name`, `size` (bytes), `value` 0–100 (bar eases, shine while uploading), `status` uploading | done | error, `message`; done draws a check (`usa:done`), error shakes + Retry (`usa:error`, `usa:retry`). `formatBytes()`.
- **Form motion — `motionary/fx/form`** (= `motionary/components/fx-form`, `registerFormPack()`, also in `registerEffectPacks()`): `field-shake` (attention), `field-success` (attention), `label-float` (enter), `form-cascade` (enter). `shakeFrames()`.
- Showcase: 5 new gallery cards with copyable code, live demos and live Store thumbnails; Animation Store 321 → 326 items.
- Note: the plan's "success check" ships as `field-success` (the existing `success-check` effect is unchanged).

### Accessibility
- Field: real `<label for>`, `aria-invalid`, message in an `aria-live` region linked with `aria-describedby`. OTP: labelled `role="group"`, each box labelled "Digit n of N". Upload: `role="progressbar"` with `aria-valuenow` / `aria-valuetext`, a real Retry button. Reduced motion: no shake, pop, wave, shine or easing — states switch at once; `field-shake` / `field-success` only flash the outline, `label-float` / `form-cascade` fade in.

## [7.6.0] - 2026-10-08

### Added
- **2 new components (7.6)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-globe>` — SVG globe in orthographic projection (no WebGL, no tiles): graticule, pulsing `markers` ("Shanghai:31.2,121.5; London:51.5,-0.1"), `speed` (°/s, 0 = still), `tilt`, `lon`; spins only while on screen, drag to turn; `flyTo(name)` eases a marker round to the front (`usa:focus`). `project()`, `parseMarkers()`.
  - `<usa-location-card>` — place card with a stylised mini map: `name`, `address`, `lat`/`lon`, origin `from-lat`/`from-lon` (distance by haversine, `unit` km | mi, or `distance`), `href` → “Directions”. On first view the route draws itself, the pin drops with a bounce and a ring pulses; `replay()`; `usa:arrive`. `haversine()`, `formatDistance()`.
- **Maps & geo motion — `motionary/fx/geo`** (= `motionary/components/fx-geo`, `registerGeoPack()`, also in `registerEffectPacks()`): `route-draw` (enter), `marker-pulse` (attention), `pin-drop` (enter), `globe-spin` (enter). `routeLength()`.
- Showcase: 4 new gallery cards with copyable code and live demos (and live Store thumbnails); Animation Store 317 → 321 items.
- Note: the plan's “flight lines” (飞线) ship as `route-draw` over any SVG path.

### Accessibility
- Globe = `role="img"` labelled with its marker names; location card = labelled `<article>` with a heading and a real link. Reduced motion: the globe does not spin and `flyTo()` jumps; pin and route appear at once; `route-draw` shows the routes, `marker-pulse` does nothing, `pin-drop` / `globe-spin` fade in.

## [7.5.0] - 2026-10-08

### Added
- **4 new components (7.5)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-leaderboard>` — ranked list from `<li data-score>` children or `rows`: on score changes rows glide to their new rank (FLIP), climbers flash green with ▲n, fallers red with ▼n, scores roll; 🥇🥈🥉 for the top three; `limit`, `me`; `setScore()`; `usa:rank`. `rankRows()`.
  - `<usa-xp-bar>` — experience bar (`level`, `xp`, `per`): `add(n)` fills smoothly; overflow fills to the end, the level badge pops and the bar restarts with the remainder (multi-level); `usa:xp`, `usa:levelup`. `levelFor()`.
  - `<usa-badge-wall>` — achievement grid from `<li data-icon data-locked>`: locked badges are grey with 🔒; `unlock(name)` flips the badge to colour with a shine and updates the “n / m unlocked” counter; `badges`, `usa:unlock`. `badgeProgress()`.
  - `<usa-prize-wheel>` — lottery wheel from `segments`: Spin whirls it, it eases out on a random result (or `spin(index)`), the pointer ticks, the wheel glows; `duration`, `turns`, `result`, `spinning`; `usa:result`. `wheelAngle()`.
- **Gamification motion — `motionary/fx/game`** (= `motionary/components/fx-game`, `registerGamePack()`, also in `registerEffectPacks()`): `achievement-unlock` (attention), `level-up` (attention), `chest-open` (click), `coin-burst` (click), `xp-gain` (enter). `throwPath()`.
- Showcase: 6 new gallery cards with copyable code and live demos; Animation Store 311 → 317 items.
- Note: the plan's “lottery” ships as `<usa-prize-wheel>` (wheel + lottery in one component).

### Accessibility
- Leaderboard = labelled ordered list ("1. Ada, 980 points"), rank changes announced politely; XP bar = `progressbar` labelled "Level 3, 40 of 100 XP", level-ups announced; badge wall = labelled list, each badge "First win, locked/unlocked", unlocks announced; prize wheel = real button (disabled while spinning), result announced. Reduced motion: rows jump, no flash or roll; bar and level change at once; badges change without flip or shine; the wheel jumps to the result; `achievement-unlock` / `level-up` fade, `chest-open` sets the lid open, `coin-burst` / `xp-gain` do nothing.

### Fixed
- **Store thumbnails are live demos (user report, mobile ~390px).** Cards in “组件 6.x” (now “Components 6.x–7.x”, 90 items incl. every 7.x widget/effect pack) and “框架 / Frameworks” (5) showed only a generic purple tile with a bouncing emoji or letter. Every component card now renders the real `<usa-*>` element with its gallery demo markup + wiring in a lazily mounted frame (`showcase/thumb.html`, mounted by IntersectionObserver near the viewport, dropped 4 s after leaving it, scaled to fit with no overflow, inert on cards, interactive in the detail view and its “related” minis). Framework cards show a live scroll-reveal demo driven through the real adapter (React hooks / Vue composables via minimal hook stand-ins, the Svelte action, `<scroll-animate>`; Solid via the core) next to its code snippet. Reduced motion: the demos are still, the components follow their own reduced-motion paths. Audit: no Store item (all 317) uses the placeholder any more.
- Showcase: the global icon rule `svg:not([width]) { width: 1.25em }` in `showcase/styles.css` shrank the SVGs inside live demos — `<usa-gauge>` and `<usa-sparkline>` (and the KPI trend) rendered as a 15 px speck in the component gallery. Scoped to UI icons with `:where(…)`.
- Store detail for components: dropped the meaningless duration/easing controls, keyframes and scroll-test mode; Replay remounts the live demo; the note no longer says “preview only”.

## [7.4.0] - 2026-10-08

### Added
- **4 new components (7.4)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-message-list>` — chat thread from `<p data-from data-me data-time>` children or `push(msg)`: bubbles pop in from their side, consecutive messages group, the list sticks to the bottom (smooth) or shows a “↓ New messages” pill when you scrolled up; `typing(name)` shows animated typing dots until the next message; `messages`, `usa:message`. `role="log"` + `aria-live="polite"`.
  - `<usa-reactions>` — emoji reaction bar (`emojis`, `counts`, `picker`): clicking toggles your reaction (emoji pop, count roll, floating copies), ＋ springs open a picker; `counts`, `mine`, `toggle()`, `usa:react`. `parseReactions()`.
  - `<usa-notification-bell>` — bell + unread badge + dropdown (`<li data-time data-read>` children): `notify()` swings the bell, bumps the badge and slides the notice in; `markAllRead()` shrinks the badge away; `unread`, `notices`, `open`, `ring()`; Esc / outside click close; `usa:notify`, `usa:read`.
  - `<usa-presence>` — avatar + status dot (`status` online | away | busy | offline, `name`, `src`): coming online sends a ripple, `speaking` pulses a ring, `story` spins a gradient ring; initials fallback. `PRESENCE_STATES`, `initials()`.
- **Chat & social motion — `motionary/fx/social`** (= `motionary/components/fx-social`, `registerSocialPack()`, also in `registerEffectPacks()`): `typing-dots` (loop), `message-in` (enter), `reaction-burst` (click), `read-receipt` (enter), `mention-glow` (attention). `fanAngles()`.
- Showcase: 6 new gallery cards with copyable code and live demos; Animation Store 305 → 311 items.
- Note: the plan's “avatar stack” already ships as `<usa-avatar-stack>` (unchanged), so 7.4 adds `<usa-presence>` instead.

### Fixed
- `<usa-reactions>` (pre-release staging): two type errors broke `tsc` — `picker.hidden` (now `boolean | "until-found"` in the DOM lib) passed to a boolean toggle, and `.type` set on an `HTMLElement` — fixed (`=== true`, `setAttribute('type','button')`).

### Accessibility
- Message list = `log` (polite) with a labelled typing bubble; reactions = labelled `group` of `aria-pressed` toggle buttons with counts in their labels; bell = `button` with `aria-expanded` and the unread count in its label, list = labelled region, Esc returns focus; presence = labelled `img` ("Ada Lovelace, online"). Reduced motion: no pop, smooth scroll, roll, float, swing, bump, slide, ripple, pulse or ring spin; typing dots are static; `reaction-burst` does nothing, `read-receipt` / `mention-glow` show their end state.

## [7.3.0] - 2026-10-08

### Added
- **4 new components (7.3)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-add-to-cart>` — buy button: the product photo (`from`, or the closest `[data-product] img`) flies on an arc into the cart (`cart` selector; a `<usa-cart-drawer>` gets `add(item)` with the `item` JSON), the button morphs to ✓ `added` for `hold` ms; `usa:add`; live-region announcement.
  - `<usa-cart-drawer>` — cart button + count badge + side drawer: lines slide in or bump their quantity, removed lines collapse, the badge bumps, the total rolls; `add()` / `removeItem()` / `items` / `total` / `count` / `open` / `toggle()`; Esc / backdrop close, focus moves in and back; `currency`, `label`; `usa:change` / `usa:open` / `usa:close`. `cartTotal()`.
  - `<usa-product-gallery>` — `<img>` children become a stage + thumbnail tabs: the stage cross-slides in the direction of travel, the selection ring glides, hover zoom under the pointer (`zoom`, `nozoom`), swipe and ←/→; `index`, `go()` / `next()` / `prev()`, `usa:change`. `wrapIndex()`.
  - `<usa-countdown>` — split-flap countdown to `to` or for `seconds` (`units`, `labels`): changed digits flip; `usa:tick` / `usa:done`, `data-done`; `role="timer"` with a label updated once a minute. `splitTime()`.
- **E-commerce motion — `motionary/fx/shop`** (= `motionary/components/fx-shop`, `registerShopPack()`, also in `registerEffectPacks()`): `fly-to-cart` (click), `price-flip` (enter), `stock-pulse` (loop), `sale-shine` (hover), `badge-pop` (attention). `arcPath()`.
- Showcase: 6 new gallery cards with copyable code and live demos; Animation Store 299 → 305 items.

### Fixed
- `<usa-cart-drawer>` (pre-release staging): the panel's `display:flex` overrode `[hidden]`, so the drawer showed while closed — `[hidden]` now wins.
- `<usa-countdown>`: restarting (changing `to` / `seconds`) after it finished kept `data-done` — now cleared.

### Accessibility
- Add-to-cart = real `<button>` + polite live region; cart drawer = `dialog` with `aria-modal`, labelled toggle with the item count, Esc; product gallery = labelled stage group + thumbnail `tab`s with roving tabindex; countdown = `timer` labelled once a minute. Reduced motion: no flight, morph, slide, glide, zoom, flip, bump or roll — state changes at once; `stock-pulse` / `sale-shine` do nothing, `fly-to-cart` only fades the cart.

## [7.2.0] - 2026-10-08

### Added
- **4 new components (7.2)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-bar-chart>` — animated bar chart from `values` + `labels`, `<data>` children or the `data` property: bars grow in a stagger on first view, value labels show with `unit`; new data glides every bar (appearing bars grow, leaving bars shrink away); `horizontal`, `max`. A labelled `figure` with a list of “label: value” items.
  - `<usa-gauge>` — semicircular gauge: the needle swings to `value` on a damped spring, the arc fills in the colour of its `zones` (`"60:#22c55e,85:#f59e0b,100:#ef4444"`), the number counts; `min` / `max` / `unit` / `label`; `role="meter"` with `aria-valuetext`.
  - `<usa-sparkline>` — inline trend line (`values` or `data`): draws on first view, area fades in, the last point pulses, new data morphs point by point; `variant="line | area | bars"`, `color`; hover tooltip; text summary as `aria-label`. `SPARK_VARIANTS`, `sparkPoints()`.
  - `<usa-kpi>` — KPI card: the value counts up keeping prefix / suffix / decimals, the `delta` chip slides in with a ▲ / ▼ coloured by sign (`invert` when down is good), optional `trend` sparkline, `caption`; setting `value` rolls from the old number and flashes the card.
- **Data-viz motion — `motionary/fx/chart`** (= `motionary/components/fx-chart`, `registerChartPack()`, also in `registerEffectPacks()`): entrances for charts you already have (any SVG / HTML chart library) — `bars-grow`, `line-draw`, `ring-sweep`, `dots-pop`, `number-roll` (enter) and `sankey-flow` (loop). `parseFigure()`.
- Showcase: 7 new gallery cards with copyable code and live “new data” buttons; Animation Store 292 → 299 items.

### Accessibility
- Bar chart = `figure` + list items labelled “label: value”; gauge = `meter` with `aria-valuenow` / `aria-valuetext`; sparkline = `img` with a trend summary; KPI = labelled `group`. Reduced motion: no growth, glide, swing, count, draw, morph, pulse or flash — final values are shown at once; chart effects end in their final state with a short fade and `sankey-flow` is static.

## [7.1.0] - 2026-10-08

### Added
- **4 new components (7.1)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`; the existing `<usa-audio>`, `<usa-beat>` and `<usa-player>` are unchanged):
  - `<usa-music-player>` — music player card: the cover spins like a record while playing, play ↔ pause, dancing mini equalizer bars, scrubbable progress slider (← / → ±5 s); plays a child `<audio>` / `src` or simulates `duration`; `play()`, `pause()`, `toggle()`, `seek()`; `usa:play`, `usa:pause`, `usa:seek`, `usa:prev`, `usa:next`.
  - `<usa-volume-knob>` — rotary knob (`role="slider"`): drag, wheel or keys; value arc + LED tick ring; the cap springs to the angle; `usa:input` / `usa:change`.
  - `<usa-equalizer>` — graphic EQ: one vertical slider per band with springy caps and a smooth response curve; presets `flat | bass | vocal | rock | electronic` glide every band (`applyPreset()`); `values`; `usa:change`. `EQ_PRESETS`.
  - `<usa-lyrics>` — synced karaoke lyrics from LRC or `[data-t]` lines: the active line glows, centres and fills word by word, past lines dim; follows `for` (`<audio>`, `<video>`, `<usa-music-player>`); click to `usa:seek`. `parseLRC()`.
- **Music visualization — `motionary/fx/music`** (= `motionary/components/fx-music`, `registerMusicPack()`, also in `registerEffectPacks()`): `waveform-scope`, `radial-spectrum`, `spectrum-mirror`, `sound-particles` (Canvas 2D backgrounds) and `beat-bounce`, `vinyl-spin` (loops). They read the live analyser (`enableAudio()` / `<usa-audio>`) or a synthetic signal (`syntheticSample()`, `musicSample()`).
- Showcase: 7 new gallery cards with copyable code (the lyrics card follows a demo player); Animation Store 285 → 292 items.

### Accessibility
- The player is a labelled group with a `slider` for progress and an `aria-pressed` play button; the knob and every EQ band are `slider`s with `aria-valuetext`; the lyrics region marks the current line with `aria-current`. Reduced motion: no spin, dancing bars, cap spring, glide, sweep or smooth scroll; visual backgrounds draw one static frame and the loop effects do nothing.

## [7.0.0] - 2026-10-08

### ⚠️ Breaking — removed (deprecated in 6.9; `npx usa-codemod-7 --write src`)
- `registerFx2()` → `registerEffectPacks()`; `FX2_PACKS` → `EFFECT_PACKS`.
- `registerGpuEffects` / `registerTextEffects3` / `registerLightEffects` / `register3dEffects` / `registerMorphEffects2` / `registerTransitionEffects2` / `registerWeatherEffects` / `registerPhysicsEffects2` → `registerGpuPack` / `registerTextPack` / `registerLightPack` / `register3dPack` / `registerMorphPack` / `registerTransitionsPack` / `registerWeatherPack` / `registerPhysicsPack`.
- `<usa-tooltip>` (`defineTooltip`) → `<usa-tip>` (`defineTip`, 6.6); `<usa-toggle>` (`defineToggle`) → `<usa-switch>` (`defineSwitch`, 6.7). Docs, framework examples and the showcase use the new tags.

### Added
- **WebGPU backend** for shader backgrounds: `backend: 'auto'` now tries WebGPU first (the GLSL body is translated by `glslToWgsl()`, or a spec ships `wgsl`), then WebGL2, then Canvas 2D; `el.dataset.usaBackend` = `webgpu` / `webgl2` / `canvas`. New exports `supportsWebGPU()`, `glslToWgsl()`, `wgslModule()`, `webgpuBackground()`, `WGSL_HEAD`.
- **Per-pack entries**: `motionary/fx` (every pack) and `motionary/fx/gpu`, `/fx/text`, `/fx/light`, `/fx/3d`, `/fx/morph`, `/fx/transitions`, `/fx/weather`, `/fx/physics`, `/fx/focus`, `/fx/marketplace` (same builds as `motionary/components/fx-*`, which keep working).
- **docs/ROADMAP.md** replaced by the post-7.0 roadmap (v7.1 → v8.0).
- npm: `motionary@7.0.0` and the `use-scroll-animate@7.0.0` alias are published with the `latest` tag.

### Upgrading
- See [docs/upgrading-7.md](./docs/upgrading-7.md). Everything else (browser baseline, `<usa-player>` JSON, every 6.x widget API) is unchanged.

## [6.9.0] - 2026-10-08

### Added
- **4 new components (6.9)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-date-picker>` — inline calendar: months slide in from the direction of travel, the chosen day pops in a spring circle, today has a ring; full date-grid keyboard (arrows, PageUp / PageDown, Home / End, Enter), `min` / `max`, `first-day`, `locale`; `usa:change`. Helpers `monthGrid()`, `parseISODate()`.
  - `<usa-color-picker>` — saturation / brightness square + hue strip (keyboard sliders, Shift ×10) with spring-follow thumbs, morphing preview chip, popping `swatches`; `value` `#rrggbb`; `usa:input` / `usa:change`. Helpers `hsvToHex()`, `hexToHsv()`.
  - `<usa-file-drop>` — drop zone with marching-ants on drag-over and a lifting icon; files (dropped or browsed via the built-in input) fly into a list with progress bars and a drawn check; `setProgress(i, p)`, `simulate`, `accept`, `multiple`; `usa:files`.
  - `<usa-keyframe-editor>` — **animation editor 2.0**: a timeline for `<usa-player>` JSON — drag bars to move tracks, drag edges to resize (or ← / →, Shift + ← / →), scrub or play the preview of the `for` element; reads / writes format `use-scroll-animate/animation` v1; `usa:change`.
- **Focus & feedback — `motionary/components/fx-focus`** (`registerFocusPack()`): `focus-draw`, `marching-ants`, `success-check`, `highlight-sweep`.
- **Effect marketplace manifest — `motionary/components/marketplace`**: format `motionary/effect-pack` v1; `packManifest()`, `validateManifest()`, `loadEffectPack(url | module, { override })` (validates, refuses to replace existing effects unless `override`). Also exported from `motionary/components/fx2`.
- **`npx usa-codemod-7`** (new bin) and **[docs/upgrading-7.md](./docs/upgrading-7.md)**.
- Consistent pack registrars: `registerGpuPack()`, `registerTextPack()`, `registerLightPack()`, `register3dPack()`, `registerMorphPack()`, `registerTransitionsPack()`, `registerWeatherPack()`, `registerPhysicsPack()`, `registerFocusPack()`; `registerEffectPacks()` + `EFFECT_PACKS` for all of them.
- Showcase: 6 new gallery cards with copyable code; Animation Store “Components 6.x” 52 → 58 entries (279 → 285 items).

### Deprecated (removed in 7.0 — warn once in the console)
- `registerFx2()` → `registerEffectPacks()`; `FX2_PACKS` → `EFFECT_PACKS`.
- `registerGpuEffects` / `registerTextEffects3` / `registerLightEffects` / `register3dEffects` / `registerMorphEffects2` / `registerTransitionEffects2` / `registerWeatherEffects` / `registerPhysicsEffects2` → the `register*Pack()` names above.
- `<usa-tooltip>` → `<usa-tip>` (6.6); `<usa-toggle>` → `<usa-switch>` (6.7). Same attributes.
- `npx usa-codemod-7 --write src` rewrites all of the above (manual report for `defineTooltip` / `defineToggle`, `createElement` and CSS selectors).

### Accessibility
- Date picker is a `grid` with labelled cells, `aria-selected`, `aria-disabled` and a live month title; color picker areas are `slider`s with `aria-valuetext`; file drop is a keyboard button around a real file input with a polite list; editor clips are keyboard sliders. Reduced motion: no slide / pop / ants / fly-in; the editor preview jumps to the end; every focus effect becomes a fade (marching-ants static).

## [6.8.0] - 2026-10-08

### Added
- **4 new components (6.8)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`; the existing `<usa-swipeable>`, `<usa-draggable>` and `<usa-pull-refresh>` are unchanged):
  - `<usa-kanban>` — kanban board with drag-sort: lifted card tilts with the drag, a placeholder opens at the drop point and the other cards glide aside (FLIP); full keyboard move (Space / arrows / Space, Esc) with polite announcements; `move()`; `usa:move`.
  - `<usa-swipe-deck>` — Tinder-style deck: drag / fling the top card off with rotation and LIKE / NOPE stamps, spring back below `threshold`; `like()`, `nope()`, `undo()`, ← / →; `usa:swipe`, `usa:empty`.
  - `<usa-weather-card>` — animated weather widget: `condition="clear | cloudy | rain | snow | storm | fog | night"` scenes (turning sun, drifting clouds, rain, snow, flash-safe bolt, fog bands, stars), cross-fade on change, temperature count-up; `temp`, `unit`, `place`, `label`.
  - `<usa-pull-cord>` — lamp pull-cord switch: drag the cord past `threshold`, release to toggle; the cord swings back on a damped spring (SVG); click / Space / Enter tug it; `role="switch"`; `usa:change`.
- **Weather & ambience — `motionary/components/fx-weather`** (6 Canvas 2D backgrounds, `registerWeatherEffects()`, also in `registerFx2()`): `rain-glass`, `snowfall` (piles up), `lightning` (photosensitive-safe: ≥ 2.5 s between bolts, glow ≤ 22 %, none under reduced motion), `fog`, `aurora-veil`, `day-cycle` (dawn → night, sun / moon arc, or fixed `hour`). Helper `skyAt(hour)`.
- **Physics 2.0 — `motionary/components/fx-physics`** (`registerPhysicsEffects2()`, also in `registerFx2()`): `soft-body` and `magnet` (hover), `cloth`, `rope` and `pinball` (Canvas 2D backgrounds that react to the pointer); exported `VerletWorld` (points, sticks, gravity, damping, `push()`).
- Showcase: 10 new gallery cards with copyable code; Animation Store “Components 6.x” 42 → 52 entries (269 → 279 items).

### Accessibility
- Kanban columns are labelled lists, cards are focusable with keyboard pick-up / move / drop and live announcements; the deck is a labelled region with arrow keys; the weather card is a group whose label is the text summary (scene `aria-hidden`); the pull-cord is a `switch`. Reduced motion: no tilt / glide / fly / swing / count-up; weather and physics backgrounds draw one static frame; lightning never flashes.

## [6.7.0] - 2026-10-08

### Added
- **4 new components (6.7)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`; the existing `<usa-toggle>` and `<usa-tabs>` are unchanged):
  - `<usa-stepper>` — step indicator / wizard: the rail fills toward the current step, finished steps pop a drawn check, the current step pulses; horizontal or vertical, `clickable`, `next()` / `prev()` / `value`; `usa:change`.
  - `<usa-pagination>` — pager with a sliding, squashing ink and page numbers that slide in from the direction of travel; `total`, `page`, `siblings`, ellipses, prev / next, `aria-current`; `usa:change`. Helper `pageWindow()`.
  - `<usa-segmented>` — segmented control whose thumb springs and stretches between segments; radio group with arrow keys; `variant="ios | pill | outline"`; `usa:change`.
  - `<usa-switch>` — toggle switch variants `ios` (press-stretch), `daynight` (sun → moon + stars), `bounce` (squash), `liquid` (gooey pour); `role="switch"`, form value via `name`, `disabled`; `usa:change`.
- **Transitions 2.0 — `motionary/components/fx-transitions`** (6 effects of kind `page`, `registerTransitionEffects2()`, also in `registerFx2()`; option `mode: "in" | "out"`): `ripple-dissolve`, `shatter`, `mosaic-flip`, `liquid-wipe`, `page-curl`, `camera-dolly`. `pageTransition(update, effect)` runs a DOM update inside the View Transitions API (fallback: update + effect); `crossDocumentTransitions(effect)` opts an MPA into cross-document view transitions with the same look.
- Showcase: 7 new gallery cards with copyable code; Animation Store “Components 6.x” 35 → 42 entries (262 → 269 items).

### Accessibility
- Stepper is a labelled list with `aria-current="step"`; pagination is a labelled navigation with `aria-current="page"` and disabled prev / next at the ends; segmented is a `radiogroup` with roving tabindex; switch is `role="switch"` with `aria-checked`. Reduced motion: no pop, ink squash, thumb stretch, bounce or pour; every transition becomes a short fade (and cross-document transitions ~1 ms).

## [6.6.0] - 2026-10-08

### Added
- **4 new components (6.6)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`; the existing `<usa-navbar>`, `<usa-tooltip>`, `<usa-popover>` and `<usa-icon-morph>` are unchanged):
  - `<usa-dock>` — macOS-style dock: cosine-falloff magnification along the pointer (`magnify`, `range`), neighbours make room, `data-label` tooltips, click `bounce`, keyboard focus magnifies, vertical orientation; `role="toolbar"`.
  - `<usa-nav-morph>` — navigation with an indicator that stretches to the hovered / focused link and settles on the current page; `indicator="underline | pill | blob | dot"`, arrow-key focus, manages `aria-current`; `usa:change`.
  - `<usa-menu-toggle>` — hamburger that morphs into `cross`, `arrow`, `minus` or `plus-x`; a button with `aria-expanded` that opens / closes its `for` target (`hidden`, or `show()` / `close()` — works with `<usa-sheet>` and `<usa-modal>`); `usa:toggle`.
  - `<usa-tip>` — tooltip / popover 2.0: springs out with an arrow, flips and shifts to stay in the viewport, hover + focus + Esc (WCAG 1.4.13) or `trigger="click"` popovers with rich `[slot="tip"]` content; `usa:open`, `usa:close`.
- **Morph & SVG 2.0 — `motionary/components/fx-morph`** (5 effects, `registerMorphEffects2()`, also in `registerFx2()`): `path-morph` (resampled point morph between any SVG paths), `blob-button` (liquid blob that bulges toward the pointer), `stroke-draw` (every stroke draws, then fills fade in), `noise-reveal` (SVG turbulence + blur filter transition), `icon-swap` (gooey icon morph). Helpers `samplePath()`, `pointsToPath()`.
- Showcase: 7 new gallery cards with copyable code; Animation Store “Components 6.x” 28 → 35 entries (255 → 262 items).

### Accessibility
- Dock is a toolbar with labelled items, the nav manages `aria-current`, the toggle exposes `aria-expanded` / `aria-controls`, tips use `role="tooltip"` + `aria-describedby` (or `role="dialog"` for click popovers) and close on Esc. Reduced motion: no magnification, stretch or morph loops; reveals and swaps fade.

## [6.5.0] - 2026-10-08

### Added
- **4 new components (6.5)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`; the existing `<usa-timeline>`, `<usa-masonry>` and `<usa-cube>` are unchanged):
  - `<usa-milestones>` — scroll-drawn timeline: the rail fills as you scroll, each milestone pops its dot and slides its card in when reached; `layout="alternate | left"` (one column below 640 px), `data-date` labels; `role="list"`; `usa:reach`.
  - `<usa-masonry-flow>` — masonry grid with FLIP layout animation on resize, insert / remove, `filter()`, `shuffle()`, `sort()`; `min` column width, `gap`; `usa:layout`.
  - `<usa-compare>` — before / after compare slider: drag, click-to-jump (eased), `hover` mode, keyboard (`role="slider"`), `orientation="vertical"`, `labels`, one-time `intro` sweep; `usa:change`.
  - `<usa-cube-gallery>` — slides on adjacent faces of a 3D cube that turns between them; swipe, arrow keys, buttons, `autoplay` (pauses on hover / focus / off screen), `axis="x"`; `usa:change`.
- **3D scene cards — `motionary/components/fx-3d`** (5 effects, `register3dEffects()`, also in `registerFx2()`): `depth-stack` (layers separate in Z and parallax with the tilt), `product-spin` (drag-to-rotate 360° viewer with inertia + idle turntable), `card-flip-3d` (thick card flip, faces swap `aria-hidden`), `origami` (panel-by-panel unfold), `orbit-camera` (scroll-linked camera orbit, `--usa-orbit` progress variable).
- Showcase: 7 new gallery cards (shuffle / filter buttons for the masonry) with copyable code; Animation Store “Components 6.x” 21 → 28 entries (248 → 255 items).

### Accessibility
- Milestones are a list, the compare slider and cube gallery are keyboard operable with ARIA roles. Reduced motion: milestones are shown at once, the cube fades, masonry items jump, 3D tilt / spin / orbit / origami are off and the flip crossfades.

## [6.4.0] - 2026-10-08

### Added
- **4 new components (6.4)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`; the existing `<usa-progress>`, `<usa-counter>`, `<usa-skeleton>` and `<usa-rating>` are unchanged):
  - `<usa-progress-ring>` — ring, `bar` or `semi` gauge; the arc eases to each new value with a small overshoot while the label counts; `gradient`, `duration`, `no-label`; indeterminate without `value`; `role="progressbar"`, `usa:complete`.
  - `<usa-odometer>` — rolling digit wheels: each digit spins forward to its new value, added digits slide in; `locale` (Intl.NumberFormat grouping), `decimals`, `prefix`, `suffix`, `duration`; the formatted number is the accessible name.
  - `<usa-skeleton-reveal>` — a skeleton generated from the real content (one bar per rendered text line, blocks for images / buttons / `[data-skeleton]`), synchronized `wave` / `pulse` / `glow` shimmer; removing `loading` (or `reveal()`) dissolves the bars top-to-bottom while the content fades in from a blur; `aria-busy`, `usa:reveal`.
  - `<usa-star-rating>` — rating stars 2.0: hover preview, `step="0.5"` half stars, click pop + sparkle burst + ripple, `icon="heart"`, `readonly`; keyboard slider; `usa:change`.
- **Light & materials — `motionary/components/fx-light`** (6 effects, `registerLightEffects()`, also in `registerFx2()`): `light-follow` (point light + specular hot spot), `refraction` (glass lens following the pointer, backdrop-filter), `brushed-metal` (anisotropic sheen), `pearlescent` (nacre / holographic film), `god-rays` (volumetric light shafts, Canvas 2D), `pointer-shadow` (real-time cast shadow away from the pointer). Helper `trackPointer()`.
- Showcase: 7 new gallery cards (live value buttons for the ring, odometer and skeleton) with copyable code; Animation Store “Components 6.x” 14 → 21 entries (241 → 248 items).

### Accessibility
- Progress ring and odometer expose their values (`aria-valuenow`, accessible name); the skeleton sets `aria-busy`; the rating is a keyboard slider. Reduced motion: values switch instantly, no shimmer / pop, lights stay fixed, god rays draw one still frame.

### Fixed
- Links: the repository is now **HarrisonCN/Motionary** (capital M). GitHub Pages URLs are case-sensitive, so every showcase / docs link in the README (EN / ZH / JA), `package.json` (`homepage`, `repository`, `bugs`), showcase meta / Open Graph tags, docs and issue templates now point to `https://harrisoncn.github.io/Motionary/…` (the lowercase `/motionary/` path returned 404).

## [6.3.0] - 2026-10-08

### Added
- **4 new components (6.3)** in `motionary/components/widgets` (also in `dist/widgets.umd.js`):
  - `<usa-toast-stack>` — notifications pile into a collapsed stack (newest in front, older ones peeking behind) and fan out on hover / focus; auto-dismiss paused while hovered, swipe to dismiss, action + close buttons, six `position`s, `max`, `contained`; polite live region (errors use `role="alert"`). API `show()`, `dismiss()`, `clear()`, module helper `stackToast()`, declarative `[data-usa-toast]` triggers; events `usa:show`, `usa:dismiss`.
  - `<usa-modal>` — modal on the native `<dialog>` (top layer, focus trap, Esc) with a fading blurred backdrop; `effect="scale | slide-up | flip | origin"` (`origin` grows out of the opener); `persistent`; `[data-usa-open="id"]` / `[data-usa-close]`; focus returns to the opener. API `show()`, `close(value)`, `toggle()`; `usa:open`, `usa:close`.
  - `<usa-sheet>` — side / bottom sheet (`side="right | left | bottom | top"`) on the same overlay core; the bottom sheet has a grab handle and drag-to-dismiss with spring-back.
  - `<usa-menu>` — dropdown menu that scales / folds / slides out of its button with cascading items; full menu keyboard support, outside click closes; `usa:select`.
- **Text effects 3.0 — `motionary/components/fx-text`** (7 effects, `registerTextEffects3()`, also in `registerFx2()`): `liquid-text` (animated SVG displacement), `neon-write` (letters flicker on like a neon sign), `particle-text` (particles assemble into the glyphs), `glitch-text` (RGB-split slices), `text-trail` (cursor: letters fall off the pointer), `font-breathe` (variable-font weight wave), `flip-chars` (per-character 3D flip). Helper `splitChars()` keeps a visually hidden copy for screen readers.
- Showcase: 7 new gallery cards with copyable HTML / ESM / React / Vue / desktop code; Animation Store “Components 6.x” 7 → 14 entries (234 → 241 items).

### Accessibility
- Overlays use the native `<dialog>` modal semantics; menu and tabs follow the WAI-ARIA patterns. Under reduced motion overlays and menus fade, text loops / trail / particles are skipped and one-shot text effects show their final state.

## [6.2.0] - 2026-10-08

### Added
- **New entry `motionary/components/widgets`** — the 6.x animated UI widgets, kept out of `motionary/components` and `components/lite` (lite stays ≤ 70 KB). `defineWidgets(release?)`, `WIDGETS` (by release), `WIDGET_TAGS`. No-build bundle **`dist/widgets.umd.js`** (`window.UsaWidgets`) registers every widget and every 6.x effect pack.
- **4 new components (6.2)**:
  - `<usa-carousel>` — swipe / drag / arrow keys / dots / autoplay (pauses on hover, focus, off screen); effects `slide`, `fade`, `scale`, `cards` (3D coverflow); `loop`; API `next()`, `prev()`, `goTo()`, `index`, `usa:change`.
  - `<usa-tab-bar>` — tabs whose indicator stretches from the old tab to the new one (leading edge first); `indicator="pill | underline | glow | gooey"`; panels (`data-panel`) slide in from the side of travel; full tablist keyboard support; `select()`, `usa:change`.
  - `<usa-disclosure>` — accordion 2.0 on native `<details>`: spring height + fade, overshooting chevron, single or `multiple`, `variant="cards"`; `toggle()`, `openAll()`, `closeAll()`, `usa:toggle`.
  - `<usa-stories>` — story viewer: segmented progress, auto-advance, tap left / right, press-and-hold pause, pause button (WCAG 2.2.2); `usa:change`, `usa:end`.
- **GPU effect pack `motionary/components/fx-gpu`** (8 effects, `registerGpuEffects()`): WebGL2 shaders `fluid` (swirls around the pointer), `smoke`, `fire`, `ink`, `fireflies` with an automatic **Canvas 2D fallback** (no WebGL2, compile error or lost context; `data-usa-backend="webgl2 | canvas"`, `backend: 'canvas'` to force it); Canvas 2D particles `sakura` and `leaves`; click effect `splash`. Visible-only rendering, adaptive resolution. Helpers `shaderBackground()`, `supportsWebGL2()`, `fieldFallback()`, `GLSL_HEAD` for your own shaders. `motionary/components/fx2` registers every 6.x pack (`registerFx2()`).
- Showcase: gallery cards for the 4 widgets + 3 effect cards (copyable HTML / ESM / React / Vue / desktop code); **Animation Store: new “Components 6.x” chip** with 7 entries (snippets for every tab + link to the live demo) — 227 → 234 items.

### Changed
- The effect registry is shared per page through `Symbol.for('use-scroll-animate.effects')`, so several bundles (e.g. `components.umd.js` + `widgets.umd.js`) register into one table.
- docs/ROADMAP.md: 6.2 → 7.0 replanned — every release now also adds new animated UI components; weather and interactive physics 2.0 merge into 6.8, 7.0 prep is 6.9.

### Accessibility
- Every widget is keyboard accessible with ARIA roles; under reduced motion the carousel and tabs switch instantly, accordions open instantly, stories don't auto-advance, GPU backgrounds draw a single still frame.

## [6.1.1] - 2026-10-08

### Changed — the project is now **Motionary**
- **Renamed to Motionary** (formerly `use-scroll-animate`): npm package **`motionary`**, repository `HarrisonCN/motionary`, showcase at `https://harrisoncn.github.io/Motionary/showcase/`, CDN `https://unpkg.com/motionary@6/dist/…` (jsDelivr: `cdn.jsdelivr.net/npm/motionary@6`). **No breaking change**: every API name, the `<usa-*>` tags, `usa-` CSS classes, the `ScrollAnimate` / `UsaComponents` globals, the `usa-codemod-*` bins and the `use-scroll-animate/animation` player format id stay the same.
- `use-scroll-animate` keeps being published at the same versions as a compatibility alias (same build); switching is `npm i motionary` + replacing `use-scroll-animate` with `motionary` in imports and CDN URLs.
- New package description and keywords; `homepage` is the showcase.

### Docs
- README (EN / 中文 / 日本語) rewritten for 6.1: tagline, showcase links (Store · Components · Playground · Story), install (npm + CDN @6), 30-second quickstart (data attributes, JS API, React / Vue / Svelte / Solid / Angular), feature overview with real counts, all 94 animated elements, accessibility, measured gzip sizes, browser baseline, upgrading, roadmap, license. Stale per-version sections removed (details live in `docs/`).
- Docs, examples, showcase code snippets and issue templates use the new name; showcase pages get Motionary titles and Open Graph / Twitter meta.

## [6.1.0] - 2026-10-08

### Added — Scroll presets 2.0
- **181 new scroll-reveal presets** (214 in total) in a separate, tree-shakeable entry: `import 'use-scroll-animate/presets/extended'` registers them on import (exports `EXTENDED_PRESETS`, `EXTENDED_PRESET_CATEGORIES`, `registerExtendedPresets()`); `<script>` pages load `dist/presets-extended.umd.js` after (or before) `dist/index.umd.js`. ≈ 4.7 kB gzip; the core bundle stays within its budget (UMD 8.81 kB / 9 kB).
  - Fade (+14: small/large distances, diagonals, settle, half) · Zoom & scale (+18: zoom-in/out up/down/left/right, from zero / 2×, zoom-bounce, origin-aware scale-x/y, stretch) · Flip 3D (+18: reverse, half turn, diagonal, edge flips, door-open, unfold, fold, bounce flips, swing-in) · Slide (+16: overshoot slides, back-in ×4, light-speed ×2, rise / sink, float) · Rotate & skew (+16: roll, spiral, spin, corner pivots, skew / shear, twist, tilt) · Blur & mask (+12: directional blur, zoom blur, motion blur, mask-up/down/left/right) · Clip reveal (+17: circles from edges/corner, ellipse, diamond, curtains, box, pill, blinds, diagonal & slanted wipes) · **Bounce & elastic** (+17: bounce-in ×5, elastic, rubber band, jello, wobble, tada, heartbeat, drop, pop, squash & stretch, shake, swing) · **Color & light** (+14: brightness, darken, colour / saturate / hue / sepia / invert / contrast / exposure / vintage, bloom, shadow lift, neon glow, glow) · **Depth & perspective** (+10) · **Glitch & special** (+9: glitch, colour glitch, typewriter, typewriter lines, hinge, flicker, scan, materialize, teleport) · **Stagger-ready** (+8 `stagger-*`) · **Scroll-linked** (+12 `scrub-*`: parallax drift, rotate / spin / scale / shrink / tilt on scroll, horizontal pan, sticky fade, focus through, wipe — for `engine: 'css'` with `viewRange: ['cover 0%', 'cover 100%']`).
  - Only `transform`, `opacity`, `filter` and `clip-path` are animated (plus a constant `transform-origin`); reduced motion shows the element without moving it.
- Presets may carry **intermediate keyframes** (`frames: [{ offset, …props }]`, optional per-keyframe `easing`), played between `from` and `to` by the JS and native engines and reversed for `exit`. Custom `{ from, to, frames }` animations work too.
- `registerPresets(map)` and `reversePreset(p)` in the main entry. `PRESETS` is now one table per page shared through `Symbol.for('use-scroll-animate.presets')`, so the ESM entries, the UMD bundle and the extended set see each other's presets.
- `<usa-reveal effect>` / `<usa-stagger effect>` accept any registered preset name (their own effects keep priority).
- Types: `CorePreset`, `ExtendedPreset` (`AnimationPreset` = both), `PresetKeyframes`, `AnimationFrame`.

### Showcase
- The Animation Store lists all 214 presets (**227 items**, up from 46) in 14 preset categories with filter chips, live demos and copy-paste code; extended presets add the `presets/extended` import (or the CDN script) to every code tab. Scroll-linked presets demo on the native view timeline; stagger-ready presets demo on a row of items; the keyframes panel shows intermediate keyframe counts. The demo page loads the extended set too.

### Docs
- New `docs/presets.md` (every preset by category), README (EN / 中文 / 日本語) "Scroll presets 2.0" section, API reference, `<usa-reveal>` docs. `docs/ROADMAP.md`: 6.1 is Scroll presets 2.0; the previous 6.1–6.9 plans move to 6.2–6.10.

### Tests
- New `test/presets-extended.test.ts`: every preset (core + extended) has interpolable keyframes (same properties and function lists from → frames → to, GPU-friendly properties, ordered offsets), type union / categories in sync, shared registry (ESM + UMD source), frames through `observe()`, reduced motion, `<usa-reveal>` lookup, store count ≥ 160, recipes and generated code.

## [6.0.1] - 2026-10-08

### Fixed
- **Showcase — components gallery overflowed phones horizontally (~48 px at 390 px wide).** The header's six nav items (Store · Playground · Story · language · theme · GitHub) could not shrink, so the whole page scrolled sideways and the scroll-progress bar ran past the edge. On screens ≤ 480 px the bar now shrinks and tightens to one row (the sticky filter bar keeps its offset): the duplicate “Animation Store” link is hidden (the logo already links to the store) along with the “Components” badge, and below 375 px the GitHub icon moves to the footer link only. Checked in headless Chromium at 320 / 360 / 390 / 414 / 480 px in English and Chinese: `scrollWidth` equals the viewport width and every remaining header control is on screen.
- Crawl of all showcase pages (`/showcase/`, `components.html`, `playground.html`, `story.html`, desktop 1280 px + mobile 390 px): no other console errors, failed requests or overflow found.

### Tests
- New `test/fixes-6-0-1.test.ts` regression suite.

## [6.0.0] - 2026-10-08

### ⚠ BREAKING CHANGES
- **Removed `burst()`, `confetti()`, `shake()`** from `use-scroll-animate/components`, `/components/click` and the UMD global (deprecated in 5.9). Play the registered effects instead: `playEffect(document.body, 'burst', { x, y, …options })`, `playEffect(el, 'confetti', options)`, `playEffect(el, 'shake', { intensity, duration })` (`use-scroll-animate/components/fx`). `haptic()` stays.
- **Removed `<usa-cursor mode="trail">`** (deprecated in 5.9): `CURSOR_MODES` is now `dot` · `magnetic` · `glow`, and an unknown mode renders as `dot`. Use the 5.7 `comet-trail` effect: `<usa-fx effect="comet-trail" trigger="load" self>…</usa-fx>`.
- Every effect now goes through the 5.0 registry (`registerEffect()` / `playEffect()` / `bindEffect()` / `<usa-fx>`); the 5.1–5.9 packs live in `use-scroll-animate/components/effects`.

### Migration
- `npx usa-codemod-6 --write src` rewrites the helper calls and imports (aliases and the `UsaComponents` global included) and lists `<usa-cursor mode="trail">` for a manual edit. Guide: `docs/upgrading-6.md`.
- CDN URLs move to the `@6` range: `https://unpkg.com/use-scroll-animate@6/dist/components.umd.js`.

### Docs
- README (EN / 中文 / 日本語): new **Effect packs** (`/components/effects`) row.
- `docs/ROADMAP.md`: post-6.0 roadmap (v6.1 → v7.0).

## [5.9.0] - 2026-10-08

### Added
- **`<usa-player>`** (`use-scroll-animate/components/effects`, `definePlayer()`) — plays JSON animations (`format: "use-scroll-animate/animation"`, `version: 1`): tracks with a `target` selector, `start` / `duration`, and a timeline `preset`, your own `keyframes` + `easing`, or any registered `effect` fired at `start`. Source: `src="…json"` or an inline `<script type="application/json">`. `trigger="load | view | scroll | click | manual"` (`scroll` scrubs with the page), `loop`, `rate`, `controls`; methods `play()`, `pause()`, `seek(ms)`, `load(json)`; events `usa-player-ready`, `usa-player-finish`; `data-error` on bad input.
- `createPlayer(root, animation, { autoplay, loop, rate })` → `{ play, pause, seek, rate, duration, currentTime, playing, finished, destroy }` — keyframe tracks are WAAPI animations driven by one clock; `normalizeAnimation()` validates (and reads Playground presets too).
- Playground: new **`<usa-player> JSON`** export tab (`tracksToAnimation()`).
- The registered `burst` effect accepts `x` / `y`.
- `docs/upgrading-6.md` and **`npx usa-codemod-6 [--write] [paths]`**.

### Deprecated (removed in 6.0 — warned once in the console)
- `burst()`, `confetti()`, `shake()` (components / components/click entries, UMD global) → `playEffect(el, 'burst' | 'confetti' | 'shake', …)` — the codemod rewrites calls and imports.
- `<usa-cursor mode="trail">` → the 5.7 `comet-trail` effect (`<usa-fx effect="comet-trail" trigger="load" self>`) — reported by the codemod for a manual edit.

### Accessibility
- Under reduced motion `<usa-player>` jumps to the final state and fires no effects.

## [5.8.0] - 2026-10-08

### Added
- **Theme packs** (`use-scroll-animate/components/effects`): `neon`, `paper`, `glass`, `retro`, `brutalist` — each = design tokens (`--usa-theme-bg|fg|accent|accent-2|surface|border|radius|shadow|font`), motion tokens merged over the motion scale, and effect presets per role (`enter`, `hover`, `click`, `attention`, `background`). API: `THEMES`, `applyTheme(name, root?)` (on `<html>` also activates the motion tokens; on an element scopes them; returns an undo), `themeVars()`, `themeCss(name, selector?)` for static / SSR CSS, `themePreset(name, role)`, `playThemeEffect(el, role)`. Helper classes `.usa-surface`, `.usa-accent`.
- `<usa-theme name="…">` — a themed subtree; children with `data-theme-fx="click | hover | enter | attention"` get that role's preset.
- Theme effects: `neon-flicker` (dims, never blacks out; < 3 flashes / s), `paper-fold`, `glass-shine`, `retro-scanlines` (static under reduced motion), `brutal-shift`.
- **23 micro-interactions** (`MICRO_FX`, `registerMicroEffects()`), each doing the UI work as well as the motion: `copy-success` (clipboard + "Copied ✓"), `toggle-morph`, `password-reveal`, `favorite-star`, `like-heart`, `bookmark-flip` (all `aria-pressed`), `download-progress` / `submit-loading` (`aria-busy`, `usa-done`), `send-plane`, `add-to-cart`, `counter-bump`, `upvote`, `clap`, `emoji-react`, `refresh-spin`, `trash-shake` (`remove: true`), `check-toggle` (`aria-checked` on `role=checkbox`), `input-shake` (`aria-invalid`), `error-flash`, `success-check`, `nudge-hint`, `focus-pulse`, `notify-badge`. Helpers `togglePressed()`, `swapLabel()`, `bumpCount()`.
- Showcase: **Micro-interactions** and **Theme packs** cards.

### Accessibility
- State changes (pressed, busy, invalid, counts, labels via a polite live region) happen with or without motion; under reduced motion only the animation is dropped.

## [5.7.0] - 2026-10-08

### Added
- **Cursor pack** (`use-scroll-animate/components/effects`, `registerCursorEffects()`, `CURSOR_FX`, kind `cursor`, persistent, scoped to the bound element): `comet-trail` (`color`, `width`, `life`), `ribbon-trail` (rainbow, `width`, `life`), `sparkle-trail` (`colors`, `spacing`, `size`), `magnetic-dots` (dot grid behind the content leaning toward the pointer; `gap`, `radius`, `color`), `spotlight-cursor` (eased soft light; `color`, `size`, `ease`). Trails draw on one fixed, pointer-transparent overlay canvas that only animates while a tail is fading. Mouse / pen only by default — `touch: true` opts touch in.
- **Gestures → effects**: `bindGesture(el, 'fling' | 'twist' | 'long-press', effectNameOrCallback, { velocity, angle, duration, tolerance, effectOptions })` — fling = fast release (px/ms, with direction), twist = two-finger rotation past `angle`° (`cw` / `ccw`), long press charges `--usa-charge` 0 → 1 (`data-charging` while charging) and fires when full; moving cancels. Every fire dispatches `usa-gesture`. Pure helpers `flingVelocity()`, `angleDelta()`.
- `<usa-gesture-fx gesture effect options velocity angle duration [self]>` — plays the effect on its first child.
- Showcase: **Cursor trails** and **Gesture triggers** cards.

### Accessibility
- Cursor effects are skipped under reduced motion; gesture-fired effects go through `playEffect()`, which applies reduced motion. Gestures only add effects — they never replace a click / keyboard action.

## [5.6.0] - 2026-10-08

### Added
- **Sound-reactive pack** (`use-scroll-animate/components/effects`, `registerAudioEffects()`, `AUDIO_FX`, kind `background`): `spectrum-bars` (`bars`, `gap`, `mirror`), `pulse-ring` (`rings`, `color`), `wave-ring` (`color`, `amplitude`) — Canvas 2D on the 5.5 `canvasBackground()` runner (visible-only, adaptive quality); they idle gently until audio is enabled.
- `enableAudio(input)` — analyse the microphone (`'mic'`), an `<audio>` / `<video>` element or selector, or a `MediaStream` through one shared Web Audio analyser. Must be called from a user gesture (the context is resumed there). The microphone is never routed to the speakers and is released on `stop()`; media stays audible after `stop()`. Also `disableAudio()`, `getAudio()`, `sample()` → `{ level, bass, freq, wave }`.
- Beat detection: `createBeatDetector({ threshold, cooldown, history, floor })` (pure), `onBeat(cb)`, and `bindBeat(el, effect, options)` — plays **any registered effect** on every beat.
- `<usa-audio source="#track | mic" label="…">` — renders (or uses your `[data-audio-toggle]`) an `aria-pressed` toggle button; children with `data-usa-beat="effect"` (`data-usa-beat-options` JSON) play that effect on beats; events `usa-beat`, `usa-audio-error` (`data-audio-error` on the host).
- While audio runs, `--usa-audio-level` / `--usa-audio-bass` (0–1) are set on `<html>` for CSS-driven reactions.
- Showcase: **Sound-reactive backgrounds** and **Beat-triggered effects** cards.

### Accessibility
- Audio only starts from a user gesture. Under reduced motion the visual effects are skipped, beats trigger no effects and the CSS variables stay at 0 (sound keeps playing).

## [5.5.0] - 2026-10-08

### Added
- **Generative backgrounds pack** (`use-scroll-animate/components/effects`, `registerGenerativeEffects()`, `GENERATIVE_FX`, kind `background`): `flow-field`, `voronoi`, `mesh-gradient`, `starfield`, `metaballs`, `contours` — Canvas 2D, options `colors`, `background`, `speed`, `quality` plus per-effect knobs (`count`, `seeds`, `blobs`, `stars`, `balls`, `levels`, `cell`…).
- `canvasBackground(el, ctx, { init, draw }, options)` — the shared runner, exported for custom generative effects: an `aria-hidden`, pointer-transparent canvas behind the content (`isolation: isolate`), renders only while visible (IntersectionObserver) and the tab is shown, resizes with the element, and adapts quality (render scale 0.35–1 drops on sustained slow frames, recovers on fast ones). Helpers `noise2()`, `hexRgb()`.
- Showcase: **Generative backgrounds** card (switch between all six).

### Accessibility
- Under reduced motion each background draws one static frame and never loops; canvases are `aria-hidden` and never take pointer events.

## [5.4.0] - 2026-10-08

### Added
- **`<usa-story template="…">`** (`defineStory()` from `use-scroll-animate/components/effects`; `defineEffectElements()` defines every element of the entry) — six scroll-storytelling templates:
  - `pin` — a sticky `[data-stage]` while `[data-step]` sections scroll past; the active step gets `data-active`, the stage `data-active-step="<i>"`.
  - `gallery` — a horizontal `[data-track]` slides sideways as you scroll down.
  - `zoom` — zoom-through: the stage scales up to `zoom="6"` and fades.
  - `compare` — before / after wipe driven by scroll, with a draggable, keyboard-accessible handle (`role="slider"`, ←/→, Shift for ×5, Home/End).
  - `counter` — `[data-count="12,480"]` numbers count up on entering view (separators, decimals, prefix / suffix kept).
  - `highlight` — the paragraph (or `[data-step]`) crossing the viewport center is highlighted.
- Every template sets `--usa-story-progress` (0–1), exposes `progress` / `step` / `update()` and fires `usa-story-step`. Helpers: `storyProgress(el)`, `formatCount(target, t)`, `STORY_TEMPLATES`.
- Showcase: new **[Scroll stories](./showcase/story.html)** page with all six templates full-page; gallery cards **Story: before / after**, **Story: data counters**, **Story: step highlight**. Gallery code tabs import from the card’s own entry.

### Accessibility
- Under reduced motion nothing slides or zooms (the gallery stacks vertically), counters show their final values immediately; counted numbers carry the final value as `aria-label`.

## [5.3.0] - 2026-10-08

### Added
- **Page-wide pack** (`use-scroll-animate/components/effects`, `registerPageEffects()`, `PAGE_FX`):
  - Transitions — `curtain`, `iris` (closes on the click point), `pixel-dissolve` (`cols` × `rows`), `blinds` (`slats`). Each covers the viewport, awaits `onCovered()` (swap your route / content there), optionally `hold`s, then reveals; `playEffect()` resolves when the page is visible again.
  - Persistent — `velocity-skew` (skews with scroll speed, eases back), `spotlight` (dims everything but a circle at the pointer), `edge-glow` (lights the viewport edge you scroll toward).
- Showcase: **Page transitions** and **Velocity skew & edge glow** cards.

### Accessibility
- Transition layers are `aria-hidden`; under reduced motion every transition becomes a 150 ms cross-fade that still calls `onCovered()`. `velocity-skew`, `spotlight` and `edge-glow` don’t run under reduced motion.

## [5.2.0] - 2026-10-08

### Added
- **Bounce & physics pack** (`use-scroll-animate/components/effects`, `registerPhysicsEffects()`, `PHYSICS_FX`): `bounce-in` (spring overshoot), `rubber-band`, `elastic-hover` (springy lift, persistent), `drop-bounce` (gravity + restitution), `gravity-text` (per-character drop, keeps `aria-label`), `spring-follow` (element springs toward the pointer), `bell-swing` (damped swing from the top).
- Physics helpers: `solveSpring({ stiffness, damping, mass, steps })` → progress samples + settle time, `springKeyframes(map, spring)`, `bounceKeyframes(restitution, steps)` — physical motion that still runs on the Web Animations API.
- Showcase: **Bounce & physics**, **Gravity text** and **Elastic hover & spring follow** cards.

### Accessibility
- Under reduced motion `bounce-in` / `drop-bounce` become a short fade; `rubber-band`, `bell-swing`, `gravity-text`, `elastic-hover` and `spring-follow` don’t move.

## [5.1.0] - 2026-10-08

### Added
- **New entry `use-scroll-animate/components/effects`** — the 5.x effect packs, all registered through `registerEffect()` and playable with `playEffect()`, `bindEffect()` or `<usa-fx>`: `registerAllEffects()`, `registerCardClickEffects()`, `EFFECT_PACKS`, `CARD_FX`, `CLICK_FX`, `fxLayer()`. Kept out of `components` / `components/lite` (lite stays under its 70 KB budget); the UMD bundle registers every pack.
- **Card effects 2.0**: `holo` (holographic foil + 3D tilt following the pointer), `glare-sweep`, `book-open`, `card-fan`, `topple`, `float-tilt`.
- **Click effects 2.0**: `shockwave`, `ink-splash`, `star-burst`, `jelly-press`, `ring-ripple`, `emoji-rain` — particles spawn from the click point in a fixed, `aria-hidden`, pointer-transparent layer.
- Showcase: **Holographic card**, **Card moves** and **Click effects 2.0** cards in the Effects category (code tabs import `components/effects`).

### Changed
- `bindEffect()` — a persistent effect (one that returns a cleanup) now *replaces* its previous run on re-trigger instead of stacking; every effect kind honours `reduced`.

### Accessibility
- Under reduced motion particles are skipped, presses fade instead of squashing, loops don’t start, `holo` keeps a static sheen.

## [5.0.0] - 2026-10-08

### ⚠ BREAKING CHANGES (see [docs/upgrading-5.md](./docs/upgrading-5.md); `npx usa-codemod-5 --write src`)
- **Modern-browser baseline**: Custom Elements, Web Animations, IntersectionObserver, ResizeObserver and constructable stylesheets are required (Chrome / Edge ≥ 111, Safari ≥ 16.4, Firefox ≥ 115, WebView2, Electron ≥ 24). The `experimental-webgl` context is no longer requested. View Transitions and scroll-driven animations remain progressive.
- `motionIntensity: 'off'` / `setMotionIntensity('off')` removed (ignored at runtime) → `motionSensitivity: 'minimal'`. `MotionIntensity` is `'low' | 'normal' | 'high'`; `MOTION_SCALE` has no `off`.
- `reducedMotion: 'no-preference'` removed (treated as `'user'`) — the OS setting is always honoured.
- `<usa-timeline scrub="js">` removed — `scrub` picks the JS engine automatically; `smooth="…"` opts into smoothing.
- Category entries (`use-scroll-animate/components/<category>`) no longer re-export `configureComponents`, `prefersReducedMotion`, `ComponentsConfig`, `UsaElement` — import them from `use-scroll-animate/components`.

### Added
- **Unified plugin-style effect registration** — new category `use-scroll-animate/components/fx`: `registerEffect({ name, kind, defaults, reduced, run })`, `registerEffects()`, `playEffect(el, name, options)`, `bindEffect(el, name, { trigger: 'click' | 'hover' | 'enter' | 'load' | 'loop' | 'manual' })`, `listEffects(kind?)`, `getEffect()`, `hasEffect()`, `EFFECT_KINDS`, `EFFECT_TRIGGERS`. Effects receive a context whose `animate()` applies reduced motion, motion sensitivity, intensity and the animation budget.
- **`<usa-fx effect="…" trigger="…">`** plays any registered effect on its child.
- **Built-in effects** (`BUILTIN_EFFECTS`): every timeline preset as an `enter` effect; attention seekers `pulse` · `pop` · `jelly` · `wiggle` · `heartbeat` · `bounce` · `flash` · `tada` · `shake`; click effects `burst` · `confetti` · `ripple`.
- `animateWithMotion(el, frames, options)` — the shared motion-aware `animate()` used by elements and effects.
- `<usa-motion-switch>` keeps its Off button (now motion sensitivity `minimal`); `setMotionLevel()`, `getMotionLevel()`, `MotionSwitchLevel`.
- Showcase: new **Effects (plugin API)** category — attention seekers, click effects, scroll entrances, `registerEffect()` live demo.
- **[docs/ROADMAP.md](./docs/ROADMAP.md)**: the 5.1 → 6.0 plan (card & click 2.0, bounce physics, page-wide, scroll storytelling, generative backgrounds, sound-reactive, cursor & gesture packs, theme packs & micro-interactions, JSON animation player, 6.0 cleanup).
- CDN examples now use `use-scroll-animate@5`.

## [4.9.0] - 2026-10-08

### Deprecated (removed in 5.0 — each warns once in the console)
- `configureComponents({ motionIntensity: 'off' })` and `setMotionIntensity('off')` → `motionSensitivity: 'minimal'` / `setMotionSensitivity('minimal')`. (`<usa-motion-switch>`'s Off button and restoring a saved level stay silent.)
- `configureComponents({ reducedMotion: 'no-preference' })` → removed; the OS setting is always honoured (`'user'` / `'reduce'`).
- `<usa-timeline scrub="js">` → `scrub` (automatic JS fallback) + `smooth="…"`.
- `configureComponents` / `prefersReducedMotion` / `ComponentsConfig` / `UsaElement` imported from category entries → import from `use-scroll-animate/components`.

### Added
- **Codemod** `npx usa-codemod-5 [--write] [paths…]` (new `bin`): rewrites all of the above in `.js/.ts/.jsx/.tsx/.vue/.svelte/.html/.astro` files; dry run by default.
- **[docs/upgrading-5.md](./docs/upgrading-5.md)** — removals, the 5.0 modern-browser baseline, what's new.
- `baselineReport()` / `warnBaseline()` (`components/a11y`): which 5.0-required (Custom Elements, WAAPI, IntersectionObserver, ResizeObserver, adoptedStyleSheets) and progressive (View Transitions, scroll-driven animations, WebGL) features this browser has.
- `withoutDeprecations(fn)` for library-internal calls.

## [4.8.0] - 2026-10-08

### Added
- **GPU particle presets** on `glQuad()` for `<usa-shader preset="…">`: `snow`, `fireflies`, `stars` (warp starfield), `bokeh`, `rain` — procedural in one fragment shader (no buffers, no per-particle JS). `PARTICLE_PRESETS`.
- **`<usa-post-fx effects="…" intensity="0.6">`** — chainable GPU post-processing over an `<img>`: `vignette` · `grain` · `chromatic` · `scanlines` · `crt` · `bloom` · `pixelate` · `duotone` · `glitch`. `POST_EFFECTS`, `postFxShader(list)` for your own `glQuad()`.
- **Unified WebGL fallback** — every preset has a still CSS rendering (`GL_FALLBACKS`, `glFallbackCss()`; `--usa-gl-fallback` on `<usa-shader>`), post-fx images get an approximate CSS filter (`--usa-gl-filter`).
- **Battery / fps adaptive quality** for all GL elements: resolution steps 100 % → 50 % → 35 % after two slow seconds (< 40 fps) and back after five good ones; battery saver (≤ 20 % and discharging, or Save-Data) caps at 30 fps and ≤ 60 % resolution. `quality="high"` opts out; `data-quality` reflects the scale. `glGovernor()`, `watchPowerSaver()`.
- `glQuad().render({ extra })` sets any float uniform; `resize(scale)` scales the drawing buffer.
- Showcase: **GPU particles** and **Post-processing** cards (Canvas & WebGL). All new shaders verified to compile in Chromium (SwiftShader).

## [4.7.0] - 2026-10-08

### Added
- **Native shell bridges** — new entry `use-scroll-animate/components/bridge` (also on `UsaComponents` in the UMD build): `connectNativeShell()` syncs the host app's **reduce motion**, **light / dark / high-contrast theme** and **accent color** (and optional motion-sensitivity level) into every `<usa-*>` component. JSON protocol `usa:ready` / `usa:request-settings` / `usa:settings` over WebView2 web messages, `window.postMessage` or `window.usaNative.apply()`; incoming values validated. Helpers `detectNativeHost()`, `postToNative()`, `parseNativeSettings()`, `applyNativeSettings()`; event `usa:native-settings`.
- **Official samples** in [examples/native](./examples/native/): **WinUI 3** (`UISettings.AnimationsEnabled`, accent, high contrast → `PostWebMessageAsJson`), **.NET MAUI** (Android animator scale, iOS Reduce Motion, Windows `UISettings`, `RequestedThemeChanged` → `EvaluateJavaScriptAsync`), **Flutter** (`MediaQuery.disableAnimations`, brightness, high contrast via a `UsaBridge` JavaScriptChannel), sharing one web page.
- Showcase: **connectNativeShell()** card (Page & app-wide) — simulate host messages on a demo tile.
- Docs: "Native shell bridge" in [docs/hybrid-apps.md](./docs/hybrid-apps.md).

## [4.6.0] - 2026-10-08

### Added
- **Playground 2.0** ([showcase/playground.html](https://harrisoncn.github.io/Motionary/showcase/playground.html)):
  - **Keyframe track editor** — one lane per timeline step on a ms ruler; drag a bar to move it, drag its right edge to change duration (50 ms snapping), arrow keys (Shift = resize) for keyboard users; preset, label, start and duration fields; **Play timeline** previews it with a real `<usa-timeline>`.
  - **Save / share presets** — named presets in localStorage, share links now carry the tracks (old links still open), portable preset JSON (`Copy preset JSON` / `Import JSON…`).
  - **Export as `<usa-timeline>`** — new code tab with declarative markup (`data-tl`, absolute `data-at`, `data-duration`) plus the `defineTimeline()` import.
- `showcase/playground-core.js`: `newTrack`, `normalizeTracks`, `tracksDuration`, `trackBar`, `dragTrack`, `timelineMarkup`, `listPresets` / `savePreset` / `loadPreset` / `deletePreset`, `presetToJSON` / `presetFromJSON` (pure, unit-tested).

## [4.5.0] - 2026-10-08

### Added
- **Shared rAF scheduler** — every component loop now runs on one `requestAnimationFrame` per frame (batched, ordered; a throwing callback no longer starves the others). New entry `use-scroll-animate/components/perf`: `onFrame(fn)`, `schedulerStats()`.
- **Animation budget & auto-degrade** — `setAnimationBudget(n)` / `animationBudget()` / `activeAnimations()`; `autoDegrade({ minFps, maxActive, sample, patience, recovery, onChange })` steps motion to `low` and halves the budget while fps drops or too many animations run, restores when frames recover, dispatches `usa:degrade`.
- **On-demand CSS** — new entry **`use-scroll-animate/components/lite`**: the whole library without inlined CSS; each category's `dist/components/<cat>.css` is linked the first time one of its elements connects. **≈ 62 KB gzip** for everything (vs ≈ 79 KB), CI budget **≤ 70 KB**. `onDemandStyles(base)`, `loadCategoryStyles(cat, base)`, `categoryOf(tag)`, `loadedStyles()`.
- Showcase: **autoDegrade()** card (Page & app-wide) — stress 120 animations, toggle a budget, watch scheduler stats.
- Docs: [docs/performance.md](./docs/performance.md).

## [4.4.0] - 2026-10-08

### Added
- **Accessibility toolkit** — new entry `use-scroll-animate/components/a11y` (also re-exported from `use-scroll-animate/components`):
  - **Motion-sensitivity levels** `setMotionSensitivity('full' | 'gentle' | 'minimal' | 'static', persist?)`, `restoreMotionSensitivity()`, `getMotionSensitivity()`, `motionAllowed(kind)`, `MOTION_SENSITIVITY`. `gentle` strips spins, zooms, skews and 3D from every component animation (vestibular-safe); `minimal` = fades only; `static` = no animation at all (also stops page CSS animations). `configureComponents({ motionSensitivity })` and `adaptKeyframes(frames, level)` for your own WAAPI code.
  - **Static alternatives** — `STATIC_ALTERNATIVES` documents the static rendering of every category; `staticAlternative(root)` freezes a subtree at its final state.
  - **aria-live conventions** — one shared polite (`role="status"`) and one assertive (`role="alert"`) region; `announce(message, { politeness, dedupe })`, `liveRegion()`.
  - **`auditMotionA11y(root)`** — focusable-in-`aria-hidden`, unnamed widget roles, sliders without `aria-valuenow`, `<img>` without `alt`, assertive regions outside alerts, endless animations without a motion control (WCAG 2.2.2).
- **Automated a11y regression tests**: every `<usa-*>` element is mounted at all four sensitivity levels and audited (`test/a11y-regression.test.ts`).
- Showcase: **setMotionSensitivity()** card (Page & app-wide) — replay a spin-zoom entrance at each level, announce, audit the page.
- Docs: levels, static alternatives, live-region conventions and the audit in [docs/accessibility.md](./docs/accessibility.md).

### Fixed
- `<usa-cursor>` under reduced motion / on touch no longer keeps author content inside its `aria-hidden` host (found by the new audit).

## [4.3.0] - 2026-10-08

### Added
- **`splitText(el, { by: 'char' | 'word' | 'line' })`** in `use-scroll-animate/components/text` — `Intl.Segmenter`-aware splitting (emoji / grapheme clusters, Chinese & Japanese word boundaries), Arabic-script words kept whole so shaping survives, RTL aware, inline markup preserved; returns `{ units, chars, words, lines, revert() }`. Lines are re-measured on resize.
- **`splitTimeline(el, options)`** — turns the split units into a `timeline()` (preset, stagger, duration, easing tokens) with `from: 'start' | 'end' | 'center' | 'edges' | 'random'`; `.play()` or `.scrub(section)`.
- Helpers `splitOrder()`, `graphemes()`, `splitWords()`, `JOINING_SCRIPT`.
- `<usa-split-text>` upgraded: `by="lines"` and `from="center|edges|end|random"` attributes, now built on `splitText()`.
- Showcase: **splitText()** card (Text) — Latin + emoji, Chinese and Arabic RTL lines, replay from start / center / edges / random.

## [4.2.0] - 2026-10-08

### Added
- **Motion design tokens** — new entry `use-scroll-animate/components/tokens` (also re-exported from `use-scroll-animate/components`): one duration / easing / spring scale as CSS custom properties (`--usa-duration-fast`, `--usa-easing-emphasized`, `--usa-spring-bouncy-stiffness`…), W3C Design Tokens (DTCG) JSON and JS values.
  - `MOTION_TOKENS` (durations `instant`→`slowest`, easings `standard` · `emphasized` · `decelerate` · `accelerate` · `spring` · `bounce`, springs `gentle` · `snappy` · `bouncy` · `wobbly` · `stiff`).
  - `applyMotionTokens(partial?, root?)` (writes the vars, sets the active scale, returns undo), `motionToken()`, `motionVar()`, `getMotionTokens()`.
  - `importMotionTokens(json)` reads **Figma Tokens / Tokens Studio** (`value` / `type`), **Style Dictionary** (nested `value`) and **DTCG** (`$value` / `$type`, incl. `transition` composites) exports; `motionTokensToCss()`, `motionTokensToVars()`, `motionTokensToJSON()`.
  - Prebuilt `docs/motion-tokens.css` and `docs/motion.tokens.json`; guide in [docs/motion-tokens.md](./docs/motion-tokens.md).
- `timeline()` steps and defaults accept token names: `{ duration: 'slow', easing: 'spring' }`.
- Showcase: **applyMotionTokens()** card (Page & app-wide) — play a stagger at `fast` / `normal` / `slow` with any easing token.

## [4.1.0] - 2026-10-08

### Added
- **Native scroll-driven scrub** — `timeline().scrub(el)` now runs on the browser's `ViewTimeline` (default; `el` moving through the viewport, range `cover`) or `ScrollTimeline` (`{ source: 'scroll' }`; `el` is the scroll container) when available. Each step becomes one scroll-driven animation over its slice of the range, so the playhead is driven off the main thread with no per-frame JS.
- `scrub()` options: `source` (`'view'` · `'scroll'`), `engine` (`'auto'` · `'native'` · `'js'`), `axis` (`block` · `inline` · `x` · `y`). The returned stop function carries `.native`.
- `supportsNativeScrub(source?)` (main entry and `components/timeline`); `ScrubHandle` type.
- `<usa-timeline scrub>` uses the native engine (sets `data-native`); `scrub="scroll"`, `scrub="js"` and `smooth="0.2"` tune it.
- JS fallback (rAF-throttled scroll listener) for browsers without scroll-driven animations and whenever JS is needed: `smooth`, `offset`, `call()` cues, `onUpdate`, `engine: 'js'`. The fallback now also supports `{ source: 'scroll' }` and horizontal axes.
- Showcase: **supportsNativeScrub()** card — a scroll box scrubbing a three-step timeline, showing which engine runs it (verified in Chromium: native ScrollTimeline).

### Changed
- `<usa-timeline scrub>` no longer smooths by default (`smooth` was 0.2) so it can run natively; add `smooth="0.2"` for the previous feel.

## [4.0.1] - 2026-10-08

### Fixed
- **`<usa-mask-reveal>` never revealed in Chromium** (trigger `view`): Chromium's IntersectionObserver honours the target's own `clip-path`, so a fully clipped element never reported as intersecting. It now waits hidden with `opacity: 0`, and the clip-path animation uses `fill: 'both'` so the closed mask also covers the `delay`.
- **`<usa-timeline trigger="click">` was invisible until first clicked** — it now shows the finished composition and replays from the start on click, `Enter` or `Space` (focusable by default).
- **WebGL elements (`<usa-shader>`, `<usa-distort>`, `<usa-liquid>`)** only resized their canvas on window resize; they now follow their own size with a `ResizeObserver` (grid reflow, card expand, sidebars).
- **`<usa-handwriting>`** keeps its intrinsic size when a page has a global `svg { width: … }` icon rule.
- **Solid:** the `use:usa` directive (`components/solid`) and the `use:scrollAnimate` directive (`/solid`) now track their accessor with `createRenderEffect` — signals update props / options / handlers without calling `refresh()`; listeners are removed on cleanup.
- **Showcase (checked in headless Chromium at 1280 px and 390 px):** demo SVGs (line drawing, handwriting, `morphTo()`) were squashed to 20 px by the showcase's global icon rule; the pinch-zoom and mask-reveal demos used undefined CSS classes (text overflowed the tile); the header hid the Playground / Store links on phones; deep links to `#c-carousel-3d` (ids with digits) did not resolve; the playground's copy / share buttons threw an unhandled rejection when clipboard access was denied and gave no feedback; stale “v2” / “v3.0” kickers and a Chinese phrase in the English category text.

### Tests
- New `test/fixes-4-0-1.test.ts` regression suite; `<usa-mask-reveal>` and Solid adapter tests updated.

## [4.0.0] - 2026-10-07

4.0 completes the 3.x release train by consolidating overlapping APIs. Every removal has a drop-in replacement that shipped during 3.x — see **[Upgrading to 4.0](./docs/upgrading-4.md)** (run your app on 3.9 first: it warns once wherever removed APIs are used).

### ⚠ Breaking changes
- **`sequence()` removed** from `use-scroll-animate` → use **`timeline()`**, now also exported from the root entry (`import { timeline } from 'use-scroll-animate'`, `ScrollAnimate.timeline` in the UMD build) alongside `resolvePosition` and `TIMELINE_PRESETS`. `SequenceStep` / `SequenceOptions` / `SequenceController` types removed (use `Timeline`, `TimelineOptions`, `TimelineStepOptions`).
- **`connectedAnimation()` removed** from `components/transitions` → use **`sharedTransition(update)`** with `data-shared="id"` (`components/layout`; View Transitions API + FLIP fallback). `ConnectedOptions` type removed.
- **`<usa-flip-list>` / `defineFlipList()` removed** from `components/transitions` → use **`<usa-auto-animate>` / `autoAnimate()`** (`components/layout`), which also animates additions, removals and size changes. `flip()` stays.
- CDN snippets in docs and the showcase now point at `use-scroll-animate@4`.

### Changed
- The Animation Store's timeline recipe, the vanilla example, README (EN / 中文 / 日本語), API docs and the AOS / GSAP migration guides use `timeline()`.
- The component gallery's transitions category shows a `flip()` demo instead of the removed helpers.

### Docs
- New **[docs/upgrading-4.md](./docs/upgrading-4.md)** (step-by-step migration with before / after code).
- New **[docs/ROADMAP.md](./docs/ROADMAP.md)** — the post-4.0 plan (v4.1 → v5.0).

### Migration
| 3.x | 4.0 |
|---|---|
| `sequence([{ target: '.a' }, { target: '.b', gap: -200 }], { trigger: '.hero' })` | `timeline().to('.a', 'fade-up').to('.b', 'fade-up', { at: '-=200' })` + play on view / `scrub()` |
| `connectedAnimation(thumb, detail)` | `sharedTransition(() => { … })` with `data-shared="id"` on both |
| `<usa-flip-list>` | `<usa-auto-animate>` |

npm: **4.0.0 is published as `latest`**; 3.x remains installable as `use-scroll-animate@3`.

## [3.9.0] - 2026-10-07

### Added
- **Effect packs** — new category `use-scroll-animate/components/packs`: ready-made motion for whole page types. Mark elements with `data-role` and apply a pack with `<usa-pack name="…">` or `applyPack(name, root)` (returns undo):
  - `ecommerce` — `product` (reveal + lift), `add-to-cart` (press + fly to cart), `cart` (bump), `price` (count up), `badge` (pulse)
  - `portfolio` — `project`, `heading`, `stat`, `contact`
  - `dashboard` — `card`, `stat`, `alert`, `action`
  - `game` — `button`, `score`, `item` (float), `hit` (shake), `reward`
  - `landing` — `hero`, `feature`, `cta`, `logo`, `stat`
  - Helpers: `flyToCart(from, to)` (arc flight + cart bump), `countUp(el)` (keeps currency / separators / decimals, accessible label), `PACKS`, `PACK_PRIMITIVES`.
- Reduced motion: packs leave content static (numbers show their final value, no flights / pulses / floats).
- Showcase: new **Effect packs** gallery category with a live demo per pack and a `flyToCart()` demo.

### Deprecated (removed in 4.0)
- `sequence()` → `timeline()` (since 3.1).
- `connectedAnimation()` → `sharedTransition()` (since 3.6).
- `<usa-flip-list>` / `defineFlipList()` → `<usa-auto-animate>` / `autoAnimate()` (since 3.6).

Each logs a one-time console warning linking to the new **[Upgrading to 4.0](./docs/upgrading-4.md)** guide.

## [3.8.0] - 2026-10-07

### Added
- **Svelte** — `use-scroll-animate/components/svelte`: `use:usa={{ props, on }}` action (sets DOM properties, binds `usa:*` events with update / destroy; works in Svelte 3, 4 and 5) and `defineUsa(categories?)` (client-only, SvelteKit-safe).
- **Solid** — `use-scroll-animate/components/solid`: `use:usa` directive (`refresh()` / `destroy()`), `defineUsa()`, `SolidUsaIntrinsicElements` JSX types; native `prop:` / `on:usa:change` documented.
- **Angular** — `use-scroll-animate/components/angular`: `usaInitializer(categories?)` for `APP_INITIALIZER`, `defineUsa()`, `usaDetail($event)`; `CUSTOM_ELEMENTS_SCHEMA` + `[prop]` / `(usa:event)` binding documented. No `@angular/*` import.
- Shared framework-neutral `bindUsa(el, { props, on })` / `usaEventName()` (exported from all three entries).
- **Docs**: new [docs/hybrid-apps.md](./docs/hybrid-apps.md) — .NET MAUI (`HybridWebView`, `BlazorWebView`), Flutter (`webview_flutter` / `flutter_inappwebview`, `JavaScriptChannel`), Electron (context isolation, preload bridge), Tauri v2 (strict CSP, `invoke`), with native ↔ web event bridges and OS reduced-motion mirroring; `docs/frameworks-ssr.md` gains Svelte, Solid and Angular sections.

## [3.7.0] - 2026-10-07

### Added
- **Visual playground** — [`showcase/playground.html`](./showcase/playground.html) (no build, dogfoods `dist/components.js` with a CDN fallback):
  - **Compose**: stack effect layers around a card, button, heading or image — scroll reveal, 3D tilt, magnetic, spring, mask reveal, depth, swipeable, click ripple, shader background, glitch and gradient text — and reorder or remove them.
  - **Tweak**: every attribute has a live control (selects, sliders, toggles); the preview re-renders instantly, with a Replay button.
  - **Export**: HTML (CDN, no build), ES module (per-category imports with the right `define*Components()`), React (JSX via `components/jsx` types) and Vue (`isCustomElement` hint) code, copy to clipboard.
  - **Share**: the composition is encoded in the URL hash (`encodeState()` / `decodeState()`), so a link reproduces it.
  - English / 中文, keyboard accessible controls, honours `prefers-reduced-motion` (shows a notice; effects render their final state).
- Pure, tested playground core in `showcase/playground-core.js` (`PLAYGROUND_EFFECTS`, `composeMarkup()`, `playgroundSnippets()`); the component gallery links to the playground.

## [3.6.0] - 2026-10-07

### Added
- **Layout animation** — new category `use-scroll-animate/components/layout`:
  - `autoAnimate(parent, { duration, easing, scale })` and `<usa-auto-animate>` — zero-config list / grid reflow: added children fade-scale in, removed children fade out in place (as positioned ghosts), moved or resized ones glide with FLIP (sort, filter, insert, container resize); `enable()` / `disable()` / `stop()`.
  - `<usa-masonry>` — masonry grid (`columns` or `min` column width, `gap`): shortest-column placement, items glide when the width, the set of items or their sizes change (ResizeObserver); CSS multi-column before JS runs.
  - `sharedTransition(update, root?, opts)` — shared-element transitions: elements with the same `data-shared="id"` before and after `update()` morph into each other via the View Transitions API (`view-transition-name` assigned per id) with a FLIP fallback.
  - Pure helpers `flipFrames()`, `masonryLayout()`.
- Reduced motion: layout changes apply instantly, masonry does not glide, shared transitions just run `update()`.
- Showcase: new **Layout animation** gallery category (interactive add / shuffle / remove, masonry, shared-element thumbnails → detail).

## [3.5.0] - 2026-10-07

### Added
- **3D & depth** — new category `use-scroll-animate/components/depth`:
  - `<usa-cube>` — CSS 3D cube from up to six children (front, right, back, left, top, bottom): drag / swipe (via `gesture()`), arrow keys, `autoplay` (pauses on hover / focus), `show(face | index)`, `next()`, `prev()`; spring-driven, shortest-path rotation; only the front face is exposed to assistive tech; `usa:change`.
  - `<usa-depth>` — layered depth parallax: `data-depth` (-1…1) layers shift and scale from `source="pointer | orientation | scroll"` (combinable), `strength`, optional scene `rotate`; `requestPermission()` for iOS motion sensors.
  - `deviceTilt(cb, { range, smooth })`, `orientationToTilt()`, `requestOrientationPermission()`, `supportsOrientation()` — device-orientation tilt helpers.
- The 3D ring carousel stays `<usa-carousel-3d>` (in `components/cards`) and is cross-linked from the new category.
- Reduced motion: the cube switches faces instantly with no drag-rotate or autoplay; depth layers stay flat.
- Showcase: new **3D & depth** gallery category (cube, depth scene, gyroscope demo).

## [3.4.0] - 2026-10-07

### Added
- **Canvas & WebGL** — new category `use-scroll-animate/components/webgl` (no three.js; one tiny single-quad runner):
  - `<usa-shader>` — GPU shader backgrounds behind content: presets `gradient`, `plasma`, `waves`, `aurora`, or your own GLSL in `<script type="x-shader/x-fragment">` (uniforms `u_time`, `u_resolution`, `u_mouse`, `v_uv`); `speed`.
  - `<usa-distort>` — hover image distortion with RGB split around the pointer.
  - `<usa-liquid>` — liquid / ripple images: clicks send up to four water ripples through the image, hover wobbles; `strength`.
  - `glQuad(canvas, fragment)` (returns `{ render, resize, texture, dispose }` or `null`), `supportsWebGL()`, `fragmentSource()`, `SHADERS`.
- **Graceful fallback**: without WebGL, when a shader fails to compile, or for a cross-origin image without CORS, the canvas is removed and `data-fallback="webgl | image | no-image"` is set — `<usa-shader>` keeps its CSS gradient, images stay visible (`<usa-distort>` falls back to a CSS hover zoom).
- Performance: renders only while in view and the tab is visible, DPR capped at 2, contexts released on disconnect.
- Reduced motion: a single static frame, no animation loop.
- Showcase: new **Canvas & WebGL** gallery category (shader presets, distortion, liquid image, live `glQuad()` demo) with a generated demo photo in `showcase/assets/`.

## [3.3.0] - 2026-10-07

### Added
- **SVG** — new category `use-scroll-animate/components/svg`:
  - `<usa-draw>` — line drawing for every stroke of the SVG inside (normalised `pathLength`, no `getTotalLength()`): `trigger` (`view` · `hover` · `click` · `scrub`), `duration`, `stagger`, `fill`, `repeat`; `progress`, `play()`, `usa:complete`.
  - `<usa-morph>` — path morph through `paths="A | B | C"` on `click` (keyboard accessible) · `hover` · `view` · `auto`; same-structure paths morph point by point, others switch at the midpoint.
  - `<usa-mask-reveal>` — clip-path mask reveals: `circle`, `diamond`, `star`, `iris`, `wipe`, `wipe-up`, origin `at`, `trigger`, `repeat`.
  - `<usa-anim-icon>` — animated stroke icons (`bell`, `heart`, `check`, `arrow`, `star`, `gear`, `search`, `download`) on hover / focus, click, view or loop; decorative unless `label` is set.
  - Helpers: `morphTo()`, `interpolatePath()`, `pathsCompatible()`, `drawLines()`, `MASK_SHAPES`, `ANIM_ICONS`.
- Reduced motion: drawings appear complete, morphs switch instantly (`auto` does not cycle), masks are not applied, icons stay still.
- Showcase: new **SVG** gallery category (draw, morph, mask, icons, `morphTo()` demo).

## [3.2.0] - 2026-10-07

### Added
- **Gestures** — new category `use-scroll-animate/components/gesture`:
  - `gesture(el, handlers, options)` — one Pointer Events recognizer for **pan** (`dx`, `dy`, `vx`, `vy`, `first`, `last`), **swipe** (direction + velocity), **pinch** (two pointers, or Ctrl/⌘ + wheel / trackpad pinch), **long-press**, **tap** and **double-tap**; `axis` lock keeps native scrolling on the other axis. Release velocities go straight into springs: `spring.set(0, vx)`. Pure helpers `swipeDirection()` and `pinchScale()` are exported.
  - `<usa-swipeable>` — swipe-to-dismiss / swipe actions: follows the finger (rubber-banded past `distance`), flies out on a swipe, springs home otherwise; `axis`, `distance`, `preset`, `dismiss`; Delete / arrow keys; cancelable `usa:swipe`, `usa:dismiss`.
  - `<usa-pinch-zoom>` — pinch / Ctrl + wheel zoom, pan while zoomed, double-tap toggle, springs back inside bounds; `min`, `max`, `double-tap`; `+` / `-` / `0` keys; `usa:zoom`.
- Reduced motion: no follow or fly-out animation (events still fire), zoom changes instantly.
- Showcase: new **Gestures** gallery category with a live `gesture()` + spring demo.

## [3.1.0] - 2026-10-07

### Added
- **Timeline & choreography** — new category `use-scroll-animate/components/timeline`:
  - `timeline()` — one playhead for many WAAPI animations: `.to(target, keyframes | preset, { at, duration, easing, stagger })`, `.label()`, `.call()`, `play()`, `reverse()`, `pause()`, `seek(ms | label)`, `progress(p)`, `scrub(section, { smooth })` and `cancel()`. Positions: `'>'` (chain, default), `'<'` (with previous), `'-=200'` (overlap), `'+=100'` (gap), `'<+=50'`, `'label+=100'` or absolute ms (`resolvePosition()` is exported).
  - `TIMELINE_PRESETS`: `fade`, `fade-up/down/left/right`, `scale`, `blur`, `rotate`, `clip-up`, `clip-right`.
  - `<usa-timeline>` — declarative: `data-tl` children become steps (`data-at`, `data-duration`, `data-label`); `trigger` (`view` · `click` · `manual`), `scrub`, `overlap`, `stagger`, `repeat`; `usa:complete`.
- Reduced motion: timelines jump to their end state, scrub is disabled; without WAAPI the final frames are applied.
- Showcase: new **Timeline & choreography** gallery category (declarative demo + interactive play / reverse / scrub slider).

## [3.0.0] - 2026-10-07

3.0 removes what 2.9 deprecated. Every change has a drop-in replacement — see **[Upgrading to 3.0](./docs/upgrading-3.md)** (run your app on 2.9 first: it warns once wherever old usage is found).

### ⚠ Breaking changes
- **`variant` no longer selects a component's kind.** `<usa-spinner>`, `<usa-check>`, `<usa-dialog>` and `<usa-acrylic>` use **`kind`** (`<usa-spinner kind="windows">`, `<usa-dialog kind="drawer-end">`, `<usa-acrylic kind="mica">`); `variant` on every element now only selects a style variant (`minimal`, `neon`, `glass`, `brutalist`, `fluent`, `material`). The `spinner.variant` property is removed (use `.kind`); internal state attributes are now `data-kind`.
- **Removed the legacy transform-based parallax** of the scroll engine: the `parallax` option of `observe()` / `animate()`, the `data-sa-parallax-x|y|rotate|scale|speed` attributes (also on `<scroll-animate>`) and the `ParallaxOptions` type. Use `parallax(el, { speed })` (writes `translate` + `--sa-parallax`, composes with entrance animations) or `progressVar`.
- **Node ≥ 20** for SSR imports (`engines`); Node 18 is end-of-life.
- CDN snippets in docs and the showcase now point at `use-scroll-animate@3`.

### Changed
- The scroll core is smaller without the legacy parallax path (`progress` tracking now only runs for `onProgress` / `progressVar`).
- `examples/vanilla` uses `parallax()`.

### Migration
| 2.x | 3.0 |
|---|---|
| `<usa-spinner variant="dots">` | `<usa-spinner kind="dots">` |
| `<usa-check variant="error">` | `<usa-check kind="error">` |
| `<usa-dialog variant="sheet">` | `<usa-dialog kind="sheet">` |
| `<usa-acrylic variant="mica">` | `<usa-acrylic kind="mica">` |
| `spinner.variant = 'ring'` | `spinner.kind = 'ring'` |
| `observe(el, { parallax: { y: 80 } })` / `data-sa-parallax-y="80"` | `parallax(el, { speed: 0.2 })` or `progressVar: '--p'` + CSS |

## [2.9.0] - 2026-10-07

### Added
- **React wrappers** `use-scroll-animate/components/react`: `createUsaComponents(React)` returns a typed wrapper for every `<usa-*>` element (`UsaButton`, `UsaCard`, `UsaToggle`, …) that sets properties (`checked`, `value`, `state`, `open`, …), forwards `ref` and maps `onUsaChange` / `onUsaDragEnd`-style props to `usa:*` events (works on React 18 and 19). `USA_TAGS`, `eventName()`, `pascal()`.
- **Vue integration** `use-scroll-animate/components/vue`: `isUsaElement` (`compilerOptions.isCustomElement`) and `UsaPlugin` (`app.use(UsaPlugin, { categories })`).
- **JSX types** `use-scroll-animate/components/jsx`: `UsaIntrinsicElements` / `UsaTag` / `UsaAttributes` to type raw `<usa-*>` tags in React, Preact or Solid JSX.
- **Lazy per-component registration** `use-scroll-animate/components/lazy`: `lazyDefine()` watches the DOM and dynamically imports only the categories whose tags are used (one chunk per category); `defineUsed(root)`, `loadCategory(cat)`, `categoryOfTag(tag)`.
- **Accessibility audit**: automated sweep that mounts every `<usa-*>` element in normal, reduced-motion and motion-`off` modes and checks roles / focusability of interactive elements and `aria-hidden` on decorative layers; [`docs/accessibility.md`](./docs/accessibility.md) (motion, keyboard map, roles & states, transparency).
- **Guides**: [`docs/frameworks-ssr.md`](./docs/frameworks-ssr.md) — Next.js (App Router), Astro (incl. MPA view transitions), Vue / Nuxt, Svelte, Solid, Angular, lazy loading.
- **Theme tokens** documented: `--usa-accent`, `--usa-accent-text`, `--usa-surface`, `--usa-text`, `--usa-radius`, `--usa-border`, `--usa-shadow`, `--usa-blur`, `--usa-font`, `--usa-motion`.
- **Perf benchmark** `npm run bench` (`scripts/bench.mjs`, jsdom: define + mount/unmount N of every element) and size budgets for the new entries.
- **Showcase**: every card's parameter controls now flow into the generated code (HTML / ESM / React / Vue / desktop tabs) so what you tweak is what you copy; category navigation covers all 11 categories.

### Changed
- `COMPONENT_CATEGORIES` lives in a dependency-free module (re-exported unchanged) so the lazy loader and framework helpers do not pull in every component.

### Deprecated (removed in 3.0)
- `variant` as the **kind** selector of `<usa-spinner>`, `<usa-check>`, `<usa-dialog>` and `<usa-acrylic>` → use the new `kind` attribute / `.kind` property (`<usa-spinner kind="windows">`). `variant` is reserved for style variants. Old usage keeps working in 2.x with a one-time console warning.
- The transform-writing `parallax` option of `observe()` / `data-sa-parallax-*` attributes → use `parallax(el, { speed })` (CSS-variable based, composes with entrance transforms) or `progressVar`. One-time console warning.
- See [docs/upgrading-3.md](./docs/upgrading-3.md).

### Deferred
- Pixel-based visual regression tests need real browsers (Playwright) in CI; deferred to a later release (the jsdom suite covers behaviour, ARIA and reduced motion).

## [2.8.0] - 2026-10-07

### Added
- **Text effects** (in `components/text`): `<usa-wave-text>` (travelling letter wave), `<usa-glitch>` (RGB-split slice glitch, always / hover), `<usa-gradient-text>` (flowing multi-colour gradient fill), `<usa-handwriting>` (text draws itself stroke by stroke, then fills; `usa:complete`), `<usa-scroll-highlight>` (words light up as you read down the page, or `mode="marker"` highlighter sweep). Animated copies are `aria-hidden` with a plain screen-reader copy.
- **Backgrounds** (in `components/background`): `<usa-grid-glow>` (line grid lit around the pointer), `<usa-blobs>` (fluid morphing colour blobs), `<usa-water-ripple>` (interactive canvas water ripples, `drop(x, y)`), `<usa-dot-network>` (dot grid that swells and links to the pointer). Canvas effects run only while visible and the tab is shown, DPR ≤ 2.
- **Windows Fluent preset** `fluentPreset({ reveal, mica, selector })` (in `components/background`): `fluent` variant page-wide (Segoe UI Variable, Windows 11 accent, radii), Mica-style window tint, Acrylic on `.usa-acrylic` / `[data-acrylic]`, and **Reveal highlight** on buttons / `[data-fluent-reveal]`; returns an undo function.
- **WinUI 3 + WebView2 sample app** in [`examples/webview2-winui/`](./examples/webview2-winui/) (Windows App SDK, native Mica backdrop, `SetVirtualHostNameToFolderMapping`, `components.umd.js` + `fluentPreset()`), documented in `docs/windows-apps.md`.
- Reduced motion: wave / glitch / gradient flow stop, handwriting and highlights appear complete, backgrounds are static, no Reveal tracking; reduced transparency keeps materials solid.
- Showcase: the new text and background demos in their categories, plus a `fluentPreset()` card.

## [2.7.0] - 2026-10-07

### Added
- **Page & app-wide effects** — new category `use-scroll-animate/components/page` (+ `components/page.css`):
  - **Page transitions** on the View Transitions API: `pageTransition(update, { effect })` for SPA route changes — `fade`, `slide` / `slide-left` / `slide-right` / `slide-up`, `circle` (reveal from the click point), `blinds`, `pixel` (stepped dissolve), `zoom`; `enableMpaTransitions(effect)` for multi-page sites (`@view-transition { navigation: auto }`); `themeTransition(apply)` circle-reveal theme switch. Falls back to an instant update (optional cross-fade) without View Transitions.
  - `<usa-cursor mode="dot | trail | magnetic | glow">` custom cursors (fine pointers only, `hide-native`).
  - `smoothScroll()` (inertial wheel smoothing, touch/keyboard stay native) and `scrollToTarget()` (spring timing).
  - `<usa-fullpage>` full-screen snapping sections with keyboard paging and dot navigation.
  - `<usa-loading-bar>` + `loadingBar.start() / set() / done() / track(promise)` top loading bar (the scroll progress bar remains `<usa-scroll-progress>`).
  - `<usa-back-to-top>` with a reading-progress ring, spring scroll and focus return.
  - `<usa-ambient effect="particles | snow | stars | noise | gradient">` page-wide ambient layer (scroll-driven gradient, canvas paused in hidden tabs).
  - `<usa-splash>` launch / splash screen (`fade`, `scale`, `slide-up`, `circle` exit; `min` duration; `manual` + `done()`).
  - `<usa-auto-skeleton loading>` automatic skeletons from the existing markup.
  - **Global motion intensity**: `setMotionIntensity('off' | 'low' | 'normal' | 'high', persist?)`, `restoreMotionIntensity()`, `getMotionIntensity()`, `configureComponents({ motionIntensity })` and the `<usa-motion-switch>` control. It scales every component animation (and `spring()`), sets `--usa-motion` / `data-usa-motion` on `<html>`, and `off` behaves like `prefers-reduced-motion`.
  - Reduced motion: transitions update instantly, no cursor / smooth scrolling / ambient animation, instant jumps.
- Showcase: **Page & app-wide** category with live page-transition, theme reveal, cursor, ambient, splash, loading-bar, auto-skeleton, fullpage and motion-intensity demos.

## [2.6.0] - 2026-10-07

### Added
- **Style variants** for every component: `variant="minimal | neon | glass | brutalist | fluent | material"` on any `<usa-*>` element, `data-usa-variant` on any ancestor, or `setVariant()` for the whole app. Variants set shared design tokens (`--usa-accent`, `--usa-accent-text`, `--usa-surface`, `--usa-text`, `--usa-radius`, `--usa-border`, `--usa-shadow`, `--usa-blur`, `--usa-font`) that the components read (existing `<usa-toggle>`, `<usa-progress>`, cards, checkbox… now use `--usa-accent`). `fluent` follows the Windows 11 palette (light/dark), `material` Material 3. `defineComponents()` injects the token sheet; it is also in `components.css`.
- **UI components** — new category `use-scroll-animate/components/ui` (+ `components/ui.css`):
  - `<usa-tabs>` (sliding spring indicator, `line` / `pill`, roving tabindex, panels slide in from the direction of travel),
  - `<usa-drawer>` (left / right / top / bottom, spring in, drag / swipe to close, backdrop, Esc, focus return),
  - `<usa-bottom-sheet>` (snap points, inertia, drag-down-to-dismiss, grabber),
  - `<usa-pull-refresh>` (rubber-band pull, `usa:refresh` with `detail.done()`, `aria-busy` + status),
  - `<usa-fab>` (speed dial: up / down / left / right / radial, staggered spring, `aria-expanded`, inert while closed),
  - `<usa-navbar>` (auto-hide on scroll down, show on scroll up, `shrink`, page or `target` scroller),
  - `<usa-slider>` (form-associated `role="slider"`, spring thumb, value bubble, full keyboard),
  - `<usa-rating>` (hover preview, spring pop, number keys, `readonly`, form value),
  - `<usa-tooltip>` (spring-in, flips to stay on screen, `aria-describedby`),
  - `<usa-popover>` (click-to-open, spring from the trigger, Esc / outside click, focus return),
  - `<usa-badge>` (spring bump on change, `99+`, `dot`, `pulse`),
  - `<usa-avatar-stack>` (overlap that spreads on hover, `+N`).
  - All respect `prefers-reduced-motion` (instant open/close, no bumps, pulses or spreading).
- Showcase: **UI components & variants** category with live demos and per-card variant pickers, plus a `setVariant()` card.

## [2.5.0] - 2026-10-07

### Added
- **Click & tap** — new category `use-scroll-animate/components/click` (+ `components/click.css`):
  - **Button click deformation (按钮点击形变)** — `<usa-button>` around a native `<button>` / `<a>` (or acting as a button itself), spring-driven:
    - `deform="squash"` (squash on press, stretch-and-settle on release), `"wobble"` (elastic border-radius wobble), `"gooey"` (liquid droplets squeeze out from the press point and merge back, SVG goo filter), `"dent"` (the surface dents toward the pressed point: 3D tilt + inner shade). Combinable: `deform="squash wobble"`.
    - **Shape morph** `shape="pill | circle | icon"` / `morphTo(shape)`: the outline springs between pill, circle and icon-only, label (`[data-label]`) and icon (`[data-icon]`) cross-fade.
    - **Submit morph** `morph="submit"`: click → `loading` (shrinks to a spinner, `aria-busy`, live "Loading…" status) → `success` (drawn check) or `error` (shake + cross) → back to `idle` after `reset` ms. Drive with `state` or `event.detail.done(ok)` from `usa:submit`.
  - `<usa-icon-morph>`: point-interpolated, spring-driven icon morphs — `play ↔ pause`, `menu ↔ close`, `plus ↔ minus`, `check`, `arrow-right` (any pair); `toggle` + `labels` make it an accessible button. `MORPH_ICONS`, `morphPath()`.
  - `<usa-click effect="…">` (combinable): enhanced `ripple`, `burst` particles (`shape`: circle, square, star, heart, emoji), `confetti`, `squish`, `press-spring`, `shake` (also on `invalid` form fields).
  - `<usa-like>` (heart pop + burst, `aria-pressed`, count), `<usa-hold>` (hold-to-confirm progress ring; pointer, Space, Enter), `<usa-double-tap>` (heart at the tap point; `L` key), `<usa-checkbox>` (form-associated, spring box, self-drawing check, `indeterminate`).
  - Functions: `burst(x, y, opts)`, `confetti(opts)`, `shake(el)`, `haptic(pattern)` (`navigator.vibrate` where supported); `haptic` attribute on the elements.
  - Reduced motion: no deformation, particles or shaking (an outline flash instead); shape, icon and state changes are instant; statuses are still announced.
- Showcase: **Click & tap** category with button-deformation, shape-morph, submit, icon-morph, like, hold, double-tap, checkbox and confetti demos.

## [2.4.0] - 2026-10-07

### Added
- **Card effects** — new category `use-scroll-animate/components/cards` (+ `components/cards.css`):
  - `<usa-card effect="…">` with ten **combinable** effects (`effect="lift sheen"`): `flip` (hover or `trigger="click"`, `axis="y|x"`, `[data-front]` / `[data-back]`, `aria-pressed`), `holo` (holographic foil following the pointer), `glass` (frosted backdrop blur; solid under `prefers-reduced-transparency` / forced colours), `border-glow`, `conic-border` (rotating gradient border), `lift` (spring rise + slight tilt), `spotlight`, `sheen` (light sweep), `parallax-layers` (`[data-depth]` children) and `expand` (card → detail view with FLIP + spring; Esc / backdrop / `[data-close]` collapse). Pointer position is exposed as `--usa-card-x/-y` and `--usa-card-nx/-ny`.
  - `<usa-card-stack>`: swipeable deck (pointer, touch, arrow keys) with a spring fan-out, `loop`, `usa:swipe` / `usa:empty`.
  - `<usa-sticky-stack>`: cards stick while scrolling and covered cards shrink and dim.
  - `<usa-carousel-3d>`: items on a 3D ring rotated by drag, keys, clicks or `autoplay`, spring-driven, `aria-current` on the front item.
  - Reduced motion: no pointer tracking, tilt, parallax or sweeps; flips and expansions cross-fade; the carousel switches flat and instantly.
- Showcase: **Card effects** category (effect picker, flip, expand, swipe deck, 3D carousel) and a live sticky-stack section. The gallery now allows several demo cards per element.

## [2.3.0] - 2026-10-07

### Added
- **Spring & physics** — new category `use-scroll-animate/components/physics` (+ `components/physics.css`):
  - **Spring core**: a damped-spring solver (`stiffness`, `damping`, `mass`, initial `velocity`) with presets `gentle`, `wobbly`, `stiff`, `bouncy` (plus `default`, `slow`, `molasses`). `springEasing()` converts a spring into a CSS `linear()` easing + duration for WAAPI/CSS (cubic-bezier fallback where `linear()` is unsupported); `spring(el, keyframes, preset)` animates with it; `createSpring()` is an interruptible, velocity-preserving spring value for gestures. Helpers `projectInertia()` (flick projection), `snapTo()` (grid / points) and `rubberBand()` (iOS-style resistance).
  - `<usa-spring>`: `bounce-in`, `pop`, `drop` entrances with true spring timing, `jelly` and `rubber-band` attention effects; `trigger="view|hover|click|manual"`, `preset` or `stiffness`/`damping`/`mass`, `repeat`.
  - `<usa-draggable>`: drag with mouse, touch, pen or arrow keys; `spring-back`, `inertia`, `snap` (grid or points), `bounds="parent"` with rubber-banding, `axis`; events `usa:drag-start` / `usa:drag-end` / `usa:settle`.
  - `<usa-overscroll>`: elastic scroll container — pulling past an edge (touch, trackpad, wheel) stretches with rubber-band resistance and springs back.
  - Reduced motion: entrances fade, attention effects and overscroll stretch are skipped, springs jump to their target.
- Showcase: new **Spring & physics** category in the component gallery with live demos (effect / preset pickers, drag areas, elastic list, `spring()` playground).
- `npm run sync:exports` regenerates the per-category `exports` from `scripts/categories.mjs` (single list used by Rollup, the CSS bundle and a sync test).

## [2.2.0] - 2026-10-07

### Added
- **Animated components** — `use-scroll-animate/components`: 30 framework-agnostic, dependency-free `<usa-*>` custom elements (Custom Elements + CSS + Web Animations API) that run in browsers and in Windows desktop apps rendering with a web view (Electron, Tauri, WebView2 in WinUI 3 / WPF / WinForms, PWAs). Organised in six categories, each its own subpath export:
  - **Entrance & scroll** (`/components/reveal`): `<usa-reveal>` (12 effects, `repeat`), `<usa-stagger>`, `<usa-scroll-progress>` (page or `target`, `role="progressbar"`), `<usa-scrolly>` (sticky scrollytelling with `usa:step`).
  - **Text** (`/components/text`): `<usa-typewriter>`, `<usa-split-text>`, `<usa-scramble>`, `<usa-counter>` (`Intl.NumberFormat`, animated `.value`), `<usa-shimmer-text>`, `<usa-text-rotate>`. Animated text keeps a visually hidden plain copy for screen readers.
  - **Interaction** (`/components/interaction`): `<usa-ripple>`, `<usa-magnetic>`, `<usa-tilt>` (glare, `--usa-tilt-x/y`), `<usa-spotlight>` (Fluent Reveal highlight), `<usa-press>`, `<usa-toggle>` (`role="switch"`, form-associated).
  - **Loading & feedback** (`/components/feedback`): `<usa-spinner>` (`fluent` WinUI ring, `windows` orbiting dots, `ring`, `dots`, `pulse`, `bars`), `<usa-skeleton>`, `<usa-progress>` (Fluent indeterminate, paused / error states), `<usa-toaster>` + `toast()`, `<usa-check>`.
  - **Background & decoration** (`/components/background`): `<usa-aurora>`, `<usa-particles>` (canvas, runs only while visible), `<usa-grain>`, `<usa-marquee>`, `<usa-acrylic>` (Acrylic / Mica, solid under `prefers-reduced-transparency` / forced colours).
  - **Transitions** (`/components/transitions`): `<usa-dialog>` (native `<dialog>`; modal, drawers, sheet), `<usa-accordion>` (native `<details>`), `<usa-flip-list>`, `<usa-view-switch>`, and the helpers `viewTransition()` (View Transitions API with fallback), `flip()` and `connectedAnimation()` (WinUI-style shared-element animation).
- `defineComponents(categories?)`, `define<Category>Components()`, one `define*()` per element (custom tag names supported), `COMPONENT_CATEGORIES`, `configureComponents({ injectStyles, reducedMotion })`. Typed via `HTMLElementTagNameMap`.
- Every component honours `prefers-reduced-motion`, animates `transform` / `opacity` (and `filter` for blurs), batches layout reads/writes per frame, pauses loops off-screen / in hidden tabs, and is SSR-safe (no DOM access at import; `define*()` is a no-op on the server).
- Styles are injected per component as constructable stylesheets (CSP `style-src 'self'` friendly) or loaded as files: `use-scroll-animate/components.css` and `use-scroll-animate/components/<category>.css`.
- **No-build bundle** `dist/components.umd.js` (IIFE/UMD, global `UsaComponents`) registers every element on load.
- Docs: [`docs/components.md`](./docs/components.md) (every element, attribute, method and event, by category) and [`docs/windows-apps.md`](./docs/windows-apps.md) (Electron, Tauri, WinUI 3 / WPF / WinForms with WebView2, PWA, CSP, native Mica). README sections in English, 中文 and 日本語.
- **Showcase**: new component gallery `showcase/components.html` with category navigation, search, live demos of every element, per-card code tabs (HTML / ES module / React / Vue / Electron·Tauri·WebView2), English / 中文, dark / light; linked from the Animation Store and deployed by the existing Pages workflow.
- Size budgets for the bundle, the CSS file, each category and single-component imports (`size-budget.json`); `check:exports` covers the new entries and stylesheets.

### Changed
- `package.json` `sideEffects` is now `["*.css"]` (was `false`) so bundlers keep the optional stylesheet imports; all JS stays side-effect free.

## [2.1.0] - 2026-10-07

### Added
- **Showcase site** (`showcase/`): an "Animation Store" where every preset, feature (stagger, exit, parallax, progressVar, native engine, sequence, combined presets, spring easings) and framework adapter (React, Vue, Svelte, Solid, `<scroll-animate>`) is a product card with a live preview. Opening a card expands it (View Transitions API, FLIP fallback) into a detail view with a tweakable live demo (duration, easing, delay, distance, once/repeat, exit), a scroll test, and generated code for Vanilla / React / Vue / Svelte / Solid / HTML element / CDN with copy buttons. Search, category filters, favorites (localStorage), deep links (`#preset-name`), dark/light theme, English/中文, `prefers-reduced-motion` respected. No build step: it imports the library from `dist/` (dogfooding), falling back to the CDN build.
- **GitHub Pages workflow** (`.github/workflows/pages.yml`): builds `dist/` and deploys `showcase/` + `demo/` on every push to `main`.

## [2.0.1] - 2026-10-07

Bug-fix release; no API changes.

### Fixed
- Native engine (`engine: 'css'` / `'auto'`): elements that left the DOM (pruned by `watch()` / `init()`) stayed referenced by the instance until `destroy()`, which then cancelled their animations and rewrote their styles. They are now released when pruned.

### Changed (maintenance)
- Test for function easings no longer depends on the test DOM lacking `CSS.supports`.
- Dependabot ignores semver-major npm updates (TypeScript 7 breaks the Rollup build, jsdom 30 drops Node 20); majors are adopted deliberately.

## [2.0.0] - 2026-10-07

2.0 collects the 1.6–1.9 roadmap (native scroll timeline, Svelte/Solid/Web Component entries, exit animations and `parallax()`, docs and demo) and removes what 1.9 deprecated. See **MIGRATION from 1.x** below.

### ⚠ Breaking changes
- **`engine` defaults to `'auto'`**: presets run on the native scroll-driven timeline (`animation-timeline: view()`) where supported — scroll-linked instead of time-based. `'auto'` still picks the JS engine when an element sets `duration`, `delay`, `offset` or `stagger` itself. Set `defaultEngine: 'js'` for 1.x behaviour.
- **Removed** the `createReactHooks` / `createVueComposables` re-exports from the main entry: import them from `use-scroll-animate/react` / `use-scroll-animate/vue`.
- **ESM-first package** (`"type": "module"`): `import` → `dist/*.js` + `dist/*.d.ts`, `require` → `dist/*.cjs` + `dist/*.d.cts` for every entry; `main` is `dist/index.cjs`.
- **Removed legacy build artefacts**: the `module` field, `dist/index.esm.js`, `dist/index.mjs`, `dist/*.d.mts`, the per-file `dist/types/*` declarations, and `use-scroll-animate/dist/*` deep imports (only the documented entry points resolve). `dist/index.umd.js` and `dist/element.umd.js` keep their CDN URLs.
- **ES2020 output** (was ES2018): optional chaining / nullish coalescing are no longer down-levelled. Every browser that has `Animation.commitStyles()` (Chrome 84, Firefox 75, Safari 13.1), which the library already relied on, supports ES2020. Together with the removed re-exports: UMD 7.55 → 6.99 kB gz, core-only import 5.63 → 5.40 kB gz.
- `engines.node >= 18` declared (only relevant for SSR imports).

### Added
- **Native scroll-driven engine** (1.6): new `engine: 'auto' | 'js' | 'css'` option (`defaultEngine` config, `data-sa-engine` attribute). With `'auto'`/`'css'`, browsers that support `animation-timeline: view()` run the preset on a native `ViewTimeline` (scroll-linked, off the main thread); others fall back to the JS engine (default `'auto'`, see Breaking changes). New `viewRange` option (`data-sa-view-range`) and `supportsScrollTimeline()` helper.
- **Svelte actions** (1.7): `use-scroll-animate/svelte` exports `scrollAnimate` and `scrollStagger` (`use:` actions with `update`/`destroy`; no `svelte` import).
- **Solid primitives** (1.7): `use-scroll-animate/solid` exports the `scrollAnimate` / `scrollStagger` directives (typed via `JSX.Directives`) and `useScrollAnimate()` ref primitive. `solid-js` is an optional peer dependency.
- **`<scroll-animate>` Web Component** (1.7): `use-scroll-animate/element` exports `defineScrollAnimate(tagName?, instance?)`; attributes mirror `data-sa-*`, and it dispatches `sa:enter`/`sa:leave`/`sa:start`/`sa:complete`/`sa:progress` events. `dist/element.umd.js` registers it on load for CDN use.
- **Subpath exports** (1.7): `./react`, `./vue`, `./svelte`, `./solid`, `./element` (ESM + CJS, each with types). Entries share code through `dist/chunks/`, so importing several never duplicates the core. Optional peer dependencies: `solid-js`, `svelte`.
- **Exit animations** (1.8): `exit: true | preset | presets | { from, to }` (`data-sa-exit`, `exit` attribute on `<scroll-animate>`) plays the entrance (or the given animation) in reverse when the element leaves the viewport and replays the entrance on re-entry; implies `repeat` unless set. Scroll-linked over the `exit` range with the native engine; class swap in class-name mode; skipped under reduced motion.
- **`parallax(target, { speed, axis, progressVar, root, respectReducedMotion })`** (1.8): standalone parallax helper on the scroll-progress scale used by `progressVar`. Writes the progress to `--sa-parallax` and the offset to the individual `translate` property (composes with `transform`/entrance animations); no offset under reduced motion; listens only while targets are visible; returns a stop function. < 1 kB gzipped when tree-shaken.
- **Size budgets** (1.6): `size-budget.json` defines a gzip budget per entry (UMD bundle and tree-shaken imports); `npm run size:check` fails when one is exceeded and runs in CI.
- **Docs** (1.9): `docs/API.md` (full API reference), `docs/migration-from-aos.md`, `docs/migration-from-gsap-scrolltrigger.md`, `docs/deprecations.md` (now "Upgrading to 2.0"), and `demo/index.html` — a no-build preset playground (every preset clickable, scroll-triggered cards, parallax) that loads the UMD bundle.

### Changed
- The default instance export is annotated `/* @__PURE__ */`, so bundlers drop the core when only standalone helpers such as `parallax` are imported (1.8).
- Size budgets for the UMD bundle and "import everything" raised from 7.5 to 8 kB gzip for exit + parallax (1.8).
- Build (1.7): ESM/CJS entries are small files that import shared chunks from `dist/chunks/`; the UMD bundles stay single files.
- Build uses Rollup's ESM config (`rollup.config.mjs`); `@rollup/plugin-commonjs` dropped (no CommonJS inputs). `npm run build` cleans `dist/` first.

### Fixed
- Class-name mode: `destroy()` now clears pending completion timers, so `onComplete` no longer fires after the instance was destroyed. Other instances' timers are unaffected.

### Repository
- Dependabot (npm + GitHub Actions, weekly, grouped), issue templates (bug report, feature request) and a pull-request template.

### MIGRATION from 1.x

1. **React / Vue imports**
   ```diff
   - import { createReactHooks } from 'use-scroll-animate';
   + import { createReactHooks } from 'use-scroll-animate/react';
   - import { createVueComposables } from 'use-scroll-animate';
   + import { createVueComposables } from 'use-scroll-animate/vue';
   ```
   (1.9 already logged a dev-only warning for these.)
2. **Engine**: if you rely on time-based entrances (`duration`/`delay` set globally via `defaultDuration`/`defaultDelay`, `onComplete` timing, `threshold`-based triggering), keep 1.x behaviour with
   ```js
   ScrollAnimate.configure({ defaultEngine: 'js' });      // default instance
   createScrollAnimate({ defaultEngine: 'js' });          // own instances
   ```
   or per element `engine: 'js'` / `data-sa-engine="js"`. Elements that set `duration`, `delay`, `offset` or `stagger` themselves already stay on JS.
3. **Deep imports**: replace `use-scroll-animate/dist/index.js`, `dist/index.mjs`, `dist/index.esm.js` or `dist/types/...` with `use-scroll-animate` (or a subpath entry). Type-only imports come from the package name: `import type { AnimateOptions } from 'use-scroll-animate'`.
4. **CommonJS** consumers: `require('use-scroll-animate')` keeps working (now `dist/index.cjs`). If you referenced `dist/index.js` as CommonJS by path, it is ESM now.
5. **`<script>` / CDN**: no change — `https://unpkg.com/use-scroll-animate/dist/index.umd.js` (global `ScrollAnimate`) and `dist/element.umd.js`.
6. **Old browsers**: if you must support browsers without ES2020 (pre-2020 Safari/Chrome), transpile `use-scroll-animate` in your bundler, or stay on 1.x.

## [1.5.0] - 2026-10-07

### Added
- `watch(root?)` instance method: automatically observes `[data-sa]` elements added to the DOM later; returns a stop function, and `destroy()` stops all watchers.
- `progressVar` option and `data-sa-progress-var` attribute: expose scroll progress (0–1) as a CSS custom property.

### Fixed
- Stopping `staggerChildren` or cancelling a triggered `sequence()` before the content entered the viewport left it at `opacity: 0`; it is now restored (also affects React/Vue `useScrollStagger` unmounting off-screen).

### Tests / CI
- 47 new tests covering reduced motion, SSR, unmount cleanup and lifecycle; CI job timeout and `npm pack --dry-run`.

## [1.4.0] - 2026-10-06

### Added

- **True scroll progress** (`progressMode: 'scroll'`, `data-sa-progress="scroll"`, opt-in): `onProgress` and parallax receive 0→1 as the element travels through the viewport (top enters at the bottom → bottom leaves at the top), including elements taller than the screen. Uses one shared, passive, rAF-throttled scroll listener that is only attached while tracked elements are on screen. New helper `getScrollProgress(el, root?)`.
- **`staggerChildren(container, options, instance?)`** for vanilla JS, and **`observeChildren: true`** for it and `useScrollStagger`: a `MutationObserver` animates children added later. Children added before the reveal join the stagger; children added after it animate when they enter the viewport, staggered per batch.
- **Vue `useScrollStagger`** composable (`{ staggerRef }`).
- **`sequence(steps, options)`** timeline helper: chain animations across targets with `gap` (negative = overlap), `at` (absolute start), per-step `stagger`, optional `trigger` element to auto-play once; `play()` returns a Promise, plus `cancel()` and `duration()`.
- **New presets**: `scale-up`, `blur-in-up`, `flip-up`, `flip-down`, `rotate-left`, `rotate-right`, `clip-up`, `clip-down`, `clip-left`, `clip-right`, `clip-circle`.
- **`autoUnregister`** config (default `true`): finished `once` elements that don't need parallax/`onProgress` are removed from the registry right after they animate, freeing memory. They are tracked in a `WeakSet`, so `init()`/`observe()`/`refresh()` never re-hide or replay them; `unobserve()` forgets them.
- **`exports` map**: `import` → `dist/index.mjs` + `dist/index.d.mts`, `require` → `dist/index.js` + `dist/index.d.ts` (bundled declarations). `main`, `module`, `unpkg`, `types` (old `dist/types/*` still shipped) and `dist/*` deep imports are kept for backward compatibility. Added `"type": "commonjs"`.
- **GitHub Actions CI** (Node 20/22/24): typecheck, test, build, exports smoke test, publint + are-the-types-wrong, bundle size summary.
- Scripts: `check:exports`, `lint:package`, `size`.

### Fixed

- Presets that don't animate `opacity` (`slide-*`, `scale-x`, `scale-y`, `pulse`, `swing`, and custom `{ from, to }` without opacity) stayed invisible after `observe()`, because the `opacity: 0` applied while waiting to enter was never cleared.

### Changed

- `getObservedElements()` no longer lists finished `once` elements (see `autoUnregister`; set it to `false` for the previous behaviour).
- `useScrollStagger` (React) now delegates to `staggerChildren`; behaviour without `observeChildren` is unchanged.

### Fixed (audit, #1)

- **Parallax never worked after the entrance animation**: the `fill: 'both'` animation kept overriding the inline `transform`, and with the default `once: true` the progress observer was disconnected on first entry. Finished animations now commit their end state and are cancelled; the progress observer stays active.
- **`repeat` did not re-hide elements** (the old filling animation kept them visible) and stacked a new `Animation` on every entry. Running animations are now tracked, cancelled and replaced.
- **SSR**: `init()` / `observe()` threw `ReferenceError: document is not defined` on the server. All entry points are now no-ops without a DOM.
- **No IntersectionObserver**: elements were hidden and then `observe()` threw, leaving content invisible. Content is now shown immediately.
- **Reduced motion** was ignored by the React/Vue integrations and by parallax. Elements are no longer hidden and no motion is applied when `prefers-reduced-motion: reduce` is set (callbacks still fire).
- **`offset`** discarded the right/left sides of `rootMargin` and produced an invalid margin (`--20px`, which throws) for negative offsets.
- **`threshold` arrays** (including `data-sa-threshold="0,0.5"`) were truncated to the first value.
- **Custom easing functions** only interpolated `translateY`; every other transform (scale, rotate, translateX, combined presets) jumped at 50%. Uses CSS `linear()` where supported, and generic value interpolation otherwise.
- **`stagger`** delays grew with every registered sibling, so items scrolled into view later waited seconds. Stagger is now relative to the batch of siblings revealed together.
- **`refresh()`** re-hid and replayed elements that had already animated.
- **`unobserve()` / `destroy()`** left never-animated elements permanently invisible.
- **Detached elements** were kept in the registry forever (memory leak in SPAs); they are now pruned.
- **`useClassNames`** never applied `hiddenClass` on observe (only after a `repeat` leave).
- **React hooks** used stale callbacks from the first render and ignored `once`, `offset` and easing functions; Vue composable likewise. Both now delegate to the core engine.
- Malformed `data-sa-easing` JSON or invalid easing strings no longer throw; numeric `data-sa-parallax-x/y` values are treated as px; NaN numeric attributes are ignored.
- Vanilla example used TypeScript syntax and a non-existent `ScrollAnimate.createScrollAnimate`.

### Changed (audit, #1)

- **Performance**: IntersectionObservers are shared between elements with the same root/threshold/rootMargin instead of one (or two, with a 101-step threshold list) per element.
- Removed the `browser` field from `package.json` (it made webpack resolve the minified UMD build instead of the ESM build); added `unpkg`, `jsdelivr`, `files`, `sideEffects`, repository metadata, and real `test`/`typecheck` scripts.
- `ParallaxOptions` is now exported from the package entry.
- Preset end keyframes use explicit units (`translateY(0px)`, `rotateX(0deg)`); visually identical.
- `tsconfig` uses `moduleResolution: "bundler"` (TypeScript 6 rejects `node`/`node10`).
- Added a Vitest + jsdom test suite (25 tests).
- README: accurate size, full option/attribute table, instance API, UMD, React & Vue usage.

## [1.3.0] - 2025-03-25

### Added

- **Custom Easing Curves**: Support for passing a `cubic-bezier` array (e.g., `[0.34, 1.56, 0.64, 1]`) to the `easing` option.
- **Easing Functions**: Support for passing a custom JavaScript function `(t: number) => number` to the `easing` option for complete control over animation timing.
- **New Physics Presets**: Added `soft-spring` and `heavy-bounce` easing presets.
- **HTML Data Attribute Support**: Added support for parsing JSON-style arrays in `data-sa-easing` (e.g., `data-sa-easing="[0.1, 0.7, 1.0, 0.1]"`).

### Changed

- Updated `EasingType` to include `number[]` and `(t: number) => number`.
- Refactored `runAnimation` to handle custom easing functions by generating intermediate keyframes.
- Enhanced `resolveEasing` to handle array-based cubic-bezier definitions.

## [1.2.0] - 2025-03-25

### Added

- **Once Control**: New `once` option to automatically stop observing an element after its animation has triggered, saving system resources.
- **Viewport Offset**: New `offset` option to specify how many pixels an element must enter the viewport before the animation starts.
- **New Animation Presets**: Added `shimmer`, `pulse`, and `swing`.
- **Multi-language Documentation**: Added Chinese (`README_zh.md`) and Japanese (`README_ja.md`) documentation.
- **Fallback Support**: Added a fallback mechanism for browsers that do not support the Web Animations API.

### Fixed

- **Memory Leak**: Improved `IntersectionObserver` cleanup by using `disconnect()` instead of `unobserve()` in key areas.
- **Stagger Bug**: Fixed an issue where `stagger` animation indices were incorrectly calculated when DOM elements were added dynamically.
- **Type Safety**: Improved TypeScript definitions for better developer experience.

## [1.1.0] - 2025-03-25

### Added

- **Multiple Animations**: Support for applying multiple animation presets simultaneously (e.g., `["fade-in-up", "zoom-in"]`).
- **Parallax Effect**: New `parallax` option for creating scroll-driven parallax effects (`x`, `y`, `rotate`, `scale`, `speed`).
- **Scroll Progress Listener**: New `onProgress` callback that provides real-time scroll progress (0 to 1) for an element.
- **New Animation Presets**: Added `skew-in`, `scale-x`, `scale-y`.
- **Threshold Array Support**: `threshold` option now accepts an array of numbers for more granular progress tracking.

## [1.0.0] - 2025-03-25

### Added

- Initial release of `use-scroll-animate`.
- 16 built-in animation presets.
- Core `ScrollAnimate` singleton.
- HTML `data-sa` attribute API.
- React and Vue 3 integrations.
- Zero dependencies.
- ~2.9KB gzipped UMD bundle.
