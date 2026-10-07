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
- 🪶 **超軽量**：Gzip後コア約4.8KB（`sequence`・`staggerChildren`・React/Vue ヘルパーを含む全体で約6.1KB）。
- 🧩 **フレームワークに依存しない**：Vanilla JS、React、Vue、Svelteなどとシームレスに動作。一流の React Hooks と Vue Composables を内蔵。
- ♿ **アクセシブル**：`prefers-reduced-motion` を標準でサポート。

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

- `'js'`：1.x の**デフォルト**（従来どおり）。`'auto'` / `'css'`：対応ブラウザではネイティブ、非対応なら自動的に JS にフォールバック。
- ネイティブエンジンでは `duration`・`delay`・`threshold`・`offset`・`stagger` は無効で、範囲は `viewRange`（デフォルト `['entry 0%', 'entry 100%']`）。`easing` は有効。HTML：`data-sa-engine`、`data-sa-view-range`。
- `once`（デフォルト）は完了時に最終状態を固定、`repeat: true` ではスクロールに双方向で追従。クラス名モード・reduced motion・`animate()`・`sequence()`・`staggerChildren()` は常に JS エンジン。`supportsScrollTimeline()` もエクスポート。

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

- **タイムライン `sequence()`**：複数要素のアニメーションを連結。各ステップは前のステップの終了後に開始し、`gap` で間隔（負の値で重ね合わせ）、`at` で絶対開始時刻を指定できます。`trigger` を指定するとその要素が表示されたときに一度だけ自動再生します。

  ```js
  import { sequence } from 'use-scroll-animate';
  const tl = sequence([
    { target: '.hero h1', animation: 'fade-in-up', duration: 700 },
    { target: '.hero p', animation: 'blur-in', gap: -300 },
    { target: '.hero .btn', animation: 'scale-up', stagger: 80 },
  ], { trigger: '.hero' });
  await tl.play(); // すべて完了すると resolve。tl.cancel() で停止し要素は表示されたまま
  ```

- **新しいプリセット**：`scale-up`、`blur-in-up`、`flip-up`、`flip-down`、`rotate-left`、`rotate-right`、clip-path による `clip-up`、`clip-down`、`clip-left`、`clip-right`、`clip-circle`。
- **メモリ使用量の削減**：`once` 要素はアニメーション開始後に自動でレジストリから削除されます（パララックス/`onProgress` が必要な要素を除く）。`WeakSet` で記憶されるため、`init()`/`observe()` で再生されることはありません。従来の挙動は `createScrollAnimate({ autoUnregister: false })`。
- **正しい `exports` マップ**：Node ESM は `dist/index.mjs`、CommonJS は `dist/index.js` に解決され、それぞれ対応する型定義付き。従来の `main`/`module`/`unpkg` と `dist/*` のディープインポートも引き続き利用可能。

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
