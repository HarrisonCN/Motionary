import * as React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { defineSwitch } from 'motionary/components/widgets';
import { App } from './App';
import { capture } from '../../shared/capture';

const fx = capture('react19');
hydrateRoot(document.getElementById('app')!, <React.StrictMode><App /></React.StrictMode>, {
  onRecoverableError: (e) => fx.errors.push('recoverable: ' + String(e)),
});
// upgrade after hydrate: define once React has committed the hydrated tree (App's first effect calls fx.hydrated).
// hydrateRoot is concurrent — a bare requestAnimationFrame can fire before hydration finishes and the upgraded
// markup then mismatches (seen under load in 13.5.0), so wait for the commit instead.
let done = false;
fx.hydrated = () => { if (done) return; done = true; requestAnimationFrame(() => { defineSwitch(); fx.ready = true; }); };
