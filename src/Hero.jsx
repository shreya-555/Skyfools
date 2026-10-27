import React, {useEffect, useRef, useState} from 'react';
import {useReducedMotion} from 'motion/react';
import {ArrowDown} from 'lucide-react';
import walkthrough from './walkthrough.json';
import {createFrameLoader} from './frameLoader';

const LAST_FRAME = walkthrough.count;
const WALKTHROUGH_END = .9;
const frameUrl = n => `${walkthrough.path}/frame-${String(n).padStart(3, '0')}.${walkthrough.extension}?v=${walkthrough.version}`;

export default function Hero({onComplete}) {
  const root = useRef(null), canvas = useRef(null), progress = useRef(null);
  const [complete, setComplete] = useState(false);
  const [status, setStatus] = useState('Preparing the walkthrough…');
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = root.current, element = canvas.current;
    const ctx = element.getContext('2d', {alpha: false});
    if (!ctx) { setStatus('Use Menu to continue.'); return; }
    const compactQuery = matchMedia('(max-width: 700px)');
    let alive = true, raf = 0, touchRaf = 0, touching = false, coastUntil = 0, previousScroll = -1;
    let target = reduced ? LAST_FRAME : 1, direction = 1, lastRender = '', finished = false, active = true;
    const schedule = () => { if (alive && !raf) raf = requestAnimationFrame(update); };
    const loader = createFrameLoader({
      urlForFrame: frameUrl, lastFrame: LAST_FRAME,
      getSettings: () => ({
        concurrency: !active || document.hidden ? 0 : compactQuery.matches ? 3 : 4,
        cacheLimit: compactQuery.matches ? 6 : 12,
        offsets: reduced ? [0] : compactQuery.matches ? [0, 2, 5, -2] : [0, 1, 2, 4, 6, -1, -2]
      }),
      onChange: () => { if (alive) { setStatus(''); schedule(); } },
      onError: () => { if (alive && !loader.stats().cached) setStatus('Walkthrough could not load. You can continue to the menu.'); }
    });
    const update = () => {
      raf = 0;
      if (!alive) return;
      const rect = section.getBoundingClientRect(), heroHeight = element.clientHeight;
      active = rect.bottom > 0 && rect.top < window.innerHeight;
      // Stable svh geometry prevents browser toolbar changes from moving the target.
      const position = Math.max(0, Math.min(1, -rect.top / Math.max(1, section.offsetHeight - heroHeight)));
      const amount = Math.min(1, position / WALKTHROUGH_END);
      const next = reduced ? LAST_FRAME : Math.round(amount * (LAST_FRAME - 1)) + 1;
      if (next !== target) { direction = next > target ? 1 : -1; target = next; }
      progress.current.style.transform = `scaleX(${reduced ? 1 : amount})`;
      element.dataset.targetFrame = String(target);
      if (!active || document.hidden) return;
      loader.request(target, direction);
      const frame = loader.nearest();
      if (!frame) return;
      const {number, image: source} = frame;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(element.clientWidth * ratio), height = Math.round(heroHeight * ratio);
      const key = `${number}:${width}x${height}`;
      if (key !== lastRender) {
        // Keep the last painted frame visible while the requested HD frame loads.
        if (element.width !== width || element.height !== height) { element.width = width; element.height = height; }
        const sw = source.naturalWidth || source.width, sh = source.naturalHeight || source.height;
        const scale = (compactQuery.matches ? Math.max : Math.min)(width / sw, height / sh);
        const dw = sw * scale, dh = sh * scale;
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
        ctx.fillStyle = '#27271f'; ctx.fillRect(0, 0, width, height);
        ctx.drawImage(source, (width - dw) / 2, (height - dh) / 2, dw, dh);
        lastRender = key;
        element.dataset.frame = String(number); element.dataset.sourceSize = `${sw}x${sh}`;
        element.style.opacity = '1';
      }
      element.dataset.cachedFrames = String(loader.stats().cached);
      element.dataset.pendingFrames = String(loader.stats().pending);
      const done = target === LAST_FRAME && number === LAST_FRAME;
      if (done !== finished) { finished = done; setComplete(done); onComplete(done); }
    };
    setComplete(false); onComplete(false); setStatus('Preparing the walkthrough…');
    const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
    resize?.observe(element);
    // iOS can defer ordinary scroll notifications during touch/momentum scrolling.
    // Track the scroll geometry every animation frame until the swipe settles.
    const trackTouch = now => {
      touchRaf = 0;
      if (!alive || document.hidden) return;
      if (window.scrollY !== previousScroll) {
        previousScroll = window.scrollY;
        coastUntil = Math.max(coastUntil, now + 180);
      }
      schedule();
      if (touching || now < coastUntil) touchRaf = requestAnimationFrame(trackTouch);
    };
    const startTracking = () => { if (!touchRaf) touchRaf = requestAnimationFrame(trackTouch); };
    const startTouch = () => { touching = true; startTracking(); };
    const endTouch = () => { touching = false; coastUntil = performance.now() + 600; startTracking(); };
    section.addEventListener('touchstart', startTouch, {passive: true});
    window.addEventListener('touchmove', schedule, {passive: true});
    window.addEventListener('touchend', endTouch, {passive: true});
    window.addEventListener('touchcancel', endTouch, {passive: true});
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule, {passive: true});
    window.visualViewport?.addEventListener('scroll', schedule, {passive: true});
    window.visualViewport?.addEventListener('resize', schedule, {passive: true});
    if (compactQuery.addEventListener) compactQuery.addEventListener('change', schedule);
    else compactQuery.addListener(schedule);
    const resume = () => { if (!document.hidden) { loader.retry(); schedule(); } };
    document.addEventListener('visibilitychange', resume);
    window.addEventListener('pageshow', resume); window.addEventListener('online', resume);
    schedule();
    return () => {
      alive = false; cancelAnimationFrame(raf); cancelAnimationFrame(touchRaf); resize?.disconnect(); loader.dispose();
      section.removeEventListener('touchstart', startTouch);
      window.removeEventListener('touchmove', schedule); window.removeEventListener('touchend', endTouch);
      window.removeEventListener('touchcancel', endTouch);
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
      window.visualViewport?.removeEventListener('scroll', schedule);
      window.visualViewport?.removeEventListener('resize', schedule);
      if (compactQuery.removeEventListener) compactQuery.removeEventListener('change', schedule);
      else compactQuery.removeListener(schedule);
      document.removeEventListener('visibilitychange', resume);
      window.removeEventListener('pageshow', resume); window.removeEventListener('online', resume);
    };
  }, [reduced, onComplete]);

  return <section id="home" className="hero-track" ref={root}>
    <div className={`hero ${complete ? 'journey-complete' : 'journey-active'}`}>
      <img className="hero-poster" src={frameUrl(reduced ? LAST_FRAME : 1)} alt="" fetchPriority="high"/>
      <canvas ref={canvas} aria-label={`Scroll-controlled café walkthrough using ${LAST_FRAME} original Full HD frames`}/>
      <div className="hero-shade"/>
      <div className="hero-copy" aria-hidden={!complete} inert={!complete}>
        <span className="eyebrow">BANDRA WEST · MUMBAI</span>
        <h1>The <em>Skyfools.</em></h1>
        <p>Good coffee. Curious plates. Stay a little longer.</p>
      </div>
      <div className="hero-bottom"><span>{complete ? 'YOU’VE ARRIVED' : 'COME ON IN'}</span>
        <div className="scroll-cue"><span>{complete ? 'SCROLL TO THE MENU' : 'SCROLL TO STEP INSIDE'}</span><ArrowDown size={19}/></div>
        <span className="hero-index">{complete ? 'MAKE YOURSELF AT HOME' : 'A WALK THROUGH SKYFOOLS'}</span>
      </div>
      {status && <div className="loading" role="status">{status}</div>}
      <div className="hero-progress" ref={progress}/>
    </div>
  </section>;
}
