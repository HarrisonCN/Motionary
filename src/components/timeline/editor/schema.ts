/**
 * 13.6: JSON Schema (draft 2020-12) of `motionary-timeline` v1, for editors and
 * other tools. `validateTimelineDoc` is the authority: it also checks what a
 * schema cannot (unique ids across layers, parents that are groups, no group
 * cycles, valid easings, total keyframe limit).
 */
const id = { type: 'string', minLength: 1, maxLength: 128 };
const value = { oneOf: [{ type: 'number' }, { type: 'string', maxLength: 2048 }] };

export const TIMELINE_DOC_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://cdn.jsdelivr.net/npm/motionary@13/docs/timeline-doc.schema.json',
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
} as const;
