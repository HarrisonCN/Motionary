import { hydrate } from 'svelte';
import { defineSwitch } from 'motionary/components/widgets';
import App from './App.svelte';
import { capture } from '../../shared/capture';

const fx = capture('svelte5');
hydrate(App, { target: document.getElementById('app')! });
requestAnimationFrame(() => { defineSwitch(); fx.ready = true; });
