import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowLeft,ArrowRight,ArrowUpRight} from 'lucide-react';
import {bookCategories} from './menuBookData';
import './style.css';
import './menuPage.css';

const perPage=10;
const chapterNames={'Hot Coffee [250 Ml]':'Coffee','Hot Beverage':'Tea & more','Breakfast Menu':'Breakfast & brunch','Cold Beverage':'Cold drinks','Dinner Menu':'Tasting menus','Alcohol':'The bar','Add Ons':'Extras','Lunch & Dinner A LA Cart':'Lunch & dinner','Open Item Food':'Other listing'};
const chapter=title=>chapterNames[title]||title;
const visibleCategories=bookCategories.filter(c=>c.title!=='Open Item Food').map(c=>({...c,items:c.items.filter(([name])=>!name.startsWith('Service&breakage'))}));
const pages=[{kind:'cover'},...visibleCategories.flatMap(({title,items})=>Array.from({length:Math.ceil(items.length/perPage)},(_,part)=>({kind:'list',title,items:items.slice(part*perPage,(part+1)*perPage),part:part+1,parts:Math.ceil(items.length/perPage)}))),{kind:'end'}];
const categoryStarts=visibleCategories.map(({title})=>({title,index:pages.findIndex(p=>p.kind==='list'&&p.title===title)}));

function Page({page,number}){
  if(!page)return <div className="book-page book-blank" aria-hidden="true"/>;
  if(page.kind==='cover')return <div className="book-page book-cover"><span className="book-kicker">THE SKYFOOLS</span><div><span className="book-ornament">✳</span><h2>A little<br/><em>something</em><br/>for you.</h2></div><p>Food, coffee & a reason to stay.</p><span className="book-cover-bottom">BANDRA WEST · MUMBAI</span></div>;
  if(page.kind==='end')return <div className="book-page book-end"><span className="book-kicker">THE SKYFOOLS</span><div><span className="book-ornament">✳</span><h2>See you<br/><em>around.</em></h2><p>There is always room for another visit.</p></div><a href="/#visit">Come find us <ArrowUpRight size={16}/></a></div>;
  return <div className="book-page book-list"><div className="book-page-top"><span>THE SKYFOOLS · BANDRA WEST</span><span>{String(number).padStart(2,'0')}</span></div><div className="book-heading"><span>THE MENU</span><h2>{chapter(page.title)}</h2><small>{page.parts>1? `PART ${page.part} OF ${page.parts}`:'FOOD & DRINK'}</small></div><div className="book-items">{page.items.map(([name,price],i)=><div className="book-item" key={name+i}><span>{name}</span><i aria-hidden="true"/><strong>₹{price}</strong></div>)}</div><div className="book-page-bottom"><span>Bandra West · Mumbai</span><span>✳</span></div></div>;
}

export default function MenuBook({embedded=false}){
  const [single,setSingle]=useState(()=>window.matchMedia('(max-width: 760px)').matches);
  const [group,setGroup]=useState(0);
  const [turn,setTurn]=useState(null);
  const timer=useRef(null),touch=useRef(null),bookRoot=useRef(null);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const size=single?1:2;
  const groups=Math.ceil(pages.length/size);
  const at=(g,side=0)=>pages[g*size+side];
  const change=target=>{
    if(target<0||target>=groups||target===group||turn)return;
    if(reduced){setGroup(target);return;}
    const direction=target>group?'next':'prev';
    setTurn({from:group,to:target,direction});
    timer.current=window.setTimeout(()=>{setGroup(target);setTurn(null);},650);
  };
  useEffect(()=>{const mq=window.matchMedia('(max-width: 760px)');const listener=()=>{setSingle(mq.matches);setGroup(0);setTurn(null);clearTimeout(timer.current);};mq.addEventListener('change',listener);return()=>{mq.removeEventListener('change',listener);clearTimeout(timer.current);};},[]);
  useEffect(()=>{const key=e=>{if(e.target.matches('select,input,textarea'))return;if(embedded&&!bookRoot.current?.contains(document.activeElement))return;if(e.key==='ArrowRight')change(group+1);if(e.key==='ArrowLeft')change(group-1);};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[group,turn,single,embedded]);
  const current=turn?.from??group, destination=turn?.to??group;
  const left=single?null:turn?.direction==='prev'?at(destination):at(current);
  const right=single?(turn?at(destination):at(group)):turn?.direction==='next'?at(destination,1):at(current,1);
  const flippingFront=turn?(single?at(current):turn.direction==='next'?at(current,1):at(current)):null;
  const flippingBack=turn?(single?at(destination):turn.direction==='next'?at(destination):at(destination,1)):null;
  const visible=single?group+1:Math.min((group+1)*2,pages.length);
  const ContentTag=embedded?'div':'main';
  return <div className={`book-site ${embedded?'book-embedded':''}`} ref={bookRoot} tabIndex={embedded?0:undefined} role={embedded?'region':undefined} aria-label={embedded?'Interactive menu book':undefined}>
    {!embedded&&<header className="book-nav"><a className="book-brand" href="/#home">the skyfools</a><nav aria-label="Menu page navigation"><a href="/#story">Our story</a><a href="/#visit">Visit us</a><a className="book-home" href="/#book">Back to the experience <ArrowUpRight size={16}/></a></nav></header>}
    <ContentTag className="book-main">{!embedded&&<div className="book-intro"><div><span className="book-eyebrow">THE SKYFOOLS · BANDRA WEST</span><h1>A menu to <em>linger over.</em></h1></div><p>Coffee, brunch, sweets and more. Turn a page and see what catches your eye.</p></div>}
      <div className="book-layout"><div className="book-tools"><label htmlFor="chapter">Explore a chapter</label><select id="chapter" value="" onChange={e=>{const index=Number(e.target.value);change(Math.floor(index/size));e.target.value='';}}><option value="" disabled>Choose a category</option>{categoryStarts.map(c=><option value={c.index} key={c.title}>{chapter(c.title)}</option>)}</select><span>{visibleCategories.reduce((n,c)=>n+c.items.length,0)} menu items</span></div>
      <div className="book-stage" onTouchStart={e=>touch.current=e.touches[0].clientX} onTouchEnd={e=>{if(touch.current===null)return;const delta=e.changedTouches[0].clientX-touch.current;if(Math.abs(delta)>60)change(group+(delta<0?1:-1));touch.current=null;}}><div className="book-shadow"/><div className="book-pages">{!single&&<Page page={left} number={current*size+1}/>}<Page page={right} number={single?group+1:current*size+2}/></div>{turn&&<div className={`turn-leaf ${turn.direction} ${single?'single':''}`} key={turn.from+'-'+turn.to}><div className="turn-face front"><Page page={flippingFront} number={turn.from*size+(single?1:turn.direction==='next'?2:1)}/></div><div className="turn-face back"><Page page={flippingBack} number={turn.to*size+(single?1:turn.direction==='next'?1:2)}/></div></div>}</div>
      <div className="book-controls"><button onClick={()=>change(group-1)} disabled={group===0||!!turn} aria-label="Previous menu page"><ArrowLeft size={20}/> Previous</button><span>PAGE {visible} OF {pages.length}</span><button onClick={()=>change(group+1)} disabled={group===groups-1||!!turn} aria-label="Next menu page">Next <ArrowRight size={20}/></button></div></div>
    </ContentTag>{!embedded&&<footer className="book-footer"><a href="/#home">the skyfools</a><span>BANDRA WEST · MUMBAI</span><a href="https://www.instagram.com/strivx.technologies/" target="_blank" rel="noreferrer">Instagram ↗</a></footer>}
  </div>;
}

if(document.getElementById('menu-page-root'))createRoot(document.getElementById('menu-page-root')).render(<MenuBook/>);
