<script>
  import { usa } from 'motionary/components/svelte';
  let checked = $state(false);
</script>

<main>
  <section class="s"><h1>Scroll down</h1></section>
  <section class="s"><h2 data-sa data-sa-animation="fade-in-up">Revealed with data-sa</h2></section>
  <section class="s">
    <usa-switch label="Wifi" {checked} use:usa={{ on: { change: (e) => (checked = e.detail.checked) } }}></usa-switch>
    <output>{checked ? 'on' : 'off'}</output>
  </section>
</main>

<style>
  .s { min-height: 70vh; display: grid; place-items: center; padding: 2rem; }
</style>
