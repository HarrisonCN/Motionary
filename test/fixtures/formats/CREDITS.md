# Format fixtures

All files in this folder were written for Motionary's tests and are MIT-licensed with the repository: `sample-keyframes.css`, `sample-motion.json` (10.1), `sample-smil.svg` (10.2), `texturepacker-hash.json`, `texturepacker-array.json`, `aseprite.json` (10.3, hand-written in the TexturePacker / Aseprite export formats; no third-party art). Third-party samples added later are listed here with their licence and source.

## 10.4 animated images (made for Motionary, MIT)

- `sample-anim.gif`, `sample-anim.png` (APNG), `sample-anim.webp` (lossless), `sample-anim-lossy.webp` — four coloured rectangles drawn with Pillow (`ImageDraw`), saved with Pillow 12 (`save_all=True`, per-frame durations, GIF disposal 2 + transparency, APNG sub-frames, WebP ANMF frames).
- `sample-interlaced.gif` — the same frames re-encoded by ImageMagick 6 (`convert sample-anim.gif -coalesce -interlace GIF -loop 3`).
- `sample-plasma.gif` — 96×64 ImageMagick `plasma:fractal` + `gradient:red-blue`, 256 colours (exercises 12-bit LZW codes).
- `sample-alpha-lossy.webp` — three semi-transparent shapes (ImageMagick `-draw`), lossy WebP with `ALPH` chunks via ImageMagick's libwebp encoder.
- `animated-images.expected.json` — reference results computed with Pillow from the same files (SHA-256 of each composited frame; decoded sub-frames for the decoder stub used in Node, which has no PNG / WebP decoder).
