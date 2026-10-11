import { render as ssr } from 'svelte/server';
import App from './App.svelte';
export const render = () => ssr(App).body;
