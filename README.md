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
The active hero uses the 300 original 1920×1080 JPGs from `soham_cafe_video_frames.zip`, stored byte-for-byte in `public/walkthrough-hd`. `src/walkthrough.json` records the active sequence. Run `python scripts/import-video.py path/to/frames.zip` to import the archive, or pass a video path to extract native-resolution WebP frames with FFmpeg. The older `public/frames` sequence remains the source for the existing gallery.

The track is 500svh on desktop and 400svh on mobile, including the sticky viewport. The animation reaches its last frame after 3.6 desktop or 2.7 mobile screen lengths, with a short final hold. Actual wheel ticks and swipes vary by device. Native scrolling drives a single animation-frame update; stable viewport units prevent mobile toolbar resizing from shifting progress. Every displayed animation frame uses the HD source, with a center crop on portrait screens. Decoded caches are bounded to 12 frames on desktop and 6 on mobile, with 4/3 concurrent requests and native Image loading on all browsers. In-flight images finish during fast swipes instead of being cancelled, preventing mobile network request starvation. Touch and momentum scrolling are tracked with animation-frame updates on iOS. Reduced motion displays the closing frame without a scroll journey.


Mobile loading regression checks: `node --test tests/frameLoader.test.js`. For browser testing with 650 ms latency per HD image, build first and run `node tests/slow-preview.mjs` (localhost:5174).
