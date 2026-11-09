import { describe, expect, it } from 'vitest';
import { getBase } from '../src/components/base';
import { defineWeatherCard } from '../src/components/widgets/weather-card';
import { defineVideoCard } from '../src/components/widgets/video-card';
import { defineBackToTop } from '../src/components/page/back-to-top';
import { defineProductGallery } from '../src/components/widgets/product-gallery';
import { installComponentMocks } from './components-setup';

describe('component inputs', () => {
  it('preserves literal text and quoted attributes through DOM updates', () => {
    installComponentMocks({ reducedMotion: true });
    defineWeatherCard(); defineVideoCard(); defineBackToTop(); defineProductGallery();
    document.body.innerHTML = '<usa-weather-card temp="20"></usa-weather-card><usa-video-card></usa-video-card><usa-back-to-top></usa-back-to-top>';
    const [weather, video, top] = Array.from(document.body.children);
    const literal = '<b>"summer"</b>';
    weather.setAttribute('unit', literal);
    video.setAttribute('duration', literal);
    top.setAttribute('label', literal);
    expect(weather.querySelector('.usa-wc-temp')?.textContent).toBe('20' + literal);
    expect(video.querySelector('.usa-vc-time')?.textContent).toBe(literal);
    expect(top.querySelector('button')?.getAttribute('aria-label')).toBe(literal);
    const gallery = document.createElement('usa-product-gallery');
    const image = document.createElement('img');
    const src = '/photos/"summer".jpg';
    image.setAttribute('src', src);
    gallery.append(image);
    document.body.append(gallery);
    expect(gallery.querySelector('.usa-pg2-thumb img')?.getAttribute('src')).toBe(src);
  });

  it('replays properties assigned before definition and mounts once per connection', () => {
    const el = document.createElement('test-replay-mount') as HTMLElement & { value: number };
    el.value = 42;
    document.body.append(el);
    const seen: number[] = [];
    customElements.define(el.localName, class extends getBase() {
      private stored = 0;
      set value(v: number) { this.stored = v; this.changed('value'); }
      mount() { seen.push(this.stored); }
    });
    expect(seen).toEqual([42]);
    el.remove();
    document.body.append(el);
    expect(seen).toEqual([42, 42]);
  });
});
