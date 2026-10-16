import { createApp } from 'vue';
import ScrollAnimate from 'motionary';
import { defineSwitch } from 'motionary/components/widgets';
import App from './App.vue';

defineSwitch();
createApp(App).mount('#app');
ScrollAnimate.watch(); // picks up [data-sa] elements Vue renders, now and later
