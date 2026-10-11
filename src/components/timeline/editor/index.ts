/**
 * motionary/components/timeline-editor (13.6) — the editing model behind the
 * Timeline Playground: the versioned `motionary-timeline` v1 document
 * (layers, groups, lock / mute / solo, keyframes, seed) with a validator,
 * a lossless canonical serializer and `<usa-player>` import / export (14.0: reads and
 * writes Scene Format v2 — `timelineDocToScene`, `timelineDocFromScene`, `loadMotionDoc`); batch
 * keyframe operations; bounded undo / redo with gesture coalescing and
 * keyboard shortcuts; and a reproducible preview (same time → same frame,
 * seeded randomness, fixed-step clock).
 *
 * Editor-only and DOM-free except `createTimelinePreview` / `bindHistoryKeys`:
 * nothing here is imported by `motionary`, `motionary/core`,
 * `motionary/components/lite` or `motionary/components/timeline`.
 */
export {
  TIMELINE_DOC_FORMAT, TIMELINE_DOC_VERSION, TIMELINE_DOC_LIMITS, TimelineDocError,
  validateTimelineDoc, parseTimelineDoc, serializeTimelineDoc, normalizeTimelineDoc, createTimelineDoc,
  isValidEasing, isLayerActive, isLayerLocked, timelineDocDuration,
  createSeededRandom, resolveRandom, timelineDocToAnimation, timelineDocFromAnimation,
} from './format';
export type { TimelineDoc, TimelineLayer, TimelineKeyframe, TimelineValue, TimelineProblem } from './format';
export {
  uniqueId, layerSubtree, addLayer, removeLayers, updateLayers, groupLayers, ungroupLayer, moveLayer,
  editableKeyframes, addKeyframe, setKeyframeProps, removeKeyframes, shiftKeyframes, scaleKeyframes,
  setKeyframeEasing, copyKeyframes, pasteKeyframes,
} from './ops';
export type { AddLayerOptions, KeyframeClip } from './ops';
export { createTimelineHistory, historyKeyAction, bindHistoryKeys } from './history';
export type { TimelineHistory, HistoryOptions, ApplyOptions } from './history';
export { sampleTimelineDoc, interpolateValue, createFixedClock, createTimelinePreview } from './preview';
export type { TimelineFrame, FixedClock, TimelinePreview } from './preview';
export { TIMELINE_DOC_SCHEMA } from './schema';
export { timelineDocToScene, timelineDocFromScene, loadMotionDoc } from './scene';
export type { SceneLoss } from './scene';
