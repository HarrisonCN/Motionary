<div align="center">

# use-scroll-animate 🚀

**軽量（~4KB gzipped）、依存関係なしのモダンWeb向けスクロールアニメーションライブラリ。**

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/HarrisonCN/use-scroll-animate?style=flat-square)](https://github.com/HarrisonCN/use-scroll-animate/releases)
[![GitHub repo size](https://img.shields.io/github/repo-size/HarrisonCN/use-scroll-animate?style=flat-square)](https://github.com/HarrisonCN/use-scroll-animate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

[English](./README.md) | [简体中文](./README_zh.md)

</div>

## なぜ `use-scroll-animate` なのか？

2025年、パフォーマンスはすべてです。従来のスクロールアニメーションライブラリは、重い依存関係をバンドルしたり、古いスクロールイベントリスナーに依存したり、特定のフレームワークを強制したりすることがよくあります。

`use-scroll-animate` は違います：
- ⚡ **依存関係なし**：純粋な Vanilla JS/TypeScript。
- 🚀 **高パフォーマンス**：`IntersectionObserver` とネイティブの `Web Animations API` で駆動。スクロールイベントリスナーなし、レイアウトスラッシングなし。
- 🪶 **超軽量**：Gzip後コア約4KB。
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

## v1.2.0 の新機能

- **一度だけ実行 (Once)**：アニメーション実行後に監視を自動停止し、リソースを節約。
- **オフセット (Offset)**：要素がビューポートに入ってから何ピクセル後にアニメーションを開始するかを指定可能。
- **新しいプリセット**：`shimmer`（シマー）、`pulse`（パルス）、`swing`（スイング）を追加。
- **多言語サポート**：中国語と日本語のドキュメントを追加。

## 主な設定

| オプション | 型 | デフォルト | 説明 |
|--------|------|---------|-------------|
| `animation` | `string` \| `string[]` | `'fade-in-up'` | プリセット名またはプリセットの配列 |
| `duration` | `number` | `600` | アニメーションの長さ (ms) |
| `delay` | `number` | `0` | アニメーションの遅延 (ms) |
| `once` | `boolean` | `true` | 一度だけ実行するかどうか |
| `offset` | `number` | `0` | アニメーションを開始するビューポートのオフセット (px) |
| `parallax` | `object` | `{}` | パララックス効果の設定 |

## ライセンス

このプロジェクトは MIT ライセンスの下でライセンスされています - 詳細は [LICENSE](LICENSE) ファイルを参照してください。
