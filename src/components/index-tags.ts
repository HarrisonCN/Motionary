// The component categories and their default tags (no imports: safe for lazy loaders).
/** The component categories and their default tags. */
export const COMPONENT_CATEGORIES = {
  reveal: ['usa-reveal', 'usa-stagger', 'usa-scroll-progress', 'usa-scrolly'],
  text: ['usa-typewriter', 'usa-split-text', 'usa-scramble', 'usa-counter', 'usa-shimmer-text', 'usa-text-rotate', 'usa-wave-text', 'usa-glitch', 'usa-gradient-text', 'usa-handwriting', 'usa-scroll-highlight'],
  interaction: ['usa-ripple', 'usa-magnetic', 'usa-tilt', 'usa-spotlight', 'usa-press', 'usa-toggle'],
  feedback: ['usa-spinner', 'usa-skeleton', 'usa-progress', 'usa-toaster', 'usa-check'],
  background: ['usa-aurora', 'usa-particles', 'usa-grain', 'usa-marquee', 'usa-acrylic', 'usa-grid-glow', 'usa-blobs', 'usa-water-ripple', 'usa-dot-network'],
  transitions: ['usa-dialog', 'usa-accordion', 'usa-flip-list', 'usa-view-switch'],
  physics: ['usa-spring', 'usa-draggable', 'usa-overscroll'],
  cards: ['usa-card', 'usa-card-stack', 'usa-sticky-stack', 'usa-carousel-3d'],
  click: ['usa-click', 'usa-button', 'usa-icon-morph', 'usa-like', 'usa-hold', 'usa-double-tap', 'usa-checkbox'],
  ui: ['usa-tabs', 'usa-drawer', 'usa-bottom-sheet', 'usa-pull-refresh', 'usa-fab', 'usa-navbar', 'usa-slider', 'usa-rating', 'usa-tooltip', 'usa-popover', 'usa-badge', 'usa-avatar-stack'],
  page: ['usa-cursor', 'usa-fullpage', 'usa-loading-bar', 'usa-back-to-top', 'usa-ambient', 'usa-splash', 'usa-auto-skeleton', 'usa-motion-switch'],
  timeline: ['usa-timeline'],
  gesture: ['usa-swipeable', 'usa-pinch-zoom'],
  svg: ['usa-draw', 'usa-morph', 'usa-mask-reveal', 'usa-anim-icon'],
} as const;

export type ComponentCategory = keyof typeof COMPONENT_CATEGORIES;
