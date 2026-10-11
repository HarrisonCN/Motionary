import { hydrate } from 'solid-js/web';
import { defineSwitch } from 'motionary/components/widgets';
import { App } from './App';
import { capture } from '../../shared/capture';

const fx = capture('solid');
hydrate(() => <App />, document.getElementById('app'));
requestAnimationFrame(() => { defineSwitch(); fx.ready = true; });
