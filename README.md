# The Skyfools

Independent café concept, researched against The Lovefools in Bandra. React 19, Vite, Tailwind CSS 4 and Motion for React.

## Run

`npm install`, then `npm run dev`. Production: `npm run build`.

## Content

- Edit `src/data.js` for the 15 researched menu names, public listing prices, source links and review summaries.
- All 240 original JPEG frames from the latest supplied archive are retained unchanged in `public/frames`, numbered 001–240.
- The canvas follows scroll position directly, draws the nearest loaded frame, preloads adjacent frames, and keeps a bounded decoded-image cache. It uses contain scaling to preserve the complete 16:9 frame, including letterboxing on portrait screens.
- Reduced motion disables automatic carousel/review motion and uses a still hero.
- Native dialog provides focus trapping, Escape dismissal and restored focus; backdrop clicks also close it.
- Menu imagery now uses licensed real photography, clearly labelled illustrative and not actual Lovefools dishes. Photo metadata and licensing links live in src/photos.js. Gallery and story use clearly labelled supplied concept artwork. No unlicensed restaurant photos or official branding are reproduced.
- Prices are directory list prices researched 24 October 2026, not confirmed live dine-in quotes. Recipe/allergen details are unavailable. Opening hours conflict across sources; the visit section directs visitors to call.
- Source links and full research/asset disclosures are available in the website footer and item dialogs.

## Validation

Production build passed. Browser checks covered scroll frame movement, desktop layout, menu filtering, product modal opening, Escape dismissal, gallery lightbox and a 390px-wide responsive layout. Map and outgoing third-party destinations remain dependent on external services.

## Revised experience
The hero uses a 900svh desktop / 750svh mobile scroll journey, revealing the left-aligned name only after frame 240. The last 18% holds the final frame. Twenty lightweight sprite sheets, 3.5 MB on desktop or 1.9 MB on mobile, preload the entire camera journey as a fast fallback. The hero also preloads nearby full-quality frames: original 1920×1080 JPGs on desktop and 960×540 WebP copies on mobile. Canvas playback uses the sharp frame whenever it is ready and falls back to its sprite sheet only during a faster seek. A bounded 18-frame decoded cache protects memory. Run `python scripts/import-walkthrough.py path/to/frames.zip`, then `python scripts/optimize-frames.py --mobile`, `python scripts/build-sprites.py`, and `python scripts/build-sprites.py --mobile` to regenerate the used hero assets. Fifteen distinct sourced review summaries move in an accessible, pausable horizontal carousel. Spacing is tighter and supporting typography is larger. The footer includes location, contact, booking, navigation and asset credits.

