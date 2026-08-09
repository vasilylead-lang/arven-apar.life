# ARVEN — a private alpine reserve

A single-page immersive site for a fictional 4,000-hectare estate above Val d'Hérens
in the Valais. Built as an analogue of [explore.ownprimland.com](https://explore.ownprimland.com/):
a designed page load, one WebGL idea carrying the first screen, an interactive
model of the holding, an atmosphere toggle in place of Primland's seasons switch,
a living bird layer, the settlement, and the sister-reserve collection.

**ARVEN is not a real estate.** The natural history on the page is accurate — the
nutcracker's role in seeding arolla forest, the bearded vulture's reintroduction,
the alpine chough's nesting altitude. The property, the prices and the collection
are invented. The footer says so.

## Stack

Vue 3.5 + Vite 8 (Rolldown), Three.js, GSAP + ScrollTrigger + SplitText, Lenis.
No CSS framework, no CMS, no backend.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview
```

Requires Node `^20.19.0 || >=22.12.0` (Vite 8).

## How it works

**The model is generated, not downloaded.** `src/three/terrain.js` grows the
terrain from seeded ridged-multifractal noise (`src/three/noise.js`) into a closed
slab with visible cut faces, so the reserve reads as a physical scale model. Rock,
arolla forest, snow and the survey contour lines are all computed in the fragment
shader from world height and slope, which means the snowline can animate. Lac Noir
is carved by sampling the rim first, guaranteeing the water plane sits below its
surroundings.

**Atmospheres drive everything.** `src/data/atmospheres.js` is the single source
for the four conditions. Each one supplies sun bearing and colour, ambient, fog,
sky gradient, snowline, palette and bird behaviour — the toggle UI and the entire
scene read from the same object, so they cannot disagree.

**Scroll is the narrative.** Seven camera poses in `src/three/scene.js` line up
1:1 with `SECTION_ORDER` in `App.vue`; a ScrollTrigger per section scrubs between
neighbouring poses. Map pins are real DOM projected from 3D each frame, with a
cheap ray-march against the height field so they hide behind ridges.

**Sound is synthesised.** `src/composables/useWind.js` builds brown noise through
a swept bandpass — no audio file, and the gust rate follows the selected
atmosphere.

## Accessibility

The reference set averages 6.80 on accessibility. The deliberate divergences:

- `prefers-reduced-motion` is honoured in CSS *and* JS — Lenis is never
  constructed, the preloader skips straight to the choice, the hero SplitText
  reveal is skipped, birds freeze, shadows are off, and the camera snaps between
  poses on section entry rather than tracking scroll.
- The canvas is `aria-hidden`; everything it shows also exists in the DOM behind
  it. Map pins are `tabindex="-1"` because the reserve list is the real control.
- The preloader never traps: the counter is capped and a 3.6 s hard stop shows the
  entry choice regardless.
- Text colours are held against the darkest scrim the model can sit behind, so the
  Whiteout atmosphere does not wash the copy out.
- One `<h1>`, no heading-level skips, skip link, visible `:focus-visible`, and the
  mobile menu is a real dialog with Escape, focus move and focus return.

## Regenerating brand assets

```bash
python3 brand/build_logo.py                 # mark -> SVG + 512px master + lockup proof
python3 ~/.claude/skills/web-builder/scripts/build_favicons.py \
  brand/logo-master-512.png --out ./public/favicons --project-root ./public \
  --bg "#0A0D0F" --padding 0.12 --version 1
cp brand/favicon.svg public/favicons/favicon.svg
python3 brand/build_og.py                   # 1200x630 card
```

Bump `--version` and the `?v=N` in `index.html` whenever an icon changes.

Images in `public/images/` are pre-cropped ladders (AVIF/WebP/JPEG) produced from
`brand/src-images/` with the skill's `import_image.py`; every one fills its box and
crops the excess. See `ResponsiveImage.vue`.

## Changing the domain

`arven-apar.life` appears in `index.html` (canonical, OG, Twitter, JSON-LD),
`public/robots.txt`, `public/sitemap.xml` and `SITE.origin` in `src/data/site.js`.
