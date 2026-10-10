<div align="center">

# Motionary

**モダン Web のためのスクロールアニメーションとアニメーション Web Components — 214 のスクロールプリセット、90 のエフェクト、依存ゼロ。**

_旧名 **use-scroll-animate** — API と `<usa-*>` タグはそのまま。旧 npm パッケージもエイリアスとして公開を継続します。_

[![npm](https://img.shields.io/npm/v/motionary?style=flat-square)](https://www.npmjs.com/package/motionary) [![CI](https://github.com/HarrisonCN/Motionary/actions/workflows/ci.yml/badge.svg)](https://github.com/HarrisonCN/Motionary/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)

[English](./README.md) | [简体中文](./README_zh.md) | [日本語](./README_ja.md)

**[🛍 アニメーションストア](https://harrisoncn.github.io/Motionary/showcase/)** · **[🧩 コンポーネント](https://harrisoncn.github.io/Motionary/showcase/components.html)** · **[🎛 Playground](https://harrisoncn.github.io/Motionary/showcase/playground.html)** · **[📜 ストーリー](https://harrisoncn.github.io/Motionary/showcase/story.html)**

<sub>ストアでは全 <b>227</b> 件のアニメーション（214 のスクロールプリセットとカード・クリック・物理・ページ効果）をデスクトップ／スマホ幅でプレビュー・調整・コピーできます。</sub>

</div>

Motionary はスクロールで表示される要素をアニメーションさせ（IntersectionObserver + Web Animations、またはブラウザ標準のスクロールタイムライン）、カード・ボタン・物理・ページトランジション・背景・WebGL など 94 個のアニメーション付きカスタム要素を提供します。どのフレームワークでも、素の HTML でも、デスクトップの Web ビューアプリ（Electron・Tauri・WebView2）でも動き、すべて `prefers-reduced-motion` を尊重します。

## インストール

```bash
npm i motionary
```

```html
<!-- CDN (no build) -->
<script src="https://unpkg.com/motionary@12/dist/index.umd.js"></script>            <!-- window.ScrollAnimate -->
<script src="https://unpkg.com/motionary@12/dist/presets-extended.umd.js"></script> <!-- +181 presets -->
<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>       <!-- every <usa-*>, window.UsaComponents -->
```

jsDelivr も利用できます：`https://cdn.jsdelivr.net/npm/motionary@12/dist/…`。既存の `use-scroll-animate` と `unpkg.com/use-scroll-animate@6` の URL もそのまま動きます。

## 30 秒クイックスタート

要素に `data-sa` を付け、`data-sa-animation` でプリセットを選びます（すべてのオプションに `data-sa-*` 属性あり）。JS API も使えます：

```html
<!-- 1. HTML only: data attributes + one init() call -->
<h2 data-sa data-sa-animation="fade-in-up">Hello</h2>
<div data-sa data-sa-animation="bounce-in-up" data-sa-delay="150">Card</div>
<script type="module">
  import ScrollAnimate from 'motionary';
  import 'motionary/presets/extended'; // optional: +181 presets (bounce-in-up, clip-diamond, …)
  ScrollAnimate.init(); // picks up every [data-sa]
</script>
```

```js
// 2. JS API
import ScrollAnimate, { staggerChildren, parallax, timeline } from 'motionary';

ScrollAnimate.observe('.card', { animation: 'zoom-in-up', duration: 800, easing: 'spring' });
staggerChildren(document.querySelector('.grid'), { animation: 'stagger-pop', stagger: 60 });
parallax('.hero-bg', { speed: 0.3 });
ScrollAnimate.observe('.logo', { animation: 'scrub-spin', engine: 'css', viewRange: ['cover 0%', 'cover 100%'] });
```

フレームワーク — 各アダプターは独立したエントリで、アンマウント時に自動で後片付けします：

```jsx
// React
import React from 'react';
import { createReactHooks } from 'motionary/react';
const { useScrollAnimate } = createReactHooks(React);

export function Card() {
  const ref = useScrollAnimate({ animation: 'fade-in-up' });
  return <div ref={ref}>Hello</div>;
}
```

```vue
<!-- Vue 3 -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { createVueComposables } from 'motionary/vue';
const { useScrollAnimate } = createVueComposables({ ref, onMounted, onUnmounted });
const { animateRef } = useScrollAnimate({ animation: 'zoom-in' });
</script>
<template><div ref="animateRef">Hello</div></template>
```

```svelte
<!-- Svelte 3–5 -->
<script>
  import { scrollAnimate } from 'motionary/svelte';
</script>
<div use:scrollAnimate={{ animation: 'flip-up' }}>Hello</div>
```

```jsx
// Solid
import { scrollAnimate } from 'motionary/solid';
scrollAnimate; // keep the directive import (TypeScript)
export const Card = () => <div use:scrollAnimate={{ animation: 'blur-in-up' }}>Hello</div>;
```

```ts
// Angular (standalone) — the animated Web Components
import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { usaInitializer } from 'motionary/components/angular';
import 'motionary/presets/extended'; // lets <usa-reveal effect> use every preset name
// app.config.ts: providers: [{ provide: APP_INITIALIZER, multi: true, useFactory: usaInitializer() }]
@Component({ standalone: true, schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<usa-reveal effect="bounce-in-up"><h2>Hello</h2></usa-reveal>` })
export class Hero {}
```

> 11.5：Angular はトップレベルのエントリ `motionary/angular` を使用します（`motionary/components/angular` は 13.0 まで利用可）。レイヤー別サブパスと非推奨パス：[docs/public-api.md](./docs/public-api.md) · `npx motionary doctor`。

アニメーションコンポーネントはフレームワーク不要：

```html
<script type="module">
  import { defineComponents } from 'motionary/components';
  defineComponents(); // or lazyDefine() from 'motionary/components/lazy'
</script>
<usa-card effect="holo">…</usa-card>
<usa-button deform="gooey">Buy</usa-button>
<usa-fx effect="confetti" trigger="click"><button>Celebrate</button></usa-fx>
```

## 機能一覧

| 分野 | 内容 |
|---|---|
| **スクロールプリセット** | **214** 種の入場プリセット（コア 33 + `motionary/presets/extended` の 181）、14 系統：フェード、ズーム、3D フリップ・ドア、オーバーシュートスライド、clip-path 図形、ブラー・マスク、バウンス・弾性、色・光、奥行き、グリッチ / タイプライター、スタッガー向け、スクロール連動 `scrub-*`。`timeline()` と 10 種のタイムラインプリセットも |
| **カード・クリック・ボタン変形** | `<usa-card>` の 10 エフェクト（flip・holo・glass・border glow など）、スタックと 3D カルーセル。クリック系 7 コンポーネント、4 種のボタン変形（squash · wobble · gooey · dent）とアイコンモーフ。登録済みカード / クリックエフェクト 12 種 |
| **物理・バウンス** | `<usa-spring>`、`<usa-draggable>`（スプリングバック・慣性・スナップ）、`<usa-overscroll>`。`spring()` / `solveSpring()` と 7 種のバネプリセット、物理エフェクト 7 種 |
| **ページトランジション** | `pageTransition()`・`viewTransition()`・`sharedTransition()`・`flip()`・MPA トランジション、ページエフェクト 7 種（curtain・iris・pixel-dissolve など）、`<usa-dialog>`・`<usa-view-switch>` |
| **ジェネラティブ背景** | キャンバス背景 6 種（flow-field・voronoi・mesh-gradient・starfield・metaballs・contours）+ 背景要素 9 種（オーロラ・パーティクル・グレイン・Acrylic / Mica など） |
| **サウンド連動** | `<usa-audio>` と Web Audio のビート検出（`createBeatDetector()`・`onBeat()`）、オーディオビジュアライザー 3 種、任意のエフェクトをビートで発火 |
| **カーソル・ジェスチャー** | カーソルエフェクト 5 種 + `<usa-cursor>`、fling · twist · long-press でエフェクト（`<usa-gesture-fx>`）、`<usa-swipeable>`・`<usa-pinch-zoom>` |
| **テーマ** | テーマ 5 種（neon · paper · glass · retro · brutalist）を `<usa-motion-theme>` / `applyMotionTheme()` で、各テーマに専用エフェクト。モーショントークン（`/components/tokens`） |
| **マイクロインタラクション** | 既製の UI 演出 23 種：copy-success・like-heart・add-to-cart・send-plane・upvote・trash-shake など |
| **`<usa-player>` とストーリー** | `<usa-player>` は Playground から書き出した JSON アニメーションを再生（キーフレーム・プリセット・エフェクト、load / view / scroll / click トリガー）。`<usa-story>` のストーリーテンプレート 6 種 |
| **WebGL** | `<usa-shader>`・`<usa-distort>`・`<usa-liquid>`・`<usa-post-fx>` — パーティクル 5 種、ポストエフェクト 9 種（CSS フォールバックと省電力制御付き） |

90 のエフェクトは 1 つのレジストリ（`registerEffect()` / `playEffect()` / `bindEffect()` / `<usa-fx>`、`motionary/components/fx`）を共有し、5.x のパックは `motionary/components/effects` にあります。

### 全 94 コンポーネント

カテゴリ単位（`motionary/components/cards`）、全部（`motionary/components`）、CSS 遅延読み込みの `/components/lite`、またはページ上のタグだけを読む `lazyDefine()` から選べます。ラッパー：`/components/react`・`/vue`・`/svelte`・`/solid`・`/angular`。

| エントリ | 要素 |
|---|---|
| **スクロール表示** (`/components/reveal`) | `<usa-reveal>` · `<usa-stagger>` · `<usa-scroll-progress>` · `<usa-scrolly>` |
| **テキスト** (`/components/text`) | `<usa-typewriter>` · `<usa-split-text>` · `<usa-scramble>` · `<usa-counter>` · `<usa-shimmer-text>` · `<usa-text-rotate>` · `<usa-wave-text>` · `<usa-glitch>` · `<usa-gradient-text>` · `<usa-handwriting>` · `<usa-scroll-highlight>` |
| **インタラクション** (`/components/interaction`) | `<usa-ripple>` · `<usa-magnetic>` · `<usa-tilt>` · `<usa-spotlight>` · `<usa-press>` · `<usa-switch>` |
| **フィードバック** (`/components/feedback`) | `<usa-spinner>` · `<usa-skeleton>` · `<usa-progress>` · `<usa-toaster>` · `<usa-check>` |
| **背景** (`/components/background`) | `<usa-aurora>` · `<usa-particles>` · `<usa-grain>` · `<usa-marquee>` · `<usa-acrylic>` · `<usa-grid-glow>` · `<usa-blobs>` · `<usa-water-ripple>` · `<usa-dot-network>` |
| **トランジション** (`/components/transitions`) | `<usa-dialog>` · `<usa-accordion>` · `<usa-view-switch>` |
| **バネ・物理** (`/components/physics`) | `<usa-spring>` · `<usa-draggable>` · `<usa-overscroll>` |
| **カード** (`/components/cards`) | `<usa-card>` · `<usa-card-stack>` · `<usa-sticky-stack>` · `<usa-carousel-3d>` |
| **クリック・ボタン** (`/components/click`) | `<usa-click>` · `<usa-button>` · `<usa-icon-morph>` · `<usa-like>` · `<usa-hold>` · `<usa-double-tap>` · `<usa-checkbox>` |
| **UI キット** (`/components/ui`) | `<usa-tabs>` · `<usa-drawer>` · `<usa-bottom-sheet>` · `<usa-pull-refresh>` · `<usa-fab>` · `<usa-navbar>` · `<usa-slider>` · `<usa-popover>` · `<usa-badge>` · `<usa-avatar-stack>` |
| **ページ全体** (`/components/page`) | `<usa-cursor>` · `<usa-fullpage>` · `<usa-loading-bar>` · `<usa-back-to-top>` · `<usa-ambient>` · `<usa-splash>` · `<usa-auto-skeleton>` · `<usa-motion-switch>` |
| **タイムライン** (`/components/timeline`) | `<usa-timeline>` |
| **ジェスチャー** (`/components/gesture`) | `<usa-swipeable>` · `<usa-pinch-zoom>` |
| **SVG** (`/components/svg`) | `<usa-draw>` · `<usa-morph>` · `<usa-mask-reveal>` · `<usa-anim-icon>` |
| **WebGL** (`/components/webgl`) | `<usa-shader>` · `<usa-distort>` · `<usa-liquid>` · `<usa-post-fx>` |
| **3D 奥行き** (`/components/depth`) | `<usa-cube>` · `<usa-depth>` |
| **レイアウト** (`/components/layout`) | `<usa-auto-animate>` · `<usa-masonry>` |
| **パック** (`/components/packs`) | `<usa-pack>` |
| **エフェクト登録** (`/components/fx`) | `<usa-fx>` |
| **エフェクトパック** (`/components/effects`) | `<usa-player>` · `<usa-story>` · `<usa-audio>` · `<usa-motion-theme>` · `<usa-gesture-fx>` |

## アクセシビリティと reduced motion

- `prefers-reduced-motion: reduce` ではスクロール表示はすぐに表示され（入場・パララックス・スクラブなし）、コンポーネントは落ち着いた状態になります（`staticAlternative()` / `adaptKeyframes()`）。
- `motionary/components/a11y`：`setMotionSensitivity()` のレベルで点滅・ループ・パララックスを抑制、`announce()` ライブリージョン、`auditMotionA11y()`、`baselineReport()`。`<usa-motion-switch>` はユーザー向けのモーション切替です。
- 詳細：[docs/accessibility.md](./docs/accessibility.md)。

## パフォーマンスとサイズ

デフォルトで scroll リスナーなし（IntersectionObserver）、アニメーションはコンポジター上（`transform`・`opacity`・`filter`・`clip-path`）、メインスレッド外のネイティブスクロールタイムライン（`engine: 'css'`）も選べます。全エントリはツリーシェイク可能で、gzip 予算を CI で強制（`size-budget.json`）。6.1 の実測（minify + gzip）：

| インポート | gzip |
|---|---:|
| `import ScrollAnimate from 'motionary'` (default instance) | 5.72 kB |
| Everything from the main entry | 8.69 kB |
| `dist/index.umd.js` (CDN) | 8.81 kB |
| `parallax()` alone | 1.22 kB |
| `motionary/presets/extended` (181 presets) | 4.69 kB |
| `motionary/components/reveal` | 4.10 kB |
| `motionary/components/effects` (8 effect packs) | 26.40 kB |
| `motionary/components/lite` (every component, CSS on demand) | 68.48 kB |
| `motionary/components` (every component + CSS) | 85.15 kB |
| `dist/components.umd.js` (CDN, everything) | 106.75 kB |

詳細：[docs/performance.md](./docs/performance.md)。

## 対応ブラウザ

2023 年以降のエバーグリーンブラウザ：Chrome / Edge ≥ 111、Safari ≥ 16.4、Firefox ≥ 115、WebView2、Electron ≥ 24（Custom Elements・Web Animations・IntersectionObserver・ResizeObserver・constructable stylesheets）。View Transitions とスクロール駆動アニメーションはプログレッシブ（対応時に使用、それ以外は JS）。サーバー（SSR）での import は何もしません。`baselineReport()` で確認できます。

## ドキュメント

- [API リファレンス](./docs/API.md)（英語）— 全エクスポート・オプション・`data-sa-*` 属性
- [プリセット一覧](./docs/presets.md)（全 214 種）
- [コンポーネント](./docs/components.md)（全 `<usa-*>` 要素・属性・イベント）
- [フレームワークと SSR](./docs/frameworks-ssr.md) · [Windows アプリ](./docs/windows-apps.md) · [ハイブリッドアプリ](./docs/hybrid-apps.md)
- [モーショントークン](./docs/motion-tokens.md) · [AOS からの移行](./docs/migration-from-aos.md) · [GSAP ScrollTrigger からの移行](./docs/migration-from-gsap-scrolltrigger.md)
- [デモ](./demo/index.html)（全プリセットをクリックで再生）

## アップグレード

- `use-scroll-animate` から：`npm i motionary` を実行し、import と CDN URL の `use-scroll-animate` を `motionary` に置き換えるだけです（旧パッケージ名も同じリリースを継続）。
- [6.0 へのアップグレード](./docs/upgrading-6.md)（`npx usa-codemod-6`）· [5.0](./docs/upgrading-5.md)（`npx usa-codemod-5`）· [4.0](./docs/upgrading-4.md) · [3.0](./docs/upgrading-3.md) · [2.0](./docs/deprecations.md)
- [変更履歴](./CHANGELOG.md)

## ロードマップ

7.0 まで 1 バージョン 1 PR — パーティクルと流体、テキスト効果、光と質感、3D シーン、モーフィング、トランジション、天気、インタラクティブ物理：[docs/ROADMAP.md](./docs/ROADMAP.md)。

## コントリビュートとライセンス

Issue と PR を歓迎します — [CONTRIBUTING.md](./CONTRIBUTING.md) を参照。MIT © HarrisonCN — [LICENSE](./LICENSE)。
