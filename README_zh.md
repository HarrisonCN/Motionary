<div align="center">

# use-scroll-animate 🚀

**一个轻量级（~4KB gzipped）、零依赖的现代 Web 滚动动画库。**

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/HarrisonCN/use-scroll-animate?style=flat-square)](https://github.com/HarrisonCN/use-scroll-animate/releases)
[![GitHub repo size](https://img.shields.io/github/repo-size/HarrisonCN/use-scroll-animate?style=flat-square)](https://github.com/HarrisonCN/use-scroll-animate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

[English](./README.md) | [日本語](./README_ja.md)

</div>

## 为什么选择 `use-scroll-animate`？

在 2025 年，性能至关重要。传统的滚动动画库通常捆绑了沉重的依赖，依赖过时的滚动事件监听器，或者强制你使用特定的框架。

`use-scroll-animate` 的设计初衷截然不同：
- ⚡ **零依赖**：纯原生 JS/TypeScript 编写。
- 🚀 **高性能**：由 `IntersectionObserver` 和原生 `Web Animations API` 驱动。无滚动事件监听，无布局抖动。
- 🪶 **极轻量**：Gzip 后核心约 4KB。
- 🧩 **框架无关**：完美支持原生 JS、React、Vue、Svelte 等。内置一流的 React Hooks 和 Vue Composables。
- ♿ **无障碍**：原生支持 `prefers-reduced-motion`。

## 安装

```bash
npm install use-scroll-animate
```

## 快速上手 (原生 JS / HTML)

最简单的方法是通过 HTML 的 `data-sa` 属性。

```html
<!-- 1. 为元素添加 data-sa 属性 -->
<div data-sa data-sa-animation="fade-in-up" data-sa-duration="800">
  当滚动到我时，我会动起来！
</div>

<script type="module">
  // 2. 导入并初始化
  import ScrollAnimate from 'use-scroll-animate';
  ScrollAnimate.init();
</script>
```

## v1.2.0 新特性

- **单次触发 (Once)**：动画触发后自动停止观察，节省资源。
- **视口偏移 (Offset)**：支持设置元素进入视口多少像素后才触发动画。
- **新预设**：新增 `shimmer`（流光）、`pulse`（脉冲）、`swing`（摇摆）。
- **多语言支持**：新增中文和日文文档。

## 核心配置

| 选项 | 类型 | 默认值 | 描述 |
|--------|------|---------|-------------|
| `animation` | `string` \| `string[]` | `'fade-in-up'` | 预设名称或预设数组 |
| `duration` | `number` | `600` | 动画持续时间 (ms) |
| `delay` | `number` | `0` | 动画延迟 (ms) |
| `once` | `boolean` | `true` | 是否只触发一次 |
| `offset` | `number` | `0` | 触发动画的视口偏移量 (px) |
| `parallax` | `object` | `{}` | 视差效果配置 |

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。
