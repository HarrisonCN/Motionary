<script setup>
import { ref } from 'vue';
const checked = ref(false);
</script>

<template>
  <main>
    <section class="s"><h1>Scroll down</h1></section>
    <section class="s"><h2 data-sa data-sa-animation="fade-in-up">Revealed with data-sa</h2></section>
    <section class="s">
      <usa-switch label="Wifi" :checked.prop="checked" @usa:change="checked = $event.detail.checked"></usa-switch>
      <output>{{ checked ? 'on' : 'off' }}</output>
    </section>
  </main>
</template>

<style>
.s { min-height: 70vh; display: grid; place-items: center; padding: 2rem; }
</style>
