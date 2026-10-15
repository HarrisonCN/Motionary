'use strict';

var format = require('../chunks/format-b5fQz-vc.cjs');
var history = require('../chunks/history-B0Ml40k1.cjs');
var preview = require('../chunks/preview-kiMCBqSF.cjs');
var scene = require('../chunks/scene-U2YkjCm0.cjs');

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
    $id: 'https://cdn.jsdelivr.net/npm/motionary@16/docs/timeline-doc.schema.json',
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

exports.TIMELINE_DOC_FORMAT = format.TIMELINE_DOC_FORMAT;
exports.TIMELINE_DOC_LIMITS = format.TIMELINE_DOC_LIMITS;
exports.TIMELINE_DOC_VERSION = format.TIMELINE_DOC_VERSION;
exports.TimelineDocError = format.TimelineDocError;
exports.createSeededRandom = format.createSeededRandom;
exports.createTimelineDoc = format.createTimelineDoc;
exports.isLayerActive = format.isLayerActive;
exports.isLayerLocked = format.isLayerLocked;
exports.isValidEasing = format.isValidEasing;
exports.normalizeTimelineDoc = format.normalizeTimelineDoc;
exports.parseTimelineDoc = format.parseTimelineDoc;
exports.resolveRandom = format.resolveRandom;
exports.serializeTimelineDoc = format.serializeTimelineDoc;
exports.timelineDocDuration = format.timelineDocDuration;
exports.timelineDocFromAnimation = format.timelineDocFromAnimation;
exports.timelineDocToAnimation = format.timelineDocToAnimation;
exports.validateTimelineDoc = format.validateTimelineDoc;
exports.addKeyframe = history.addKeyframe;
exports.addLayer = history.addLayer;
exports.bindHistoryKeys = history.bindHistoryKeys;
exports.copyKeyframes = history.copyKeyframes;
exports.createTimelineHistory = history.createTimelineHistory;
exports.editableKeyframes = history.editableKeyframes;
exports.groupLayers = history.groupLayers;
exports.historyKeyAction = history.historyKeyAction;
exports.layerSubtree = history.layerSubtree;
exports.moveLayer = history.moveLayer;
exports.pasteKeyframes = history.pasteKeyframes;
exports.removeKeyframes = history.removeKeyframes;
exports.removeLayers = history.removeLayers;
exports.scaleKeyframes = history.scaleKeyframes;
exports.setKeyframeEasing = history.setKeyframeEasing;
exports.setKeyframeProps = history.setKeyframeProps;
exports.shiftKeyframes = history.shiftKeyframes;
exports.ungroupLayer = history.ungroupLayer;
exports.uniqueId = history.uniqueId;
exports.updateLayers = history.updateLayers;
exports.createFixedClock = preview.createFixedClock;
exports.createTimelinePreview = preview.createTimelinePreview;
exports.interpolateValue = preview.interpolateValue;
exports.sampleTimelineDoc = preview.sampleTimelineDoc;
exports.loadMotionDoc = scene.loadMotionDoc;
exports.timelineDocFromScene = scene.timelineDocFromScene;
exports.timelineDocToScene = scene.timelineDocToScene;
exports.TIMELINE_DOC_SCHEMA = TIMELINE_DOC_SCHEMA;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v16.0.0/dist/components/timeline-editor.cjs.map