<div align="center">

# use-scroll-animate 🚀

**軽量（~5KB gzipped）、依存関係なしのモダンWeb向けスクロールアニメーションライブラリ。**

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/HarrisonCN/use-scroll-animate?style=flat-square)](https://github.com/HarrisonCN/use-scroll-animate/releases)
[![GitHub repo size](https://img.shields.io/github/repo-size/HarrisonCN/use-scroll-animate?style=flat-square)](https://github.com/HarrisonCN/use-scroll-animate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

[English](./README.md) | [简体中文](./README_zh.md) | [日本語](./README_ja.md)

</div>

## なぜ `use-scroll-animate` なのか？

2025年、パフォーマンスはすべてです。従来のスクロールアニメーションライブラリは、重い依存関係をバンドルしたり、古いスクロールイベントリスナーに依存したり、特定のフレームワークを強制したりすることがよくあります。

`use-scroll-animate` は違います：
- ⚡ **依存関係なし**：純粋な Vanilla JS/TypeScript。
- 🚀 **高パフォーマンス**：`IntersectionObserver` とネイティブの `Web Animations API` で駆動。デフォルトではスクロールイベントリスナーなし（オプトインのスクロール進捗モードは、対象要素が画面内にある間だけ passive・rAF スロットルのリスナーを1つ使用）、レイアウトスラッシングなし。
- 🪶 **超軽量**：Gzip後コア約4.8KB（`timeline`・`staggerChildren`・React/Vue ヘルパーを含む全体で約6.1KB）。
- 🧩 **フレームワークに依存しない**：Vanilla JS、React、Vue、Svelteなどとシームレスに動作。一流の React Hooks と Vue Composables を内蔵。
- ♿ **アクセシブル**：`prefers-reduced-motion` を標準でサポート。

## スクロールプリセット 2.0（v6.1）🎞️

**214 種類のスクロール入場プリセット**：コア 33 種 + **拡張 181 種**。拡張セットは独立したツリーシェイク可能なエントリ（gzip 約 4.7 kB、コアのサイズは予算内のまま）です。[アニメーションストア](https://harrisoncn.github.io/use-scroll-animate/showcase/) でライブデモとコードのコピーができ、全プリセットとキーフレームは [docs/presets.md](./docs/presets.md) に一覧があります。

```js
import ScrollAnimate from 'use-scroll-animate';
import 'use-scroll-animate/presets/extended'; // import するだけで登録

ScrollAnimate.observe('.card', { animation: 'bounce-in-up', duration: 900 });
ScrollAnimate.observe('.hero img', { animation: 'scrub-shrink', engine: 'css', viewRange: ['cover 0%', 'cover 100%'] });
```

ビルドなしのページでは `dist/index.umd.js` の後に `dist/presets-extended.umd.js`（自動登録）を読み込みます。プリセット名は `animation` / `exit`、`data-sa-animation`、`useScrollAnimate` などのフレームワーク連携、`<scroll-animate animation>`、`<usa-reveal effect>` / `<usa-stagger effect>` で使えます。アニメーションするのは `transform`・`opacity`・`filter`・`clip-path` のみで、reduced motion 時は動きません。プリセットは中間キーフレーム `frames`（オーバーシュート、バウンス、グリッチ）を持てるようになり、独自プリセットも `registerPresets({ 'my-pop': { from, to, frames } })` で登録できます。

| カテゴリ | 合計 | 6.1 で追加 |
|---|---:|---|
| フェード | 19 | `fade-in-up-sm` · `fade-in-down-sm` · `fade-in-left-sm` · `fade-in-right-sm` · `fade-in-up-lg` · `fade-in-down-lg` · `fade-in-left-lg` · `fade-in-right-lg` · `fade-in-up-left` · `fade-in-up-right` · `fade-in-down-left` · `fade-in-down-right` · `fade-in-scale` · `fade-in-half` |
| ズーム・スケール | 23 | `zoom-in-up` · `zoom-in-down` · `zoom-in-left` · `zoom-in-right` · `zoom-out-up` · `zoom-out-down` · `zoom-out-left` · `zoom-out-right` · `zoom-in-big` · `zoom-out-big` · `zoom-bounce` · `zoom-in-rotate` · `scale-x-left` · `scale-x-right` · `scale-y-top` · `scale-y-bottom` · `stretch-x` · `stretch-y` |
| 3D フリップ | 22 | `flip-x-reverse` · `flip-y-reverse` · `flip-y-full` · `flip-diagonal` · `flip-diagonal-reverse` · `flip-left` · `flip-right` · `unfold-down` · `unfold-up` · `door-open-left` · `door-open-right` · `fold-in` · `flip-x-bounce` · `flip-y-bounce` · `swing-in-top` · `swing-in-bottom` · `swing-in-left` · `swing-in-right` |
| スライド | 20 | `slide-up-spring` · `slide-down-spring` · `slide-left-spring` · `slide-right-spring` · `slide-up-sm` · `slide-down-sm` · `back-in-up` · `back-in-down` · `back-in-left` · `back-in-right` · `light-speed-in-left` · `light-speed-in-right` · `rise-in` · `sink-in` · `float-in-up` · `float-in-down` |
| 回転・スキュー | 20 | `roll-in-left` · `roll-in-right` · `spiral-in` · `spiral-in-reverse` · `spin-in` · `rotate-in-up-left` · `rotate-in-up-right` · `rotate-in-down-left` · `rotate-in-down-right` · `skew-in-left` · `skew-in-y` · `shear-in` · `shear-in-reverse` · `twist-in` · `tilt-in-left` · `tilt-in-right` |
| ブラー・マスク | 14 | `blur-in-down` · `blur-in-left` · `blur-in-right` · `blur-in-strong` · `blur-in-zoom` · `blur-in-scale` · `blur-in-x` · `mask-up` · `mask-down` · `mask-left` · `mask-right` · `blur-mask-up` |
| クリップ | 22 | `clip-circle-top` · `clip-circle-bottom` · `clip-circle-left` · `clip-circle-right` · `clip-circle-corner` · `clip-ellipse` · `clip-diamond` · `clip-split-x` · `clip-split-y` · `clip-box` · `clip-pill` · `clip-blinds` · `clip-blinds-x` · `clip-diagonal` · `clip-diagonal-reverse` · `clip-slant-right` · `clip-slant-left` |
| バウンス・弾性 | 17 | `bounce-in` · `bounce-in-up` · `bounce-in-down` · `bounce-in-left` · `bounce-in-right` · `elastic-in` · `elastic-in-x` · `rubber-in` · `jello-in` · `wobble-in` · `tada-in` · `heartbeat-in` · `drop-in` · `pop-in` · `squash-in` · `shake-in` · `swing-in` |
| 色・光 | 14 | `brightness-in` · `darken-in` · `color-in` · `saturate-in` · `hue-in` · `sepia-in` · `invert-in` · `contrast-in` · `exposure-in` · `vintage-in` · `blur-bright-in` · `shadow-lift` · `neon-glow-in` · `glow-in` |
| 奥行き・遠近 | 10 | `perspective-in-up` · `perspective-in-down` · `perspective-in-left` · `perspective-in-right` · `depth-push` · `depth-pull` · `depth-in-up` · `swoop-in-left` · `swoop-in-right` · `card-tilt-in` |
| グリッチ・特殊 | 9 | `glitch-in` · `glitch-in-color` · `typewriter` · `typewriter-lines` · `hinge-in` · `flicker-in` · `scan-in` · `materialize` · `teleport-in` |
| スタッガー向け | 8 | `stagger-fade-up` · `stagger-pop` · `stagger-rise` · `stagger-slide` · `stagger-flip` · `stagger-blur` · `stagger-zoom` · `stagger-drop` |
| スクロール連動 | 12 | `scrub-parallax-up` · `scrub-parallax-down` · `scrub-rotate` · `scrub-spin` · `scrub-scale` · `scrub-shrink` · `scrub-pan-left` · `scrub-pan-right` · `scrub-tilt` · `scrub-fade-through` · `scrub-blur-through` · `scrub-reveal-x` |

## アニメーションコンポーネント（v2.2）🧩

依存ゼロの**アニメーション Web Components 30 種**（`<usa-*>`）を 6 カテゴリで提供。**Web ページと Windows デスクトップアプリ**（Electron、Tauri、WinUI/WPF/WinForms の WebView2、PWA）の両方で動作します。Custom Elements + CSS + Web Animations のみ、ツリーシェイク可能、SSR セーフ、`prefers-reduced-motion` 対応。**[ライブギャラリー](https://harrisoncn.github.io/use-scroll-animate/showcase/components.html)** · [コンポーネント文書](./docs/components.md)（英語）· [Windows アプリガイド](./docs/windows-apps.md)（英語）

```js
import { defineComponents } from 'use-scroll-animate/components';
defineComponents(); // カテゴリ単位: import { defineTextComponents } from 'use-scroll-animate/components/text'
```

| カテゴリ（インポート） | コンポーネント |
|---|---|
| **入場・スクロール**（`/components/reveal`） | `<usa-reveal>` · `<usa-stagger>` · `<usa-scroll-progress>` · `<usa-scrolly>` |
| **テキスト**（`/components/text`） | `<usa-typewriter>` · `<usa-split-text>` · `<usa-scramble>` · `<usa-counter>` · `<usa-shimmer-text>` · `<usa-text-rotate>` · `<usa-wave-text>` · `<usa-glitch>` · `<usa-gradient-text>` · `<usa-handwriting>` · `<usa-scroll-highlight>` |
| **インタラクション**（`/components/interaction`） | `<usa-ripple>` · `<usa-magnetic>` · `<usa-tilt>` · `<usa-spotlight>`（Fluent Reveal）· `<usa-press>` · `<usa-toggle>` |
| **ローディング・フィードバック**（`/components/feedback`） | `<usa-spinner>` · `<usa-skeleton>` · `<usa-progress>` · `<usa-toaster>` + `toast()` · `<usa-check>` |
| **背景・装飾**（`/components/background`） | `<usa-aurora>` · `<usa-particles>` · `<usa-grain>` · `<usa-marquee>` · `<usa-acrylic>`（Acrylic / Mica） · `<usa-grid-glow>` · `<usa-blobs>` · `<usa-water-ripple>` · `<usa-dot-network>` · `fluentPreset()` |
| **トランジション**（`/components/transitions`） | `<usa-dialog>` · `<usa-accordion>` · `<usa-view-switch>` · `viewTransition()` · `flip()` |
| **スプリング・物理**（`/components/physics`） | `<usa-spring>`（bounce-in · pop · drop · jelly · rubber-band）· `<usa-draggable>` · `<usa-overscroll>` · `spring()` · `createSpring()` |
| **カード効果**（`/components/cards`） | `<usa-card>`（flip · holo · glass · border-glow · conic-border · lift · spotlight · sheen · parallax-layers · expand）· `<usa-card-stack>` · `<usa-sticky-stack>` · `<usa-carousel-3d>` |
| **クリック・タップ**（`/components/click`） | `<usa-button>`（squash · wobble · gooey · dent · shape morph · submit）· `<usa-icon-morph>` · `<usa-click>` · `<usa-like>` · `<usa-hold>` · `<usa-double-tap>` · `<usa-checkbox>` |
| **UI コンポーネント・バリアント**（`/components/ui`） | `<usa-tabs>` · `<usa-drawer>` · `<usa-bottom-sheet>` · `<usa-pull-refresh>` · `<usa-fab>` · `<usa-navbar>` · `<usa-slider>` · `<usa-rating>` · `<usa-tooltip>` · `<usa-popover>` · `<usa-badge>` · `<usa-avatar-stack>` · 全コンポーネントで `variant` |
| **ページ・アプリ全体**（`/components/page`） | `pageTransition()` · `themeTransition()` · `<usa-cursor>` · `smoothScroll()` · `<usa-fullpage>` · `<usa-loading-bar>` · `<usa-back-to-top>` · `<usa-ambient>` · `<usa-splash>` · `<usa-auto-skeleton>` · `<usa-motion-switch>` |
| **タイムライン** (`/components/timeline`) | `timeline()`（連結 · 重ね · ラベル · シーク · 逆再生 · スクラブ）· `<usa-timeline>`（`data-tl` ステップ） |
| **ジェスチャー** (`/components/gesture`) | `gesture()`（パン · スワイプ · ピンチ · 長押し · タップ → スプリング）· `<usa-swipeable>` · `<usa-pinch-zoom>` |
| **SVG** (`/components/svg`) | `<usa-draw>`（線描画）· `<usa-morph>`（パスモーフ）· `<usa-mask-reveal>` · `<usa-anim-icon>` · `morphTo()` |
| **Canvas / WebGL** (`/components/webgl`) | `<usa-shader>`（gradient · plasma · waves · aurora · snow · fireflies · stars · bokeh · rain · カスタム GLSL）· `<usa-post-fx>` · `<usa-distort>` · `<usa-liquid>` · `glQuad()` |
| **3D / 奥行き** (`/components/depth`) | `<usa-cube>` · `<usa-depth>`（ポインター · ジャイロ · スクロール視差）· `deviceTilt()` |
| **レイアウト** (`/components/layout`) | `<usa-auto-animate>` / `autoAnimate()` · `<usa-masonry>` · `sharedTransition()`（共有要素） |
| **エフェクトパック** (`/components/packs`) | `<usa-pack>` (`name="ecommerce \| portfolio \| dashboard \| game \| landing"`) · `applyPack()` · `flyToCart()` |
| **エフェクト API** (`/components/fx`) | `<usa-fx>` · `registerEffect()` · `playEffect()` · `bindEffect()` · 内蔵: タイムライン入場、pulse · pop · jelly · wiggle · bounce · tada · shake、burst · confetti · ripple |
| **エフェクトパック** (`/components/effects`) | `registerAllEffects()` · カード & クリック 2.0 · 物理 · ページ全体 · `<usa-story>` スクロールストーリー · ジェネレーティブ背景 · サウンド連動（`<usa-audio>`）· カーソル & ジェスチャー（`<usa-gesture-fx>`）· テーマパック（`<usa-theme>`）· マイクロインタラクション 23 種 · `<usa-player>` JSON アニメーション |

## ドキュメント

- [プリセット一覧](./docs/presets.md)（全 214 種、英語）
- [API リファレンス](./docs/API.md)（英語）· [デモ](./demo/index.html)（全プリセットをクリックで再生、ビルド不要）
- 移行ガイド：[AOS から](./docs/migration-from-aos.md) · [GSAP ScrollTrigger から](./docs/migration-from-gsap-scrolltrigger.md)
- [2.0 へのアップグレード](./docs/deprecations.md)：`createReactHooks` / `createVueComposables` は `use-scroll-animate/react` / `/vue` からのみ。`dist/index.mjs`・`dist/index.esm.js`・`dist/types/*`・`dist/*` ディープインポートは削除、デフォルトエンジンは `'auto'`。CDN の `dist/index.umd.js` は変更なし。詳細は [CHANGELOG](./CHANGELOG.md) の MIGRATION。

## インストール

```bash
npm install use-scroll-animate
```

## クイックスタート (Vanilla JS / HTML)

最も簡単な方法は、HTML の `data-sa` 属性を使用することです。

```html
<!-- 1. 要素に data-sa 属性を追加 -->
<div data-sa data-sa-animation="fade-in-up" data-sa-duration="800">
  スクロールされるとアニメーションします！
</div>

<script type="module">
  // 2. インポートして初期化
  import ScrollAnimate from 'use-scroll-animate';
  ScrollAnimate.init();
</script>
```

## ネイティブのスクロール駆動エンジン `engine`（v1.6）

CSS スクロール駆動アニメーション（`CSS.supports('animation-timeline: view()')`）に対応したブラウザでは、プリセットをブラウザ標準の **view timeline** 上で実行できます。進行度はスクロール位置に連動し（メインスレッド外）、IntersectionObserver で開始して固定の `duration` で再生する方式ではありません。

```js
ScrollAnimate.observe('.card', { animation: 'fade-in-up', engine: 'auto' });
const sa = createScrollAnimate({ defaultEngine: 'auto' });
```

- `'auto'`：**2.0 からのデフォルト**。対応ブラウザではネイティブ、非対応なら JS。要素が `duration`・`delay`・`offset`・`stagger` を自分で指定した場合も JS。`'css'`：対応時は常にネイティブ。`'js'`：1.x の動作（`defaultEngine: 'js'` で全体に適用）。
- ネイティブエンジンでは `duration`・`delay`・`threshold`・`offset`・`stagger` は無効で、範囲は `viewRange`（デフォルト `['entry 0%', 'entry 100%']`）。`easing` は有効。HTML：`data-sa-engine`、`data-sa-view-range`。
- `once`（デフォルト）は完了時に最終状態を固定、`repeat: true` ではスクロールに双方向で追従。クラス名モード・reduced motion・`animate()`・`timeline()`・`staggerChildren()` は常に JS エンジン。`supportsScrollTimeline()` もエクスポート。

## v1.4.0 の新機能 ✨

- **本当のスクロール進捗 `progressMode: 'scroll'`**（オプトイン）：`onProgress` はデフォルトで要素の表示比率を返すため、画面より高い要素では 1 に到達しません。有効にすると、要素の上端がビューポート下端に達したとき `0`、下端がビューポート上端を抜けたとき `1` になります。パララックスも同じ進捗を使用します。HTML では `data-sa-progress="scroll"`。ヘルパー `getScrollProgress(el, root?)` もエクスポートされています。

  ```js
  ScrollAnimate.observe('.chapter', {
    progressMode: 'scroll',
    onProgress: (el, p) => el.style.setProperty('--progress', p),
  });
  ```

- **動的に追加された子要素のスタッガー**：`staggerChildren()`（Vanilla）と `useScrollStagger()`（React、**Vue にも新たに対応**）に `observeChildren: true` を追加。`MutationObserver` で後から追加された子要素（無限リスト、「もっと見る」）を検出します。表示前に追加された要素はスタッガーに加わり、表示後に追加された要素はビューポートに入ったときにバッチ単位でスタッガー再生されます。

  ```js
  import { staggerChildren } from 'use-scroll-animate';
  const stop = staggerChildren(document.querySelector('#feed'), { stagger: 60, observeChildren: true });
  ```

- **タイムライン `timeline()`**：1 つの再生ヘッドで複数要素のアニメーションを連結。既定では前のステップの終了後に開始し、`at` で重ね（`'-=300'`）、待機（`'+=200'`）、前と同時（`'<'`）、ラベル・絶対時刻を指定。再生・逆再生・シーク・スクロール連動（scrub）に対応。（4.0 で削除された `sequence()` の後継。[upgrading-4.md](./docs/upgrading-4.md) 参照。）

  ```js
  import { timeline } from 'use-scroll-animate';
  const tl = timeline({ defaults: { duration: 700 } })
    .to('.hero h1', 'fade-up')
    .to('.hero p', 'blur', { at: '-=300' })
    .to('.hero .btn', 'scale', { stagger: 80 });
  await tl.play(); // 完了で resolve。tl.scrub(hero) でスクロール連動
  ```

- **新しいプリセット**：`scale-up`、`blur-in-up`、`flip-up`、`flip-down`、`rotate-left`、`rotate-right`、clip-path による `clip-up`、`clip-down`、`clip-left`、`clip-right`、`clip-circle`。
- **メモリ使用量の削減**：`once` 要素はアニメーション開始後に自動でレジストリから削除されます（パララックス/`onProgress` が必要な要素を除く）。`WeakSet` で記憶されるため、`init()`/`observe()` で再生されることはありません。従来の挙動は `createScrollAnimate({ autoUnregister: false })`。
- **正しい `exports` マップ**：2.0 から ESM 優先：`import` → `dist/*.js` + `*.d.ts`、`require` → `dist/*.cjs` + `*.d.cts`。

## v1.2.0 の新機能

- **一度だけ実行 (Once)**：アニメーション実行後に監視を自動停止し、リソースを節約。
- **オフセット (Offset)**：要素がビューポートに入ってから何ピクセル後にアニメーションを開始するかを指定可能。
- **新しいプリセット**：`shimmer`（シマー）、`pulse`（パルス）、`swing`（スイング）を追加。
- **多言語サポート**：中国語と日本語のドキュメントを追加。

## フレームワーク連携（v1.7）

各連携は独立したエントリポイント（`use-scroll-animate/react`・`/vue`・`/svelte`・`/solid`・`/element`）で、コアのコードを共有します。

```svelte
<!-- Svelte：action（svelte の import 不要） -->
<script>import { scrollAnimate, scrollStagger } from 'use-scroll-animate/svelte';</script>
<div use:scrollAnimate={{ animation: 'fade-in-up' }}>…</div>
```

```tsx
// Solid：ディレクティブ + ref プリミティブ（solid-js は optional な peer 依存）
import { scrollAnimate, useScrollAnimate } from 'use-scroll-animate/solid';
<div use:scrollAnimate={{ animation: 'zoom-in' }}>…</div>
```

```html
<!-- Web Component：属性は data-sa-* から接頭辞を除いたもの。sa:enter / sa:leave / sa:start / sa:complete / sa:progress イベントを発火 -->
<script type="module">
  import { defineScrollAnimate } from 'use-scroll-animate/element';
  defineScrollAnimate();
</script>
<scroll-animate animation="fade-in-up" duration="800">…</scroll-animate>
```

## 退場アニメーションとパララックス（v1.8）

```js
ScrollAnimate.observe('.card', { animation: 'fade-in-up', exit: true });          // ビューポート外へ出るとき入場を逆再生
ScrollAnimate.observe('.toast', { animation: 'zoom-in', exit: 'fade-in-down' });  // 別プリセットを逆再生して退場
import { parallax } from 'use-scroll-animate';
parallax('.hero-bg', { speed: 0.3 });  // 正：ページより遅い、負：速い。axis: 'x' も可
```

- `exit`：`true`・プリセット名・配列・`{ from, to }`。`repeat: true` を暗黙に有効化。`data-sa-exit` 属性にも対応。reduced motion 時は再生しません。
- `parallax()`：進行度を CSS 変数（既定 `--sa-parallax`）に、オフセットを個別の `translate` プロパティに書き込むため `transform` と競合しません。reduced motion 時はオフセットなし。停止関数を返します。

## 主な設定

| オプション | 型 | デフォルト | 説明 |
|--------|------|---------|-------------|
| `animation` | `string` \| `string[]` | `'fade-in-up'` | プリセット名またはプリセットの配列 |
| `duration` | `number` | `600` | アニメーションの長さ (ms) |
| `delay` | `number` | `0` | アニメーションの遅延 (ms) |
| `once` | `boolean` | `true` | 一度だけ実行するかどうか |
| `offset` | `number` | `0` | アニメーションを開始するビューポートのオフセット (px) |
| `parallax` | `object` | `{}` | パララックス効果の設定 |
| `stagger` | `number` | `0` | 同じバッチで表示される兄弟要素ごとの追加遅延 (ms) |
| `onProgress` | `(el, progress) => void` | – | スクロール進捗のコールバック (0–1) |
| `progressMode` | `'ratio'` \| `'scroll'` | `'ratio'` | 進捗の計算方法：表示比率または本当のスクロール進捗 |

## ライセンス

このプロジェクトは MIT ライセンスの下でライセンスされています - 詳細は [LICENSE](LICENSE) ファイルを参照してください。
