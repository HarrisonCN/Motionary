import ScrollAnimate from 'motionary';
import 'motionary/components'; // defines the core <usa-*> elements (incl. <usa-reveal>)
import { defineSwitch } from 'motionary/components/widgets';

ScrollAnimate.init(); // reduced motion is respected automatically
defineSwitch();
document.querySelector('usa-switch').addEventListener('usa:change', (e) => {
  document.getElementById('state').textContent = e.detail.checked ? 'on' : 'off';
});
