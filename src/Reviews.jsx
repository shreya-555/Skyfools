import React, {useEffect,useRef,useState} from 'react';
import {useReducedMotion} from 'motion/react';
import {ArrowLeft,ArrowRight,ArrowUpRight,Pause,Play,Star} from 'lucide-react';
import {reviews,sources} from './data';

export default function ReviewSection(){
  const track=useRef(null), position=useRef(0), hold=useRef(false), drag=useRef(null);
  const [paused,setPaused]=useState(false);
  const reduced=useReducedMotion();
  useEffect(()=>{
    let raf,last=performance.now(),visible=false;
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;},{rootMargin:'200px'});
    observer.observe(track.current.parentElement);
    const tick=t=>{
      if(!visible||document.hidden){last=t;raf=requestAnimationFrame(tick);return;}
      const el=track.current, step=el.firstElementChild.getBoundingClientRect().width+22;
      const total=step*reviews.length;
      if(!paused&&!reduced&&!hold.current&&!drag.current) position.current+=Math.min(t-last,40)*.022;
      last=t;
      position.current=((position.current%total)+total)%total;
      el.style.transform=`translateX(${-position.current}px)`;
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return()=>{cancelAnimationFrame(raf);observer.disconnect();};
  },[paused,reduced]);
  const move=dir=>position.current+=dir*(track.current.firstElementChild.getBoundingClientRect().width+22);
  return <section className="reviews section" id="reviews">
    <div className="section-title"><div><span className="eyebrow">15 VOICES. PLENTY OF LOVE.</span><h2>Good food.<br/><em>Even better company.</em></h2></div>
      <div className="section-intro"><p>Fifteen guests share what stayed with them.</p><p className="review-disclosure">Selected positive reviews of The Lovefools, summarised from public sources.</p>
        <a className="text-link" href={sources.visit+'/reviews'} target="_blank" rel="noreferrer">Read the full reviews <ArrowUpRight size={18}/></a></div>
    </div>
    <div className="review-window" onMouseEnter={()=>hold.current=true} onMouseLeave={()=>{hold.current=false;drag.current=null;}}
      onFocus={()=>hold.current=true} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))hold.current=false;}}
      onPointerDown={e=>{if(e.button===0)drag.current={x:e.clientX,start:position.current};}}
      onPointerMove={e=>{if(drag.current)position.current=drag.current.start-(e.clientX-drag.current.x);}}
      onPointerUp={()=>drag.current=null} onPointerCancel={()=>drag.current=null}>
      <div className="review-track" ref={track}>{[0,1,2].flatMap(copy=>reviews.map((r,i)=><article className="review-card" key={`${copy}-${r.name}`} aria-hidden={copy>0?true:undefined}>
        <div className="review-card-top"><div className="stars" aria-label={`${r.rating} out of 5 stars`}>{Array.from({length:5},(_,n)=><Star key={n} size={16} fill={n<r.rating?'currentColor':'none'}/>)}</div><span>{String(i+1).padStart(2,'0')} / 15</span></div>
        <p className="review-words">{r.summary}</p>
        <div className="review-person"><div className="review-avatar" aria-hidden="true">{r.name.split(' ').slice(0,2).map(n=>n[0]).join('')}</div><div><a href={r.source} target="_blank" rel="noreferrer" tabIndex={copy===0?0:-1} onFocus={e=>position.current=e.currentTarget.closest('article').offsetLeft}>{r.name} <ArrowUpRight size={16}/></a><span>{r.platform} · Review summary</span></div></div>
      </article>))}</div>
    </div>
    <div className="reviews-controls"><span>Real experiences. In their spirit, in fewer words.</span><div className="arrows"><button aria-label={paused?'Resume reviews':'Pause reviews'} onClick={()=>setPaused(!paused)}>{paused?<Play size={18}/>:<Pause size={18}/>}</button><button aria-label="Previous reviews" onClick={()=>move(-1)}><ArrowLeft size={20}/></button><button aria-label="Next reviews" onClick={()=>move(1)}><ArrowRight size={20}/></button></div></div>
  </section>;
}
