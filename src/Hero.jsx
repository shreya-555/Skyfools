import React, {useEffect, useRef, useState} from 'react';
import {useReducedMotion} from 'motion/react';
import {ArrowDown, ArrowUpRight} from 'lucide-react';

const LAST_FRAME = 240;
const WALKTHROUGH_END = .82;
const sequenceFrame = n => `/${innerWidth<700?'sequence-mobile':'sequence'}/frame-${String(n).padStart(3, '0')}.webp`;

export default function Hero({onComplete}) {
  const root = useRef(null), canvas = useRef(null), progress = useRef(null);
  const [complete, setComplete] = useState(false);
  const [status, setStatus] = useState('Opening the doors…');
  const reduced = useReducedMotion();

  useEffect(() => {
    const cache = new Map(), pending = new Set(), failed = new Set();
    let alive = true, raf = 0, target = reduced ? LAST_FRAME : 1;
    let current = 0, inFlight = 0, lastDrawn = null, finished = false;
    let direction = 1;

    const schedule = () => { if (!raf && alive) raf = requestAnimationFrame(draw); };
    const trimCache = () => {
      if (cache.size <= 32) return;
      const removable = [...cache.keys()]
        .filter(n => n !== 1 && n !== LAST_FRAME && n !== current)
        .sort((a,b) => Math.abs(b-target)-Math.abs(a-target));
      while (cache.size > 32 && removable.length) {
        const n = removable.shift();
        cache.get(n)?.close(); cache.delete(n);
      }
    };
    const load = n => {
      if (n < 1 || n > LAST_FRAME || cache.has(n) || pending.has(n) || failed.has(n) || inFlight >= 4) return false;
      pending.add(n); inFlight++;
      const img = new Image();
      img.onload = async () => {
        try {
          const bitmap = await createImageBitmap(img);
          if (!alive) { bitmap.close(); return; }
          cache.set(n, bitmap);
          if (n === 1 || (reduced && n === LAST_FRAME)) setStatus('');
          trimCache();
        } catch { failed.add(n); }
        finally { pending.delete(n); inFlight--; schedule(); }
      };
      img.onerror = () => {
        failed.add(n); pending.delete(n); inFlight--;
        if (n === 1) setStatus('Walkthrough unavailable. Use Menu to continue.');
        schedule();
      };
      img.src = sequenceFrame(n);
      return true;
    };
    const prefetch = () => {
      load(target); load(1); load(LAST_FRAME);
      for (let step=1;step<=14 && inFlight<4;step++) {
        load(target+direction*step);
        if (step<=4) load(target-direction*step);
      }
    };
    const readProgress = () => {
      const rect=root.current.getBoundingClientRect();
      const distance=Math.max(1,root.current.offsetHeight-innerHeight);
      const p=Math.max(0,Math.min(1,-rect.top/distance));
      const next=reduced?LAST_FRAME:Math.round(Math.min(1,p/WALKTHROUGH_END)*(LAST_FRAME-1))+1;
      direction=next>=target?1:-1; target=next;
      progress.current.style.width=`${Math.min(1,p/WALKTHROUGH_END)*100}%`;
      document.documentElement.style.setProperty('--frame-top',`${Math.max(0,(innerHeight-innerWidth*9/16)/2)}px`);
      schedule();
    };
    const draw = () => {
      raf=0; prefetch();
      const c=canvas.current,dpr=Math.min(devicePixelRatio,1.5);
      const w=Math.round(c.clientWidth*dpr),h=Math.round(c.clientHeight*dpr);
      if(c.width!==w||c.height!==h){c.width=w;c.height=h;lastDrawn=null;}
      let available=cache.has(target)?target:null;
      if(available===null&&cache.size)available=[...cache.keys()].reduce((a,b)=>Math.abs(a-target)<Math.abs(b-target)?a:b);
      const bitmap=cache.get(available);
      if(bitmap&&bitmap!==lastDrawn){
        const ctx=c.getContext('2d',{alpha:false}),scale=Math.min(w/bitmap.width,h/bitmap.height);
        ctx.fillStyle='#27271f';ctx.fillRect(0,0,w,h);
        ctx.drawImage(bitmap,(w-bitmap.width*scale)/2,(h-bitmap.height*scale)/2,bitmap.width*scale,bitmap.height*scale);
        current=available;lastDrawn=bitmap;
      }
      const done=target===LAST_FRAME&&current===LAST_FRAME;
      if(done!==finished){finished=done;setComplete(done);onComplete(done);}
    };
    window.addEventListener('scroll',readProgress,{passive:true});
    window.addEventListener('resize',readProgress,{passive:true});
    document.addEventListener('visibilitychange',readProgress);
    readProgress();
    return()=>{
      alive=false;window.removeEventListener('scroll',readProgress);
      window.removeEventListener('resize',readProgress);
      document.removeEventListener('visibilitychange',readProgress);
      cancelAnimationFrame(raf);cache.forEach(bitmap=>bitmap.close());
    };
  },[reduced,onComplete]);
  return <section id="home" className="hero-track" ref={root}>
    <div className={`hero ${complete?'journey-complete':'journey-active'}`}>
      <canvas ref={canvas} aria-label="Scroll-controlled café walkthrough using the 240 original supplied frames"/>
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
