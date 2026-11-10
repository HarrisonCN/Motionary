import { beforeAll, expect, it } from 'vitest';
import { scanSource } from '../scripts/gen-manifest.mjs';
import { publicTagNames } from '../src/components/public-tags.generated';
import { defineMoAliases } from '../src/components/mo';
import { defineTitleSequence } from '../src/components/widgets/title-sequence';

beforeAll(async () => {
  // Register all real components first, without any corresponding elements in the document.
  const modules = import.meta.glob('../src/components/**/*.ts');
  const source = scanSource();
  for (const name of publicTagNames.split(' ')) {
    const entry = source['usa-' + name];
    expect(entry, name).toBeDefined();
    const module = await modules['../' + entry.file]() as Record<string, () => unknown>;
    module[entry.define]();
  }
  defineMoAliases();
  defineMoAliases();
}, 120000);

it('registers every public mo-* constructor, including absent late opt-in widgets', () => {
  for (const name of publicTagNames.split(' ')) {
    expect(customElements.get('mo-' + name)?.prototype, name).toBeInstanceOf(customElements.get('usa-' + name)!);
  }
});

it('file tree moves focus back to a folder and closes it', () => {
  document.body.innerHTML = '<mo-file-tree><details open><summary>Photos</summary><a href="#one">One</a></details></mo-file-tree>';
  const folder = document.querySelector('details')!;
  const key = () => document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
  document.querySelector('a')!.focus();
  key();
  expect(document.activeElement).toBe(folder.querySelector('summary'));
  key();
  expect(folder.open).toBe(false);
});

it('download menu closes on Escape and preserves native download links', () => {
  document.body.innerHTML = '<mo-download-menu><details open><summary>Formats</summary><a download href="#file">ZIP</a></details></mo-download-menu>';
  const link = document.querySelector('a')!;
  link.focus();
  link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  expect(document.querySelector('details')!.open).toBe(false);
  expect(document.activeElement).toBe(document.querySelector('summary'));
  expect(link.download).toBe('');
});

it('opening the next intertitle closes the previous one', () => {
  defineTitleSequence();
  document.body.innerHTML = '<mo-title-sequence><details open><summary>A</summary></details><details><summary>B</summary></details></mo-title-sequence>';
  const [a,b] = document.querySelectorAll('details');
  b.open = true;
  b.dispatchEvent(new Event('toggle'));
  expect(a.open).toBe(false);
  expect(b.open).toBe(true);
});
