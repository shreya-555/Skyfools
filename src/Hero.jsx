import React, {useEffect, useRef, useState} from 'react';
import {useReducedMotion} from 'motion/react';
import {ArrowDown} from 'lucide-react';
import walkthrough from './walkthrough.json';

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
    const cache = new Map(), pending = new Map(), failed = new Set();
    let alive = true, raf = 0, target = reduced ? LAST_FRAME : 1;
    let direction = 1, displayed = 0, lastRender = '', finished = false, active = true;
    const release = image => image.close?.();
    const nearby = () => {
      if (reduced) return [LAST_FRAME];
      const offsets = compactQuery.matches ? [0, 1, 3, -1] : [0, 1, 2, 4, 6, -1, -2];
      return offsets.map(offset => target + direction * offset).filter(n => n >= 1 && n <= LAST_FRAME);
    };
    const trim = () => {
      const wanted = new Set(nearby());
      const candidates = [...cache.keys()].filter(n => n !== target && n !== displayed)
        .sort((a, b) => Number(wanted.has(a)) - Number(wanted.has(b)) || Math.abs(b - target) - Math.abs(a - target));
      while (cache.size > (compactQuery.matches ? 6 : 12) && candidates.length) {
        const n = candidates.shift(); release(cache.get(n)); cache.delete(n);
      }
    };
    const schedule = () => { if (alive && !raf) raf = requestAnimationFrame(update); };
    const load = async number => {
      const controller = new AbortController();
      pending.set(number, controller);
      let image;
      try {
        const response = await fetch(frameUrl(number), {signal: controller.signal, priority: number === target ? 'high' : 'low'});
        if (!response.ok) throw new Error(`Frame ${number}: ${response.status}`);
        const blob = await response.blob();
        // Older Safari builds use the Image decoder when ImageBitmap is unavailable.
        if (typeof createImageBitmap === 'function') {
          try { image = await createImageBitmap(blob); } catch { /* Fall back below. */ }
        }
        if (!image) {
          const url = URL.createObjectURL(blob);
          try {
            image = new Image(); image.decoding = 'async';
            await new Promise((resolve, reject) => {
              image.onload = resolve; image.onerror = reject; image.src = url;
            });
          } finally { URL.revokeObjectURL(url); }
        }
        if (!alive || controller.signal.aborted) { release(image); return; }
        cache.set(number, image); trim(); setStatus('');
      } catch (error) {
        if (alive && error.name !== 'AbortError') {
          failed.add(number);
          if (!cache.size) setStatus('Walkthrough could not load. You can continue to the menu.');
        }
      } finally {
        pending.delete(number);
        if (alive) schedule();
      }
    };
    const queue = () => {
      if (!active || document.hidden) return;
      // Small scroll changes retain useful in-flight decodes; distant work is cancelled.
      for (const [n, controller] of pending) if (Math.abs(n - target) > 18) controller.abort();
      for (const number of nearby()) {
        if (pending.size >= (compactQuery.matches ? 2 : 3)) break;
        if (!cache.has(number) && !pending.has(number) && !failed.has(number)) void load(number);
      }
    };
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
      queue();
      let number = cache.has(target) ? target : 0;
      if (!number) for (const n of cache.keys()) {
        if (!number || Math.abs(n - target) < Math.abs(number - target)) number = n;
      }
      const source = cache.get(number);
      if (!source) return;
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
        displayed = number; lastRender = key;
        element.dataset.frame = String(number); element.dataset.sourceSize = `${sw}x${sh}`;
        element.style.opacity = '1'; trim();
      }
      element.dataset.cachedFrames = String(cache.size);
      const done = target === LAST_FRAME && number === LAST_FRAME;
      if (done !== finished) { finished = done; setComplete(done); onComplete(done); }
    };
    setComplete(false); onComplete(false); setStatus('Preparing the walkthrough…');
    const resize = new ResizeObserver(schedule); resize.observe(element);
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule, {passive: true});
    compactQuery.addEventListener('change', schedule);
    const resume = () => { if (!document.hidden) { failed.clear(); schedule(); } };
    document.addEventListener('visibilitychange', resume);
    window.addEventListener('pageshow', resume); window.addEventListener('online', resume);
    schedule();
    return () => {
      alive = false; cancelAnimationFrame(raf); resize.disconnect();
      pending.forEach(controller => controller.abort()); cache.forEach(release);
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
      compactQuery.removeEventListener('change', schedule);
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
