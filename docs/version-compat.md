# Version compatibility (12.5)

Every component and `motionary/runtime` module in the AI manifest (`motionary/manifest.json`, on the site `/components.json`) carries
its history:

- `since` — the release it arrived in: the gallery card's value, else the first release whose notes (CHANGELOG.md) mention it.
- `changed` — every later release (major.minor) whose notes mention it.

The history comes from the release notes, so "changed" means "the notes of that release mention it" — read those notes for the details.

## For your installed version

```bash
npx motionary compat 11.6        # components added after 11.6, and the ones changed after it
npx motionary compat 11.6 --json
```

`motionary-mcp` answers for the version installed in your project (`./node_modules/motionary`, or `MOTIONARY_INSTALLED=11.6.0`):

- `list_components { version }` lists only what that version has;
- `get_component { tag, version }` adds `compat: { installed, available, since, changedAfter }`;
- `check_compat { version, tags? }` lists what is missing or changed for that version, the runtime modules involved, and the upgrade command.

The [compatibility matrix](./compat-matrix.md) lists the runtime modules and official runtimes per release line; the
[component docs](./components/) show `since` and `changed in` for each element.
