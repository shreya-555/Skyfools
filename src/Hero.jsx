import React, {useEffect, useRef, useState} from 'react';
import {useReducedMotion} from 'motion/react';
import {ArrowDown, ArrowUpRight} from 'lucide-react';

const LAST_FRAME = 240;
const FRAMES_PER_SHEET = 12;
const SHEET_COUNT = LAST_FRAME / FRAMES_PER_SHEET;
const WALKTHROUGH_END = .82;
const sheetUrl = (index, compact) => `/${compact ? 'sprite-mobile' : 'sprite'}/sheet-${String(index + 1).padStart(2, '0')}.webp`;
const frameUrl = (number, compact) => `/${compact ? 'sequence-mobile' : 'sequence'}/frame-${String(number).padStart(3, '0')}.webp`;

export default function Hero({onComplete}) {
  const root = useRef(null), canvas = useRef(null), progress = useRef(null);
  const [complete, setComplete] = useState(false);
  const [status, setStatus] = useState('Preparing the walkthrough…');
  const [compact, setCompact] = useState(() => matchMedia('(max-width: 699px)').matches);
  const reduced = useReducedMotion();

  useEffect(() => {
    const query = matchMedia('(max-width: 699px)');
    const update = () => setCompact(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const sheets = new Map(), detail = new Map();
    const sheetPending = new Set(), sheetFailed = new Set(), detailPending = new Set(), detailFailed = new Set();
    const tileWidth = compact ? 320 : 480, tileHeight = compact ? 180 : 270;
    const ctx = canvas.current.getContext('2d', {alpha: false, desynchronized: true});
    let alive = true, raf = 0, idleTimer = 0, target = reduced ? LAST_FRAME : 1;
    let sheetInFlight = 0, detailInFlight = 0, scrolling = false;
    let lastRender = '', finished = false;

    setStatus('Preparing the walkthrough…');
    const schedule = () => { if (alive && !raf) raf = requestAnimationFrame(draw); };
    const loadSheet = index => {
      if (index < 0 || index >= SHEET_COUNT || sheets.has(index) || sheetPending.has(index) || sheetFailed.has(index) || sheetInFlight >= 3) return;
      sheetPending.add(index); sheetInFlight++;
      const image = new Image();
      image.decoding = 'async';
      image.onload = async () => {
        try {
          const bitmap = await createImageBitmap(image);
          if (!alive) { bitmap.close(); return; }
          sheets.set(index, bitmap);
          if (index === 0 || index === Math.floor((target - 1) / FRAMES_PER_SHEET)) setStatus('');
        } catch { sheetFailed.add(index); }
        finally { sheetPending.delete(index); sheetInFlight--; schedule(); queueSheets(); }
      };
      image.onerror = () => {
        sheetFailed.add(index); sheetPending.delete(index); sheetInFlight--;
        if (index === 0) setStatus('Walkthrough unavailable. Use Menu to continue.');
        queueSheets();
      };
      image.src = sheetUrl(index, compact);
    };
    const queueSheets = () => {
      if (!alive || reduced || document.hidden) return;
      const focus = Math.floor((target - 1) / FRAMES_PER_SHEET);
      for (let distance = 0; distance < SHEET_COUNT && sheetInFlight < 3; distance++) {
        loadSheet(focus + distance);
        if (distance) loadSheet(focus - distance);
      }
    };
    const loadDetail = number => {
      if (detail.has(number) || detailPending.has(number) || detailFailed.has(number) || detailInFlight >= 2) return;
      detailPending.add(number); detailInFlight++;
      const image = new Image();
      image.decoding = 'async';
      image.onload = async () => {
        try {
          const bitmap = await createImageBitmap(image);
          if (!alive) { bitmap.close(); return; }
          detail.set(number, bitmap);
          while (detail.size > 4) {
            const stale = detail.keys().next().value;
            detail.get(stale).close(); detail.delete(stale);
          }
          if (reduced) setStatus('');
          schedule();
        } catch {
          detailFailed.add(number);
          if (reduced) setStatus('Walkthrough unavailable. Use Menu to continue.');
        } finally {
          detailPending.delete(number); detailInFlight--;
          if (alive && !scrolling && !detail.has(target)) loadDetail(target);
        }
      };
      image.onerror = () => {
        detailFailed.add(number);
        detailPending.delete(number); detailInFlight--;
        if (reduced) setStatus('Walkthrough unavailable. Use Menu to continue.');
      };
      image.src = frameUrl(number, compact);
    };
    const readProgress = () => {
      const section = root.current;
      if (!section) return;
      const distance = Math.max(1, section.offsetHeight - innerHeight);
      const position = Math.max(0, Math.min(1, -section.getBoundingClientRect().top / distance));
      target = reduced ? LAST_FRAME : Math.round(Math.min(1, position / WALKTHROUGH_END) * (LAST_FRAME - 1)) + 1;
      progress.current.style.transform = `scaleX(${Math.min(1, position / WALKTHROUGH_END)})`;
      if (reduced) loadDetail(LAST_FRAME);
      else {
        scrolling = true;
        queueSheets();
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => { scrolling = false; loadDetail(target); schedule(); }, 150);
      }
      schedule();
    };
    const draw = () => {
      raf = 0;
      const element = canvas.current;
      const width = Math.round(element.clientWidth), height = Math.round(element.clientHeight);
      if (element.width !== width || element.height !== height) {
        element.width = width; element.height = height; lastRender = '';
      }
      const sheetIndex = Math.floor((target - 1) / FRAMES_PER_SHEET);
      const sheet = sheets.get(sheetIndex), sharp = detail.get(target);
      const useSharp = sharp && (!scrolling || !sheet);
      const ready = Boolean(useSharp || sheet);
      const done = target === LAST_FRAME && ready;
      if (done !== finished) { finished = done; setComplete(done); onComplete(done); }
      if (!ready) return;
      const key = `${target}:${useSharp ? 'sharp' : 'sheet'}:${width}x${height}`;
      if (key === lastRender) return;
      const sourceWidth = useSharp ? sharp.width : tileWidth;
      const sourceHeight = useSharp ? sharp.height : tileHeight;
      const scale = Math.min(width / sourceWidth, height / sourceHeight);
      const drawWidth = sourceWidth * scale, drawHeight = sourceHeight * scale;
      const x = (width - drawWidth) / 2, y = (height - drawHeight) / 2;
      ctx.fillStyle = '#27271f'; ctx.fillRect(0, 0, width, height);
      if (useSharp) ctx.drawImage(sharp, x, y, drawWidth, drawHeight);
      else {
        const offset = (target - 1) % FRAMES_PER_SHEET;
        ctx.drawImage(sheet, (offset % 4) * tileWidth, Math.floor(offset / 4) * tileHeight,
          tileWidth, tileHeight, x, y, drawWidth, drawHeight);
      }
      lastRender = key;
    };

    window.addEventListener('scroll', readProgress, {passive: true});
    window.addEventListener('resize', readProgress, {passive: true});
    document.addEventListener('visibilitychange', queueSheets);
    queueSheets();
    readProgress();
    return () => {
      alive = false;
      window.removeEventListener('scroll', readProgress);
      window.removeEventListener('resize', readProgress);
      document.removeEventListener('visibilitychange', queueSheets);
      clearTimeout(idleTimer); cancelAnimationFrame(raf);
      sheets.forEach(bitmap => bitmap.close());
      detail.forEach(bitmap => bitmap.close());
    };
  }, [compact, reduced, onComplete]);

  return <section id="home" className="hero-track" ref={root}>
    <div className={`hero ${complete ? 'journey-complete' : 'journey-active'}`}>
      <canvas ref={canvas} aria-label="Scroll-controlled café walkthrough using the 240 original supplied frames"/>
      <div className="hero-shade"/>
      <div className="hero-copy" aria-hidden={!complete} inert={!complete}>
        <span className="eyebrow">BANDRA WEST · MUMBAI</span>
        <h1>The <em>Skyfools.</em></h1>
        <p>Good coffee. Curious plates. Stay a little longer.</p>
        <a className="hero-link" href="#menu">Find your favourite <ArrowUpRight size={19}/></a>
      </div>
      <div className="hero-bottom"><span>{complete ? 'YOU’VE ARRIVED' : 'TAKE YOUR TIME'}</span>
        <div className="scroll-cue"><span>{complete ? 'SCROLL TO THE MENU' : 'SCROLL TO STEP INSIDE'}</span><ArrowDown size={19}/></div>
        <span className="hero-index">{complete ? 'MAKE YOURSELF AT HOME' : 'A SLOW WALK THROUGH'}</span>
      </div>
      {status && <div className="loading" role="status">{status}</div>}
      <div className="hero-progress" ref={progress}/>
    </div>
  </section>;
}
