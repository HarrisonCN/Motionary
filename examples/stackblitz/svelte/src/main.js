import { mount } from 'svelte';
import ScrollAnimate from 'motionary';
import { defineSwitch } from 'motionary/components/widgets';
import App from './App.svelte';

defineSwitch();
mount(App, { target: document.getElementById('app') });
ScrollAnimate.watch();
