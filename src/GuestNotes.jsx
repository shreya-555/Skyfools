import React,{useEffect,useRef} from 'react';
import {useReducedMotion} from 'motion/react';
import {ArrowUpRight,Star} from 'lucide-react';
import {reviews,sources} from './data';

export default function GuestNotes({onSelect,modalOpen}){
  const track=useRef(null),position=useRef(0),hold=useRef(false),drag=useRef(null);
  const reduced=useReducedMotion();
  useEffect(()=>{
    let raf,last=performance.now(),visible=false;
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;},{rootMargin:'200px'});
    observer.observe(track.current.parentElement);
    const tick=t=>{
      if(!visible||document.hidden){last=t;raf=requestAnimationFrame(tick);return;}
      const el=track.current,step=el.firstElementChild.getBoundingClientRect().width+22,total=step*reviews.length;
      if(!reduced&&!hold.current&&!drag.current&&!modalOpen)position.current+=Math.min(t-last,40)*.022;
      last=t;
      position.current=((position.current%total)+total)%total;
      el.style.transform=`translateX(${-position.current}px)`;
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return()=>{cancelAnimationFrame(raf);observer.disconnect();};
  },[reduced,modalOpen]);
  return <section className="reviews section" id="reviews">
    <div className="section-title"><div><span className="eyebrow">GUEST NOTES</span><h2>What guests remember.</h2></div><div className="section-intro"><p>Small moments from visits to The Lovefools, shared in guests’ own reviews and carefully summarised here.</p><a className="text-link" href={sources.visit+'/reviews'} target="_blank" rel="noreferrer">Read public reviews <ArrowUpRight size={17}/></a></div></div>
    <div className="review-window" onMouseEnter={()=>hold.current=true} onMouseLeave={()=>{hold.current=false;drag.current=null;}} onFocus={()=>hold.current=true} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))hold.current=false;}} onPointerDown={e=>{if(e.button===0)drag.current={x:e.clientX,start:position.current,moved:false};}} onPointerMove={e=>{if(drag.current){const d=e.clientX-drag.current.x;drag.current.moved=drag.current.moved||Math.abs(d)>5;position.current=drag.current.start-d;}}} onPointerUp={()=>setTimeout(()=>drag.current=null,0)} onPointerCancel={()=>drag.current=null}>
      <div className="review-track" ref={track}>{[0,1,2].flatMap(copy=>reviews.map(r=><button className="review-card" key={`${copy}-${r.name}`} tabIndex={copy===0?0:-1} aria-hidden={copy>0?true:undefined} onFocus={e=>position.current=e.currentTarget.offsetLeft} onClick={()=>{if(!drag.current?.moved)onSelect({type:'review',review:r});}}>
        <div className="review-card-top"><div className="stars" aria-label={`${r.rating} out of 5 stars`}>{Array.from({length:5},(_,n)=><Star key={n} size={16} fill={n<r.rating?'currentColor':'none'}/>)}</div><ArrowUpRight size={18}/></div>
        <p className="review-words">{r.summary}</p>
        <div className="review-person"><div className="review-avatar" aria-hidden="true">{r.name.split(' ').slice(0,2).map(n=>n[0]).join('')}</div><div><strong>{r.name}</strong><span>{r.platform} · Review summary</span></div></div>
      </button>))}</div>
    </div>
    <p className="review-footnote">Selected public reviews, paraphrased for clarity. Open a card for its source.</p>
  </section>;
}
