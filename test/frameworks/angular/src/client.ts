import '@angular/compiler';
import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { defineSwitch } from 'motionary/components/widgets';
import { App } from './App';
import { capture } from '../../shared/capture';

const fx = capture('angular');
bootstrapApplication(App, { providers: [provideZonelessChangeDetection(), provideClientHydration()] })
  .then(() => requestAnimationFrame(() => { defineSwitch(); fx.ready = true; }))
  .catch((e) => fx.errors.push('bootstrap: ' + (e?.message || e)));
