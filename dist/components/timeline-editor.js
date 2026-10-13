export { a as TIMELINE_DOC_FORMAT, f as TIMELINE_DOC_LIMITS, g as TIMELINE_DOC_VERSION, T as TimelineDocError, h as createSeededRandom, j as createTimelineDoc, e as isLayerActive, d as isLayerLocked, i as isValidEasing, n as normalizeTimelineDoc, p as parseTimelineDoc, r as resolveRandom, s as serializeTimelineDoc, b as timelineDocDuration, t as timelineDocFromAnimation, k as timelineDocToAnimation, v as validateTimelineDoc } from '../chunks/format-CHcmOPqK.js';
export { a as addKeyframe, e as addLayer, b as bindHistoryKeys, f as copyKeyframes, j as createTimelineHistory, i as editableKeyframes, k as groupLayers, h as historyKeyAction, l as layerSubtree, m as moveLayer, p as pasteKeyframes, r as removeKeyframes, n as removeLayers, o as scaleKeyframes, d as setKeyframeEasing, s as setKeyframeProps, g as shiftKeyframes, q as ungroupLayer, c as uniqueId, u as updateLayers } from '../chunks/history-lWoJx_Yk.js';
export { a as createFixedClock, c as createTimelinePreview, i as interpolateValue, s as sampleTimelineDoc } from '../chunks/preview-C9tONksA.js';
export { l as loadMotionDoc, a as timelineDocFromScene, t as timelineDocToScene } from '../chunks/scene-D5SKvFBd.js';

/**
 * 13.6: JSON Schema (draft 2020-12) of `motionary-timeline` v1, for editors and
 * other tools. `validateTimelineDoc` is the authority: it also checks what a
 * schema cannot (unique ids across layers, parents that are groups, no group
 * cycles, valid easings, total keyframe limit).
 */
const id = { type: 'string', minLength: 1, maxLength: 128 };
const value = { oneOf: [{ type: 'number' }, { type: 'string', maxLength: 2048 }] };
const TIMELINE_DOC_SCHEMA = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://cdn.jsdelivr.net/npm/motionary@14/docs/timeline-doc.schema.json',
    title: 'motionary-timeline v1',
    type: 'object',
    additionalProperties: false,
    required: ['format', 'version', 'layers'],
    properties: {
        format: { const: 'motionary-timeline' },
        version: { const: 1 },
        name: { type: 'string', maxLength: 2048 },
        duration: { type: 'number', minimum: 0, maximum: 1e7 },
        seed: { type: 'integer', minimum: 0, maximum: 4294967295 },
        meta: {},
        layers: {
            type: 'array',
            maxItems: 1000,
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['id', 'type'],
                properties: {
                    id,
                    type: { enum: ['track', 'group'] },
                    name: { type: 'string', maxLength: 2048 },
                    parent: id,
                    locked: { type: 'boolean' },
                    muted: { type: 'boolean' },
                    solo: { type: 'boolean' },
                    target: { type: 'string', minLength: 1, maxLength: 512 },
                    keyframes: {
                        type: 'array',
                        items: {
                            type: 'object',
                            additionalProperties: false,
                            required: ['id', 'time', 'props'],
                            properties: {
                                id,
                                time: { type: 'number', minimum: 0, maximum: 1e7 },
                                easing: { type: 'string', maxLength: 200 },
                                props: {
                                    type: 'object',
                                    maxProperties: 64,
                                    propertyNames: { pattern: '^(--[A-Za-z0-9_-]+|[a-zA-Z][A-Za-z0-9_-]*)$', not: { enum: ['constructor', 'prototype'] } },
                                    additionalProperties: value,
                                },
                            },
                        },
                    },
                },
                if: { properties: { type: { const: 'group' } } },
                then: { not: { anyOf: [{ required: ['target'] }, { required: ['keyframes'] }] } },
            },
        },
    },
};

export { TIMELINE_DOC_SCHEMA };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v14.7.0/dist/components/timeline-editor.js.map