<!-- Svelte 5: `checked={…}` sets the property on a custom element; the `usa` action listens to usa:change (a plain
     `onusa:change` attribute works too but Svelte 5 warns attribute_illegal_colon). -->
<script lang="ts">
  import { usa } from 'motionary/components/svelte';
  const fx = (): any => (globalThis as any).__fx;
  let checked = $state(false);
  let show = $state(true);
  if (typeof window !== 'undefined' && fx()) Object.assign(fx(), { setChecked: (v: boolean) => (checked = v), show: (v: boolean) => (show = v) });
  function onChange(e: CustomEvent<{ checked: boolean }>) {
    fx().log.push('change:' + e.detail.checked);
    checked = e.detail.checked;
  }
</script>

<section id="fx">
  <p id="status">{checked ? 'on' : 'off'}</p>
  {#if show}
    <usa-switch id="sw" label="Wifi" {checked} use:usa={{ on: { change: onChange } }}></usa-switch>
  {/if}
</section>
