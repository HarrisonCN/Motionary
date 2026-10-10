// Entrance animations from motionary presets (classes from ../../motionary.wxss).
const app = getApp();
Page({
  data: {
    shown: false,
    reduceMotion: app.globalData.reduceMotion,
    cards: [
      { title: 'Fade in up', preset: 'usa-fade-in-up' },
      { title: 'Zoom in', preset: 'usa-zoom-in' },
      { title: 'Slide up', preset: 'usa-slide-up' },
    ],
  },
  onReady() { this.setData({ shown: true }); },
  replay() { this.setData({ shown: false }, () => setTimeout(() => this.setData({ shown: true }), 30)); },
  toggleReduce(e) { app.globalData.reduceMotion = e.detail.value; this.setData({ reduceMotion: e.detail.value }); },
});
