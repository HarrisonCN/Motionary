<div align="center">

# Motionary

**Web のためのスクロールアニメーション、アニメーション付き Web Components、そして依存ゼロのモーションランタイム。**

_旧名 **use-scroll-animate**。旧 npm パッケージも、同じビルドのエイリアスとして引き続き公開しています。_

[![npm](https://img.shields.io/npm/v/motionary?style=flat-square)](https://www.npmjs.com/package/motionary) [![CI](https://github.com/HarrisonCN/Motionary/actions/workflows/ci.yml/badge.svg)](https://github.com/HarrisonCN/Motionary/actions/workflows/ci.yml) [![motionary/core size](https://deno.bundlejs.com/?q=motionary/core&badge)](https://bundlejs.com/?q=motionary/core) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)

[English](./README.md) | [简体中文](./README_zh.md) | **日本語**

**[アニメーションストア](https://harrisoncn.github.io/Motionary/showcase/)** · **[コンポーネント](https://harrisoncn.github.io/Motionary/showcase/components.html)** · **[コンポーネントプレイグラウンド](https://harrisoncn.github.io/Motionary/showcase/run.html)** · **[タイムラインエディタ](https://harrisoncn.github.io/Motionary/showcase/playground.html)** · **[スクロールストーリー](https://harrisoncn.github.io/Motionary/showcase/story.html)**

</div>

Motionary は、スクロールして画面に入ってきたコンテンツをアニメーションで表示し、さらに <!--fact:public-->209<!--/fact--> 個の `<usa-*>` カスタム要素を提供します。カード、ボタン、物理演算、ページ遷移、ジェネレーティブ背景、Lottie、WebGL などがそろっています。素の HTML でも、React・Vue・Svelte・Solid・Angular でも、Electron・Tauri・WebView2 といったデスクトップの Web ビューでも、そのまま動きます。ランタイム依存はゼロ。すべてのエントリポイントは tree-shaking でき、CI で gzip サイズの上限がチェックされます。どのアニメーションも `prefers-reduced-motion` を尊重します。

> 13.0：見つける・コピーする・動かす。12.x で追加したツール群が安定版になりました。MCP のマウント検証（`validate_snippet { mount: true }`）とバージョンに応じた回答（`check_compat`）、Figma プラグインのエクスポート、[コンポーネントプレイグラウンド](https://harrisoncn.github.io/Motionary/showcase/run.html)、`npx motionary export`、`npx motionary compat` です。11.5 で非推奨になったインポートパスは削除されました。詳しくは [13 へのアップグレード](#13-へのアップグレード) を参照してください。

## 目次

[特長](#特長) · [インストール](#インストール) · [クイックスタート](#クイックスタート) · [ランタイムの階層](#ランタイムと階層) · [コンポーネント](#コンポーネントギャラリープレイグラウンド) · [CLI](#cli) · [MCP サーバーと AI](#mcp-サーバーと-ai) · [Figma プラグイン](#figma-プラグイン) · [アクセシビリティ](#アクセシビリティ) · [サイズ上限](#サイズ上限) · [13 へのアップグレード](#13-へのアップグレード) · [バージョン](#バージョンと互換性) · [ドキュメント](#ドキュメント) · [コントリビュート](#コントリビュート) · [リファレンス](#リファレンス)

## 特長

- **スクロール表示プリセット 214 種**を 14 のファミリーで提供（コアに 33 種、`motionary/presets/extended` にさらに 181 種）。フェード、ズーム、3D フリップ、clip-path の図形、ブラーとマスク、バウンス、奥行き、グリッチ、スクロール量に連動する `scrub-*` など。`timeline()`、`staggerChildren()`、`parallax()` もあります。
- **`<usa-*>` Web Components <!--fact:public-->209<!--/fact--> 個**：`motionary/components` にカテゴリ別で <!--fact:core-->91<!--/fact--> 個のコアコンポーネント、さらにウィジェットが <!--fact:widgets-->118<!--/fact--> 個あり、それぞれ専用のエントリポイント（`motionary/widgets/<name>`）を持ちます。加えて、専用エントリ（`motionary/effects/<name>`）を持つエフェクトが <!--fact:effects-->141<!--/fact--> 種あります。数え方は [docs/components.md](./docs/components.md#how-components-are-counted) を参照。
- **Motion Core**：`motionary/core` の `createMotion()`。プラグイン方式のエンジンで、gzip 後およそ 2.5 KB（上限 10 KB）です。
- **独自のランタイム**：`motionary/runtime`（ticker・tween・timeline）と <!--fact:runtimeModules-->20<!--/fact--> のモジュール。スクロールシーン、スムーズスクロール、テキスト分割、SVG モーフィング、スプライト、GIF / APNG / WebP、Lottie と dotLottie、WebGL2、glTF / OBJ、2D 物理演算をカバーします。モジュールは 3 つの階層に分かれていて、インポートした分だけのサイズで済みます。
- **どのフレームワークでも**：`motionary/react`、`motionary/vue`、`motionary/svelte`、`motionary/solid`、`motionary/angular`。要素用のラッパー `motionary/components/react` · `vue` · `svelte` · `solid` もあります。サーバー側でインポートしても何も起きません。
- **ツール群**：AI アシスタント向けの MCP サーバー、ローカルで動くモーション解析器（任意の LLM も接続可能）、Figma プラグイン、CSS / ミニプログラム WXSS / HarmonyOS ArkTS へ書き出す CLI、そしてメジャーバージョンごとの codemod。
- **アクセシビリティが標準**：どこでも reduced motion に対応し、ユーザー向けのモーション切り替えも用意。すべての要素が同じコンポーネント規約（属性・イベント・キーボード・ライフサイクル）に従い、CI で検証されます。

## インストール

```bash
npm i motionary
```

ビルドツールを使わない場合は CDN からどうぞ。URL はメジャーバージョン（`@13`）で固定します。

```html
<script src="https://unpkg.com/motionary@13/dist/index.umd.js"></script>            <!-- スクロール API：window.ScrollAnimate -->
<script src="https://unpkg.com/motionary@13/dist/presets-extended.umd.js"></script> <!-- プリセット +181 種 -->
<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>       <!-- motionary/components の要素：window.UsaComponents -->
<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>          <!-- ウィジェット：window.UsaWidgets -->
```

jsDelivr も使えます：`https://cdn.jsdelivr.net/npm/motionary@13/dist/…`。`use-scroll-animate` をお使いの場合も、同じバージョンで引き続き公開されます。乗り換えるときは、import と URL のパッケージ名を置き換えるだけです（[詳細](./docs/versions.md)）。

## クイックスタート

### HTML：data 属性

```html
<h2 data-sa data-sa-animation="fade-in-up">Hello</h2>
<div data-sa data-sa-animation="bounce-in-up" data-sa-delay="150">Card</div>

<script type="module">
  import ScrollAnimate from 'motionary';
  import 'motionary/presets/extended'; // 任意：プリセット +181 種（bounce-in-up、clip-diamond など）
  ScrollAnimate.init();                // すべての [data-sa] を対象にする
</script>
```

すべてのオプションに対応する `data-sa-*` 属性があります（[API リファレンス](./docs/API.md)）。

### JavaScript

```js
import ScrollAnimate, { staggerChildren, parallax } from 'motionary';

ScrollAnimate.observe('.card', { animation: 'zoom-in-up', duration: 800, easing: 'spring' });
staggerChildren(document.querySelector('.grid'), { animation: 'stagger-pop', stagger: 60 });
parallax('.hero-bg', { speed: 0.3 });
// ブラウザが対応していればネイティブのスクロールタイムラインを使い、メインスレッドの外で動かす
ScrollAnimate.observe('.logo', { animation: 'scrub-spin', engine: 'css', viewRange: ['cover 0%', 'cover 100%'] });
```

### Motion Core（`motionary/core`）

```js
import { createMotion } from 'motionary/core';
import { retro, cinema } from 'motionary/plugins';

const motion = createMotion().use(retro, cinema);
motion.reveal('.card', 'fade-up', { stagger: 80 });       // スクロールで登場
motion.bind(button, 'vhs-glitch', { trigger: 'click' });  // トリガーにエフェクトを割り当てる
await motion.play(hero, 'dolly-in', { duration: 900 });   // 1 回再生して終了を待つ
```

詳しくは [docs/core.md](./docs/core.md)。

### Web Components

```html
<script type="module">
  import { defineComponents } from 'motionary/components';
  defineComponents(); // または 'motionary/components/lazy' の lazyDefine()：ページにあるタグだけを読み込む
</script>

<usa-card effect="holo">…</usa-card>
<usa-button deform="gooey">Buy</usa-button>
<usa-fx effect="confetti" trigger="click"><button>Celebrate</button></usa-fx>
```

### フレームワーク

アダプターはそれぞれ独立したエントリポイントで、アンマウント時に後片付けもします。

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
scrollAnimate; // ディレクティブの import を残す（TypeScript）
export const Card = () => <div use:scrollAnimate={{ animation: 'blur-in-up' }}>Hello</div>;
```

```ts
// Angular（standalone）：<usa-*> 要素を使う
import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { provideUsa } from 'motionary/angular';
// app.config.ts：providers: [provideUsa(APP_INITIALIZER, ['click', 'ui'])]   （登録するカテゴリ）
@Component({ standalone: true, schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<usa-checkbox label="Motion" [checked]="on" (usa:change)="on = $any($event).detail.checked"></usa-checkbox>` })
export class Settings { on = false; }
```

SSR、Next.js、Nuxt、SvelteKit については [docs/frameworks-ssr.md](./docs/frameworks-ssr.md)。公開サブパスの一覧（レイヤー別）は [docs/public-api.md](./docs/public-api.md) にあります。

## ランタイムと階層

`motionary/runtime` は Motionary 独自のアニメーションランタイムです。共有の ticker と tween・timeline エンジンに加え、機能やファイル形式ごとのモジュール（`motionary/runtime/<module>`）で構成されます。使うモジュールを `use()` で登録します。各モジュールはいずれかの階層に属し、同じ階層か下の階層にしか依存しません。そのため、基本機能だけのページが WebGL・3D・物理演算のコードを読み込むことはありません。

| 階層 | モジュール | バンドル（gzip、13.0） | 上限 |
|---|---|---:|---:|
| **Basic** | core（ticker・tween・timeline）、`scroll`、`text`、`format-css`、`format-motion` | 10.83 KB | 12 KB |
| **Standard** | Basic ＋ `smooth`、`drag-snap`、`format-svg`、`format-sprite`、`format-gif`、`format-apng`、`format-webp`、`vector`（Lottie / dotLottie）、`lottie-state`、公式 Rive ランタイム | 33.74 KB | 37 KB |
| **Advanced** | Standard ＋ `gl`（WebGL2）、`format-gltf`、`format-obj`、`gltf-anim`、`gltf-decoders`（Draco / KTX2）、`physics`、`format-scene` | 54.55 KB | 60 KB |

```js
import { use } from 'motionary/runtime';
import { scroll } from 'motionary/runtime/scroll';
import { defineScrollScene } from 'motionary/components/widgets';

use(scroll);          // 先にモジュールを登録（core も一緒に登録される）
defineScrollScene();  // そのあとで、それを使うコンポーネントを登録
```

モジュールが必要なコンポーネントには、ギャラリーで **Requires:** バッジが付きます。モジュールが足りないときは、インストール・インポート・CDN の方法を示すわかりやすいエラーを出します。詳しくは [docs/runtime-tiers.md](./docs/runtime-tiers.md) と、モジュールごとのページ [docs/runtime/](./docs/runtime/) を参照してください。

## コンポーネント・ギャラリー・プレイグラウンド

| ページ | 内容 |
|---|---|
| [アニメーションストア](https://harrisoncn.github.io/Motionary/showcase/) | すべてのプリセットとエフェクトを、デスクトップとスマホのサイズでプレビュー・調整・コピー |
| [コンポーネント](https://harrisoncn.github.io/Motionary/showcase/components.html) | ギャラリー：各 `<usa-*>` 要素の属性、前提モジュール、階層 |
| [コンポーネントプレイグラウンド](https://harrisoncn.github.io/Motionary/showcase/run.html) | コンポーネントごとに動く完全なページ。編集して **Run**、**Copy**、**Download** — 3 つともエディタの内容そのものを使います（ダウンロードしたファイルは単体で動作）。HTML (CDN) はページ全体を実行し、npm + bundler はインポートマップでモジュールを実行。前提モジュールの不足やエラーは修正方法付きで表示。`run.html#usa-tilt` のようなディープリンクにも対応 |
| [タイムラインエディタ](https://harrisoncn.github.io/Motionary/showcase/playground.html) | ビジュアルなキーフレーム編集。`<usa-player>` 用の JSON を書き出せます |
| [スクロールストーリー](https://harrisoncn.github.io/Motionary/showcase/story.html) | `<usa-story>` のスクロールストーリーテンプレート |
| [クロスプラットフォームプレビュー](https://harrisoncn.github.io/Motionary/showcase/xplat.html) | 1 つのプリセットを Web・ミニプログラム・HarmonyOS ArkUI で見比べる |
| [demo/index.html](./demo/index.html) | 全プリセット。ビルド不要（ローカルで開くだけ） |

カテゴリ単位（`motionary/components/cards`）、全部まとめて（`motionary/components`）、CSS をオンデマンドで読み込むビルド（`motionary/components/lite`）、ウィジェット 1 つだけ（`motionary/widgets/<name>`、例：`motionary/widgets/toast-stack`）のいずれでもインポートできます。全要素は [docs/components.md](./docs/components.md)、要素ごとのページは [docs/components/](./docs/components/README.md)、全エントリポイントは [docs/entry-points.md](./docs/entry-points.md) にあります。

<details>
<summary><b><code>motionary/components</code> の <!--fact:core-->91<!--/fact--> コア要素</b></summary>

<!-- core-table:start -->
| カテゴリ | エントリ | 要素 |
|---|---|---|
| **スクロール表示** | `motionary/components/reveal` | `<usa-reveal>` · `<usa-scroll-progress>` · `<usa-scrolly>` · `<usa-stagger>` |
| **テキスト** | `motionary/components/text` | `<usa-counter>` · `<usa-glitch>` · `<usa-gradient-text>` · `<usa-handwriting>` · `<usa-scramble>` · `<usa-scroll-highlight>` · `<usa-shimmer-text>` · `<usa-split-text>` · `<usa-text-rotate>` · `<usa-typewriter>` · `<usa-wave-text>` |
| **インタラクション** | `motionary/components/interaction` | `<usa-magnetic>` · `<usa-press>` · `<usa-ripple>` · `<usa-spotlight>` · `<usa-tilt>` |
| **フィードバック** | `motionary/components/feedback` | `<usa-check>` · `<usa-progress>` · `<usa-skeleton>` · `<usa-spinner>` · `<usa-toaster>` |
| **背景** | `motionary/components/background` | `<usa-acrylic>` · `<usa-aurora>` · `<usa-blobs>` · `<usa-dot-network>` · `<usa-grain>` · `<usa-grid-glow>` · `<usa-marquee>` · `<usa-particles>` · `<usa-water-ripple>` |
| **トランジション** | `motionary/components/transitions` | `<usa-accordion>` · `<usa-dialog>` · `<usa-view-switch>` |
| **バネ・物理** | `motionary/components/physics` | `<usa-draggable>` · `<usa-overscroll>` · `<usa-spring>` |
| **カード** | `motionary/components/cards` | `<usa-card>` · `<usa-card-stack>` · `<usa-carousel-3d>` · `<usa-sticky-stack>` |
| **クリック・ボタン** | `motionary/components/click` | `<usa-button>` · `<usa-checkbox>` · `<usa-click>` · `<usa-double-tap>` · `<usa-hold>` · `<usa-icon-morph>` · `<usa-like>` |
| **UI キット** | `motionary/components/ui` | `<usa-avatar-stack>` · `<usa-badge>` · `<usa-bottom-sheet>` · `<usa-drawer>` · `<usa-fab>` · `<usa-navbar>` · `<usa-popover>` · `<usa-pull-refresh>` · `<usa-slider>` · `<usa-tabs>` |
| **ページ全体** | `motionary/components/page` | `<usa-ambient>` · `<usa-auto-skeleton>` · `<usa-back-to-top>` · `<usa-cursor>` · `<usa-fullpage>` · `<usa-loading-bar>` · `<usa-motion-switch>` · `<usa-splash>` |
| **タイムライン** | `motionary/components/timeline` | `<usa-timeline>` |
| **ジェスチャー** | `motionary/components/gesture` | `<usa-pinch-zoom>` · `<usa-swipeable>` |
| **SVG** | `motionary/components/svg` | `<usa-anim-icon>` · `<usa-draw>` · `<usa-mask-reveal>` · `<usa-morph>` |
| **WebGL** | `motionary/components/webgl` | `<usa-distort>` · `<usa-liquid>` · `<usa-post-fx>` · `<usa-shader>` |
| **3D 奥行き** | `motionary/components/depth` | `<usa-cube>` · `<usa-depth>` |
| **レイアウト** | `motionary/components/layout` | `<usa-auto-animate>` · `<usa-masonry>` |
| **パック** | `motionary/components/packs` | `<usa-pack>` |
| **エフェクトレジストリ** | `motionary/components/fx` | `<usa-fx>` |
| **エフェクトパック** | `motionary/components/effects` | `<usa-audio>` · `<usa-gesture-fx>` · `<usa-motion-theme>` · `<usa-player>` · `<usa-story>` |
<!-- core-table:end -->

</details>

## CLI

どれも `motionary` パッケージに含まれていて、`npx` で実行できます。

| コマンド | 内容 |
|---|---|
| `npx motionary doctor [paths…] [--json]` | プロジェクト内の削除済みインポートパスと旧イベント名を一覧表示。見つかると終了コード 1 を返すので、CI にもそのまま組み込めます |
| `npx motionary export --target css\|wxss\|arkts [--presets a,b] [--rpx] [--out file]` | プリセットとモーショントークンを CSS、ミニプログラムの WXSS、HarmonyOS の ArkTS に書き出す（[docs/cross-platform.md](./docs/cross-platform.md)） |
| `npx motionary compat <version> [--json]` | そのバージョンのプロジェクトで使えるもの、その後に変わったもの（[docs/version-compat.md](./docs/version-compat.md)） |
| `npx usa-codemod-13 [--write] [paths…]` | 13.0 で削除されたパスと、`@10` / `@11` / `@12` に固定された CDN URL を書き換えます。`--write` を付けなければドライランです。それ以前のメジャーには `usa-codemod-5` … `usa-codemod-12` があります |
| `npx create-motionary-plugin <name>` | テストと署名スクリプト付きのエフェクトプラグインのひな形を作成 |
| `npx -y -p motionary motionary-mcp` | MCP サーバーを起動（次の節） |

## MCP サーバーと AI

`motionary-mcp` は読み取り専用の [Model Context Protocol](https://modelcontextprotocol.io) サーバーです。Claude、Cursor、VS Code、Windsurf、Zed などの MCP クライアントからコンポーネントカタログを検索でき、前提モジュールのインストール・インポート・登録が正しい順序で済んだスニペットを受け取れます。

```json
{ "mcpServers": { "motionary": { "command": "npx", "args": ["-y", "-p", "motionary", "motionary-mcp"] } } }
```

Claude Code の場合：`claude mcp add motionary -- npx -y -p motionary motionary-mcp`。

- ツール：`list_components`、`search_components`、`get_component`、`get_example`、`scaffold_snippet`、`suggest_motion`、`validate_snippet`、`check_compat`。
- `validate_snippet { mount: true }` は、jsdom（オプションの peer 依存：`npm i -D jsdom`）上で実際のバンドルを使ってマークアップをマウントし、コンポーネント規約に沿っているかを検査します。スニペット自体のスクリプトは実行されません。
- 回答はプロジェクトにインストールされているバージョンに合わせて返ります。`check_compat` は、そのバージョンに足りないものや挙動が違うものを一覧にします。
- ガイド全文：[docs/mcp.md](./docs/mcp.md)。

**文章からモーションを作る。** `motionary/tooling/ai` は「カードを下からゆっくり順番にフェードイン」のような説明文を、エフェクト・キーフレーム・CSS・対応するコンポーネントに変換します。標準の解析器はローカルで動き、結果は決定的です（英語と中国語に対応）。自分の LLM を使いたい場合は、`suggestMotion()` に provider を渡します。Motionary はベンダーの SDK を同梱しておらず、provider を渡さない限りネットワークにアクセスしません。モデルの回答は JSON Schema で検証され、通らなければローカルの結果に切り替わります。

```ts
import { suggestMotion } from 'motionary/tooling/ai';
const { intent, source } = await suggestMotion('cards cascade in like falling dominoes', { provider }); // provider は省略可
el.animate(intent.keyframes, intent.options);
```

関連：[docs/ai-provider.md](./docs/ai-provider.md) · [プロンプトガイド](./docs/ai-prompt-guide.md) · [AGENTS.md](./AGENTS.md) · サイトのルートで [`components.json`](https://harrisoncn.github.io/Motionary/components.json) と [`llms.txt`](https://harrisoncn.github.io/Motionary/llms.txt) を配信しています。

## Figma プラグイン

[figma-plugin/](./figma-plugin/README.md)（`node_modules/motionary/figma-plugin/` にも同梱）は、選択中のレイヤーを 3 つの形式で書き出します。**そのまま開ける HTML ページ**（トークン、正しい順序の前提スクリプト、レイヤーごとに 1 要素）、**CSS トークン**、そして **motion.tokens.json**（W3C デザイントークン）です。コンポーネント名を付けたレイヤー（`usa-tilt` など）はその要素になり、Figma 変数の `motion/duration/*` と `motion/easing/*` は既定のトークンを上書きします。プラグインはネットワークにアクセスせず、ドキュメントを書き換えることもありません。詳しくは [figma-plugin/README.md](./figma-plugin/README.md) と [docs/motion-tokens.md](./docs/motion-tokens.md) を参照してください。

## アクセシビリティ

- `prefers-reduced-motion: reduce` のときは、スクロール表示がすぐにコンテンツを表示し（登場・パララックス・scrub の動きなし）、コンポーネントも落ち着いた状態に切り替わります（`staticAlternative()`、`adaptKeyframes()`）。
- `motionary/components/a11y`：`setMotionSensitivity()` でユーザーが点滅・ループ・パララックスをオフにできます。ライブリージョン用の `announce()`、`auditMotionA11y()`、`baselineReport()` もあります。`<usa-motion-switch>` はすぐに使えるモーション切り替えスイッチです。
- すべての要素が同じ[コンポーネント規約](./docs/component-contract.md)（キーボード、フォーカス、イベント、ライフサイクル、reduced motion）に従い、CI の `npm run check:contract` で検証されます。
- 詳しくは [docs/accessibility.md](./docs/accessibility.md)。

## サイズ上限

すべてのエントリポイントに、[`size-budget.json`](./size-budget.json) で固定の gzip 上限が設定されています（全 401 項目）。上限を超えるエントリがあれば CI は失敗し、上限が自動で引き上げられることはありません。13.0.0 ビルドでの実測値（minify ＋ gzip）は次のとおりです。

| インポートするもの | gzip | 上限 |
|---|---:|---:|
| `motionary/core`（`createMotion`） | 2.53 KB | 10.00 KB |
| `import ScrollAnimate from 'motionary'`（デフォルトインスタンス） | 5.49 KB | 6.00 KB |
| `motionary` のすべて | 8.77 KB | 9.75 KB |
| `dist/index.umd.js`（CDN） | 8.93 KB | 9.75 KB |
| `parallax()` のみ | 0.94 KB | 2.00 KB |
| `motionary/presets/extended`（181 プリセット） | 4.69 KB | 5.25 KB |
| `motionary/runtime`（ランタイムのコア） | 5.42 KB | 5.50 KB |
| `motionary/components/reveal` | 4.32 KB | 5.00 KB |
| `motionary/components/lite`（全要素、CSS はオンデマンド） | 69.61 KB | 70.00 KB |
| `motionary/components`（全要素 ＋ CSS） | 85.66 KB | 93.75 KB |
| `dist/components.umd.js`（CDN、すべて） | 107.40 KB | 115.75 KB |

既定ではスクロールイベントを監視せず（IntersectionObserver を使用）、アニメーションはコンポジタで処理できるプロパティ（`transform`、`opacity`、`filter`、`clip-path`）に限られます。インポート自体に副作用はありません（[docs/tree-shaking.md](./docs/tree-shaking.md)）。PR ごとに、ヘッドレス Chrome でファーストビューの転送量、スクリプト時間、GPU リソース、フレームの安定性も計測しています（[docs/perf-ci.md](./docs/perf-ci.md)）。ソースマップは npm には含めず、GitHub の各リリースに添付しています（[docs/source-maps.md](./docs/source-maps.md)）。詳しくは [docs/performance.md](./docs/performance.md)。

**対応ブラウザ：** 2023 年以降のエバーグリーンブラウザ（Chrome / Edge ≥ 111、Safari ≥ 16.4、Firefox ≥ 115、WebView2、Electron ≥ 24）。View Transitions やスクロール駆動アニメーションは、ブラウザが対応していれば使い、未対応なら JavaScript にフォールバックします。`baselineReport()` で個々のブラウザを確認できます。

## 13 へのアップグレード

13.0 の破壊的変更は 1 つだけです：**11.5 で非推奨になったインポートパスを削除しました。** 置き換え先は同じファイルを指しているので、挙動もバンドルサイズも変わりません。

```bash
npx motionary doctor            # プロジェクト内の削除済みパス（と残っている旧イベント名）を一覧表示
npx usa-codemod-13 --write      # まとめて書き換え。@10 / @11 / @12 に固定された CDN URL も @13 に
```

| 削除されたパス | 代わりに使うもの |
|---|---|
| ~~motionary/components/core~~ | `motionary/core` |
| ~~motionary/components/ai~~ | `motionary/tooling/ai` |
| ~~motionary/components/design~~、~~motionary/design~~ | `motionary/tooling/design` |
| ~~motionary/components/angular~~ | `motionary/angular` |
| ~~motionary/manifest.json~~、~~motionary/manifest.schema.json~~ | `motionary/tooling/manifest.json`、`motionary/tooling/manifest.schema.json` |

`use-scroll-animate/…` も同様です。ガイド全文は [docs/upgrading-13.md](./docs/upgrading-13.md)。それ以前のメジャー：[12](./docs/upgrading-12.md) · [11](./docs/upgrading-11.md) · [10](./docs/upgrading-10.md) · [9](./docs/upgrading-9.md) · [8](./docs/upgrading-8.md) · [7](./docs/upgrading-7.md) · [6](./docs/upgrading-6.md) · [5](./docs/upgrading-5.md) · [4](./docs/upgrading-4.md) · [3](./docs/upgrading-3.md) · [2](./docs/deprecations.md)。ほかのライブラリからの移行：[AOS](./docs/migration-from-aos.md) · [GSAP ScrollTrigger](./docs/migration-from-gsap-scrolltrigger.md)。

## バージョンと互換性

- **npm の dist-tag：** `latest` は現在のメジャーとそのパッチ（13.0.2）を指します。マイナーリリースにはそれぞれ `v<major>-<minor>` のタグも付きます（例：`v12-9`）。`motionary` と `use-scroll-animate` は常に同じバージョンで同時に公開されます。
- **CDN：** URL はメジャーで固定します（`motionary@13`）。正確なバージョン指定（`motionary@12.4.0`）もそのまま使えます。
- **セマンティックバージョニング：** 破壊的変更はメジャーだけで行い、毎回ガイドと codemod を用意します。非推奨になったものは次のメジャーまで残り、その間は型に `@deprecated` が付くだけで、実行時の警告は出ません。
- **各バージョンに含まれるもの：** コンポーネントとランタイムモジュールごとの `since` / `changed`（[docs/version-compat.md](./docs/version-compat.md)）、機能ごとの対応状況（[docs/compat-matrix.md](./docs/compat-matrix.md)）。
- 詳細：[docs/versions.md](./docs/versions.md) · [CHANGELOG.md](./CHANGELOG.md)。

## ドキュメント

| テーマ | ドキュメント |
|---|---|
| リファレンス | [API](./docs/API.md) · [プリセット](./docs/presets.md)（全 214 種）· [コンポーネント](./docs/components.md) · [エントリポイント](./docs/entry-points.md) · [レイヤー別の公開 API](./docs/public-api.md) · [Motion Core](./docs/core.md) |
| ランタイム | [ランタイムの階層](./docs/runtime-tiers.md) · [モジュール](./docs/runtime/) · [互換性マトリクス](./docs/compat-matrix.md) |
| プラットフォーム | [フレームワークと SSR](./docs/frameworks-ssr.md) · [Windows アプリ](./docs/windows-apps.md) · [ハイブリッドアプリ（MAUI、Flutter、Electron、Tauri）](./docs/hybrid-apps.md) · [クロスプラットフォーム書き出し](./docs/cross-platform.md) · [サンプル](./examples/) |
| デザインと AI | [モーショントークン](./docs/motion-tokens.md) · [Figma プラグイン](./figma-plugin/README.md) · [MCP サーバー](./docs/mcp.md) · [AI provider](./docs/ai-provider.md) · [プロンプトガイド](./docs/ai-prompt-guide.md) |
| 品質 | [アクセシビリティ](./docs/accessibility.md) · [コンポーネント規約](./docs/component-contract.md) · [パフォーマンス](./docs/performance.md) · [パフォーマンス CI](./docs/perf-ci.md) · [Tree-shaking](./docs/tree-shaking.md) · [ソースマップ](./docs/source-maps.md) |
| プロジェクト | [アーキテクチャ](./docs/architecture.md) · [ロードマップ](./docs/ROADMAP.md) · [バージョン](./docs/versions.md) · [変更履歴](./CHANGELOG.md) |

アーキテクチャは Motion Core、ランタイム、コンポーネント、ツールの 4 層で、その上にフレームワーク用のエントリがあります。レイヤー間のインポートルールは `test/architecture.test.ts` で検証しています（[docs/architecture.md](./docs/architecture.md)）。

この README 以外の `docs/` のドキュメントは主に英語です（ロードマップは中国語）。

## コントリビュート

Issue や Pull Request を歓迎します。[CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。PR を出す前に `npm test`、`npm run build`、`npm run check:contract`、`npm run check:peer-docs`、`npm run size:check` を実行してください。挙動を変えたときは、[README.md](./README.md)、[README_zh.md](./README_zh.md)、このファイルを一緒に更新してください。

## ライセンス

MIT © HarrisonCN。[LICENSE](./LICENSE) を参照してください。

## リファレンス

ランタイムモジュールの一覧、各コンポーネントの前提条件（インストール、インポートと登録の順序、CDN の読み込み順、最小の例）、11.0 で凍結した互換性マトリクスは、テスト済みのモジュールデータから `node scripts/gen-runtime-docs.mjs` で生成しており、英語版のみです。英語 README の [Reference](./README.md#reference) 節、[docs/runtime/](./docs/runtime/)、[docs/compat-matrix.md](./docs/compat-matrix.md) を参照してください。
