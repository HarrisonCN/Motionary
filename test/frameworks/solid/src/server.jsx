import { renderToString, generateHydrationScript } from 'solid-js/web';
import { App } from './App';
export const render = () => ({ html: renderToString(() => <App />), head: generateHydrationScript() });
