// stdout carries the rendered JSON (build.mjs) — Angular's dev-mode banner goes to stderr instead
console.log = (...a: unknown[]) => console.error(...a);
import '@angular/compiler'; // JIT: the fixture compiles templates at runtime (no Angular CLI in the matrix)
import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration, type BootstrapContext } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { App } from './App';

export async function render() {
  const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(App, { providers: [provideZonelessChangeDetection(), provideClientHydration(), provideServerRendering()] }, context);
  const doc = await renderApplication(bootstrap, { document: '<!doctype html><html><head></head><body><app-root></app-root></body></html>', url: '/' });
  const root = doc.match(/<app-root[\s\S]*<\/app-root>/)?.[0] ?? '';
  const state = doc.match(/<script id="ng-state"[\s\S]*?<\/script>/)?.[0] ?? '';
  const styles = (doc.match(/<head>([\s\S]*)<\/head>/)?.[1] ?? '').replace(/<title>[\s\S]*?<\/title>/, '');
  // hydration integrity marker: Angular looks for <!--nghm--> in <body>'s children or at the end of <head>; the fixture
  // page wraps the app in <div id="app">, so the marker moves to the end of <head>
  const marker = doc.includes('<!--nghm-->') ? '<!--nghm-->' : '';
  return { html: root + state, head: styles.replace('<!--nghm-->', '') + marker };
}
