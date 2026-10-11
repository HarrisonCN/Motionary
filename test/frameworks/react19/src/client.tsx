import * as React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { defineSwitch } from 'motionary/components/widgets';
import { App } from './App';
import { capture } from '../../shared/capture';

const fx = capture('react19');
hydrateRoot(document.getElementById('app')!, <React.StrictMode><App /></React.StrictMode>, {
  onRecoverableError: (e) => fx.errors.push('recoverable: ' + String(e)),
});
// upgrade after hydrate: define once React has attached (the SSR markup stays untouched until then)
requestAnimationFrame(() => { defineSwitch(); fx.ready = true; });
