export { S as SCENE_V2_FORMAT, a as SCENE_V2_LIMITS, b as SCENE_V2_STATUS, c as SCENE_V2_VERSION, d as detectMotionFormat, e as diffJson, f as formatMigrationReport, i as isSceneV2, g as isTokenRef, m as migrateToSceneV2, n as normalizeSceneV2, r as resolveSceneTokens, s as sceneV2ComponentLayer, h as sceneV2FromAnimation, j as sceneV2FromTimeline, k as sceneV2ToAnimation, l as sceneV2ToTimeline, o as serializeSceneV2, t as tokenizeValue, v as validateSceneV2 } from '../chunks/v2-BN000nHo.js';

/**
 * 13.9 (DRAFT): JSON Schema (draft 2020-12) of `motionary-scene` v2, for editors
 * and other tools (also shipped as docs/scene-v2.schema.json). `validateSceneV2`
 * is the authority: it also checks what a schema cannot (unique ids, parents that
 * are groups, no group cycles, valid easings, token references that resolve).
 */
const id = { type: 'string', minLength: 1, maxLength: 128 };
const ms = { type: 'number', minimum: 0, maximum: 1e7 };
const value = { oneOf: [{ type: 'number' }, { type: 'string', maxLength: 2048 }] };
const propName = { pattern: '^(--[A-Za-z0-9_-]+|[a-zA-Z][A-Za-z0-9_-]*)$', not: { enum: ['constructor', 'prototype'] } };
const tokenName = { pattern: '^[A-Za-z0-9_-]+$' };
const SCENE_V2_SCHEMA = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://cdn.jsdelivr.net/npm/motionary@17/docs/scene-v2.schema.json',
    title: 'motionary-scene v2 (draft)',
    description: 'Draft of the 14.0 scene format: one document for timeline layers, <usa-player> tracks, component motion props and motion tokens. Values may reference tokens as "{duration.fast}".',
    type: 'object',
    additionalProperties: false,
    required: ['format', 'version', 'layers'],
    properties: {
        format: { const: 'motionary-scene' },
        version: { const: 2 },
        name: { type: 'string', maxLength: 2048 },
        duration: ms,
        loop: { type: 'boolean' },
        seed: { type: 'integer', minimum: 0, maximum: 4294967295 },
        tokens: {
            type: 'object',
            additionalProperties: false,
            properties: {
                duration: { type: 'object', propertyNames: tokenName, additionalProperties: ms },
                easing: { type: 'object', propertyNames: tokenName, additionalProperties: { type: 'string', maxLength: 200 } },
                spring: {
                    type: 'object',
                    propertyNames: tokenName,
                    additionalProperties: { type: 'object', additionalProperties: false, required: ['stiffness', 'damping', 'mass'], properties: { stiffness: { type: 'number', minimum: 0 }, damping: { type: 'number', minimum: 0 }, mass: { type: 'number', minimum: 0 } } },
                },
            },
        },
        source: { type: 'object', additionalProperties: false, required: ['format'], properties: { format: { type: 'string', maxLength: 200 }, version: { type: 'integer' } } },
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
                    start: ms,
                    duration: ms,
                    easing: { type: 'string', maxLength: 200 },
                    preset: { type: 'string', minLength: 1, maxLength: 200 },
                    effect: { type: 'string', minLength: 1, maxLength: 200 },
                    options: { type: 'object' },
                    component: {
                        type: 'object',
                        additionalProperties: false,
                        required: ['tag', 'props'],
                        properties: { tag: { type: 'string', pattern: '^[a-z][a-z0-9]*-[a-z0-9-]*$', maxLength: 128 }, props: { type: 'object', propertyNames: propName, additionalProperties: value } },
                    },
                    keyframes: {
                        type: 'array',
                        items: {
                            type: 'object',
                            additionalProperties: false,
                            required: ['id', 'time', 'props'],
                            properties: {
                                id,
                                time: ms,
                                easing: { type: 'string', maxLength: 200 },
                                composite: { enum: ['replace', 'add', 'accumulate'] },
                                props: { type: 'object', maxProperties: 64, propertyNames: propName, additionalProperties: value },
                            },
                        },
                    },
                },
                allOf: [
                    {
                        if: { properties: { type: { const: 'group' } } },
                        then: { not: { anyOf: ['target', 'start', 'duration', 'easing', 'keyframes', 'preset', 'effect', 'options', 'component'].map((k) => ({ required: [k] })) } },
                    },
                    { not: { anyOf: [{ required: ['keyframes', 'preset'] }, { required: ['keyframes', 'effect'] }, { required: ['preset', 'effect'] }] } },
                ],
            },
        },
    },
};

export { SCENE_V2_SCHEMA };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.0.0-rc.1/dist/components/scene-v2.js.map