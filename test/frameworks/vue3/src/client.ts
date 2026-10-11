import { createSSRApp } from 'vue';
import { isUsaElement } from 'motionary/components/vue';
import { defineSwitch } from 'motionary/components/widgets';
import { App } from './App';
import { capture } from '../../shared/capture';

const fx = capture('vue3');
const app = createSSRApp(App);
app.config.compilerOptions.isCustomElement = isUsaElement;
app.config.warnHandler = (msg) => fx.warnings.push('vue: ' + msg);
app.mount('#app'); // hydrates the server markup
requestAnimationFrame(() => { defineSwitch(); fx.ready = true; });
