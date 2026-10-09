# Upgrading to 10.0

10.0.0 is released — a new architecture: a zero-dependency core under 10 KB (`motionary/core`), every effect pack delivered as a plugin, and WebGPU as the default backend for GPU effects. 9.9 warned once in the console for everything that went away, and a codemod rewrites it:

```sh
npx usa-codemod-10 src            # dry run: lists every change (and what needs a manual edit)
npx usa-codemod-10 --write src    # apply
```

## Removed in 10.0 (deprecated in 9.9)

| 9.x | 10.0 | Codemod |
|---|---|---|
| `registerEffectPacks()` (`motionary/fx2`) | `registerAllPlugins()` — or register only the plugins you use: `usePlugins(retro, cinema)` | ✅ |
`EFFECT_PACKS` (packs by key) stays; `effectPlugins()` gives the same packs as plugin objects (`[{ name: 'retro', effects }, …]`).

## New in 9.9 (before the break)

- **Plugins.** `definePlugin(name, effects, install?)`, `usePlugins(...plugins)` (registers each plugin once, returns the effect names), `effectPlugins()` (every built-in pack as a plugin) and `registerAllPlugins()` in `motionary/fx2`. `installPlugin()` from `motionary/marketplace` accepts these plugin objects too.

See the [CHANGELOG](../CHANGELOG.md) for the full list.
