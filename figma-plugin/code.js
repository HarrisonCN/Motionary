// Motionary export — Figma plugin scaffold (9.7).
// Select frames / components with prototype interactions and run the plugin:
// it turns each node's reactions into a Motionary `data-motion` string
// (the same mapping as figmaToMotion() in motionary/design) and shows them
// in the UI for copying.
const EASE = { LINEAR: 'linear', EASE_IN: 'ease-in', EASE_OUT: 'ease-out', EASE_IN_AND_OUT: 'ease-in-out', EASE_OUT_BACK: 'cubic-bezier(0.34, 1.56, 0.64, 1)', GENTLE: 'cubic-bezier(0.22, 1, 0.36, 1)' };
const TRIG = { ON_CLICK: 'click', ON_PRESS: 'click', ON_HOVER: 'hover', MOUSE_ENTER: 'hover', AFTER_TIMEOUT: 'load' };
const DIR = { LEFT: 'left', RIGHT: 'right', TOP: 'down', BOTTOM: 'up' };
function toMotion(reactions) {
  return (reactions || [])
    .map((r) => {
      const t = TRIG[r.trigger && r.trigger.type];
      const tr = (r.action && r.action.transition) || (r.actions && r.actions[0] && r.actions[0].transition);
      if (!t || !tr) return null;
      const fx = tr.type === 'DISSOLVE' ? 'fade' : tr.type === 'SMART_ANIMATE' ? 'scale' : 'fade-' + (DIR[tr.direction] || 'up');
      const parts = [t + ': ' + fx, Math.round((tr.duration || 0.3) * 1000) + 'ms'];
      if (tr.easing && EASE[tr.easing.type]) parts.push(EASE[tr.easing.type]);
      return parts.join(' ');
    })
    .filter(Boolean)
    .join('; ');
}
figma.showUI(__html__, { width: 360, height: 420 });
const rows = figma.currentPage.selection.map((n) => ({ name: n.name, motion: 'reactions' in n ? toMotion(n.reactions) : '' }));
figma.ui.postMessage({ rows });
figma.ui.onmessage = (m) => m === 'close' && figma.closePlugin();
