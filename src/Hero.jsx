import React, {useEffect, useRef, useState} from 'react';
import {useReducedMotion} from 'motion/react';
import {ArrowDown, ArrowUpRight} from 'lucide-react';
import {frame} from './data';

// The last 18% is a quiet hold on the final frame, for the brand reveal.
const WALKTHROUGH_END = .82;
export default function Hero({onComplete}) {
  const root = useRef(null), canvas = useRef(null), progress = useRef(null);
  const [complete, setComplete] = useState(false);
  const [status, setStatus] = useState('Opening the doors…');
  const reduced = useReducedMotion();
  useEffect(() => {
    let alive = true, raf, current = 1, target = 1, lastImage = null, wasComplete = false;
    const cache = new Map(), pending = new Set(), failed = new Set();
    const load = n => {
      if (n < 1 || n > 300 || cache.has(n) || pending.has(n) || failed.has(n)) return;
      pending.add(n);
      const img = new Image();
      img.onload = async () => {
        let decoded = img;
        try {
          const width = Math.min(1440, Math.ceil(innerWidth * Math.min(devicePixelRatio, 1.25)));
          decoded = await createImageBitmap(img, {resizeWidth:width, resizeHeight:Math.round(width*9/16)});
        } catch { /* The original JPEG is the compatible fallback. */ }
        pending.delete(n);
        if (!alive) { decoded.close?.(); return; }
        cache.set(n, decoded);
        if (n === 1 || (reduced && n === 300)) setStatus('');
        const furthest = [...cache.keys()].filter(k => k !== 1 && k !== 300)
          .sort((a,b) => Math.abs(b-current)-Math.abs(a-current));
        while (cache.size > 28) {
          const key = furthest.shift();
          cache.get(key)?.close?.();
          cache.delete(key);
        }
      };
      img.onerror = () => {
        pending.delete(n); failed.add(n);
        if (n === 1) setStatus('Walkthrough unavailable. Use Menu to continue.');
      };
      img.src = frame(n);
    };
    load(1); load(300);
    const tick = () => {
      const rect = root.current.getBoundingClientRect();
      const distance = Math.max(1, root.current.offsetHeight-innerHeight);
      const p = Math.max(0, Math.min(1, -rect.top/distance));
      target = reduced ? 300 : Math.round(Math.min(1,p/WALKTHROUGH_END)*299)+1;
      current += (target-current)*.12;
      const n = Math.round(current);
      load(target);
      for (let step=-5;step<=9;step++) load(n+step);
      const closestKey = cache.has(n) ? n : [...cache.keys()].reduce((a,b) => Math.abs(a-n)<Math.abs(b-n)?a:b,1);
      const img = cache.get(closestKey);
      const c = canvas.current, dpr = Math.min(devicePixelRatio,1.5);
      if (c.width!==Math.round(c.clientWidth*dpr) || c.height!==Math.round(c.clientHeight*dpr)) {
        c.width=Math.round(c.clientWidth*dpr); c.height=Math.round(c.clientHeight*dpr); lastImage=null;
      }
      if (img && lastImage!==img) {
        const ctx=c.getContext('2d'), scale=Math.min(c.width/img.width,c.height/img.height);
        ctx.fillStyle='#27271f'; ctx.fillRect(0,0,c.width,c.height);
        ctx.drawImage(img,(c.width-img.width*scale)/2,(c.height-img.height*scale)/2,img.width*scale,img.height*scale);
        lastImage=img;
      }
      const done = (reduced || (p>=WALKTHROUGH_END && n===300)) && closestKey===300;
      if (done!==wasComplete) { wasComplete=done; setComplete(done); onComplete(done); }
      progress.current.style.width=`${Math.min(1,p/WALKTHROUGH_END)*100}%`;
      // Keep the opening navigation inside the unmodified 16:9 image.
      document.documentElement.style.setProperty('--frame-top',`${Math.max(0,(innerHeight-innerWidth*9/16)/2)}px`);
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return () => { alive=false; cancelAnimationFrame(raf); cache.forEach(img=>img.close?.()); };
  },[reduced,onComplete]);
  return <section id="home" className="hero-track" ref={root}>
    <div className={`hero ${complete?'journey-complete':'journey-active'}`}>
      <canvas ref={canvas} aria-label="Scroll-controlled café walkthrough using the 300 original supplied frames"/>
      <div className="hero-shade"/>
      <div className="hero-copy" aria-hidden={!complete} inert={!complete}>
        <span className="eyebrow">BANDRA WEST · MUMBAI</span>
        <h1>The <em>Skyfools.</em></h1>
        <p>Good coffee. Curious plates. Stay a little longer.</p>
        <a className="hero-link" href="#menu">Find your favourite <ArrowUpRight size={19}/></a>
      </div>
      <div className="hero-bottom"><span>{complete?'YOU’VE ARRIVED':'TAKE YOUR TIME'}</span>
        <div className="scroll-cue"><span>{complete?'SCROLL TO THE MENU':'SCROLL TO STEP INSIDE'}</span><ArrowDown size={19}/></div>
        <span className="hero-index">{complete?'MAKE YOURSELF AT HOME':'A SLOW WALK THROUGH'}</span>
      </div>
      {status&&<div className="loading" role="status">{status}</div>}
      <div className="hero-progress" ref={progress}/>
    </div>
  </section>;
}
