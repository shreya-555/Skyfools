import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowLeft,ArrowRight,ArrowUpRight} from 'lucide-react';
import {bookCategories,bookSource} from './menuBookData';
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
  if(page.kind==='cover')return <div className="book-page book-cover"><span className="book-kicker">THE SKYFOOLS PRESENTS</span><div><span className="book-ornament">✳</span><h2>The<br/><em>Lovefools</em><br/>menu</h2></div><p>Food, coffee & a reason to stay.</p><span className="book-cover-bottom">BANDRA WEST · MUMBAI</span></div>;
  if(page.kind==='end')return <div className="book-page book-end"><span className="book-kicker">THE LOVEFOOLS</span><div><span className="book-ornament">✳</span><h2>See you<br/><em>around.</em></h2><p>For the current dine-in menu, availability and dietary information, please confirm with the restaurant.</p></div><a href={bookSource} target="_blank" rel="noreferrer">View the listing <ArrowUpRight size={16}/></a></div>;
  return <div className="book-page book-list"><div className="book-page-top"><span>THE LOVEFOOLS · BANDRA</span><span>{String(number).padStart(2,'0')}</span></div><div className="book-heading"><span>THE MENU</span><h2>{chapter(page.title)}</h2><small>{page.parts>1? `PART ${page.part} OF ${page.parts}`:'PUBLIC MENU LISTING'}</small></div><div className="book-items">{page.items.map(([name,price],i)=><div className="book-item" key={name+i}><span>{name}</span><i aria-hidden="true"/><strong>₹{price}</strong></div>)}</div><div className="book-page-bottom"><span>Listed prices in ₹ · may differ in person</span><span>✳</span></div></div>;
}

function MenuBook(){
  const [single,setSingle]=useState(()=>window.matchMedia('(max-width: 760px)').matches);
  const [group,setGroup]=useState(0);
  const [turn,setTurn]=useState(null);
  const timer=useRef(null),touch=useRef(null);
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
  useEffect(()=>{const key=e=>{if(e.target.matches('select,input,textarea'))return;if(e.key==='ArrowRight')change(group+1);if(e.key==='ArrowLeft')change(group-1);};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[group,turn,single]);
  const current=turn?.from??group, destination=turn?.to??group;
  const left=single?null:turn?.direction==='prev'?at(destination):at(current);
  const right=single?(turn?at(destination):at(group)):turn?.direction==='next'?at(destination,1):at(current,1);
  const flippingFront=turn?(single?at(current):turn.direction==='next'?at(current,1):at(current)):null;
  const flippingBack=turn?(single?at(destination):turn.direction==='next'?at(destination):at(destination,1)):null;
  const visible=single?group+1:Math.min((group+1)*2,pages.length);
  return <div className="book-site">
    <header className="book-nav"><a className="book-brand" href="/#home">the skyfools</a><nav aria-label="Menu page navigation"><a href="/#story">Our story</a><a href="/#visit">Visit us</a><a className="book-home" href="/#menu">Back to the experience <ArrowUpRight size={16}/></a></nav></header>
    <main className="book-main"><div className="book-intro"><div><span className="book-eyebrow">THE LOVEFOOLS · BANDRA WEST</span><h1>A menu to <em>linger over.</em></h1></div><p>Turn through the dishes and drinks publicly listed for The Lovefools. Prices shown are from a delivery listing and may differ at the restaurant.</p></div>
      <div className="book-layout"><div className="book-tools"><label htmlFor="chapter">Explore a chapter</label><select id="chapter" value="" onChange={e=>{const index=Number(e.target.value);change(Math.floor(index/size));e.target.value='';}}><option value="" disabled>Choose a category</option>{categoryStarts.map(c=><option value={c.index} key={c.title}>{chapter(c.title)}</option>)}</select><span>{visibleCategories.reduce((n,c)=>n+c.items.length,0)} publicly listed items</span></div>
      <div className="book-stage" onTouchStart={e=>touch.current=e.touches[0].clientX} onTouchEnd={e=>{if(touch.current===null)return;const delta=e.changedTouches[0].clientX-touch.current;if(Math.abs(delta)>60)change(group+(delta<0?1:-1));touch.current=null;}}><div className="book-shadow"/><div className="book-pages">{!single&&<Page page={left} number={current*size+1}/>}<Page page={right} number={single?group+1:current*size+2}/></div>{turn&&<div className={`turn-leaf ${turn.direction} ${single?'single':''}`} key={turn.from+'-'+turn.to}><div className="turn-face front"><Page page={flippingFront} number={turn.from*size+(single?1:turn.direction==='next'?2:1)}/></div><div className="turn-face back"><Page page={flippingBack} number={turn.to*size+(single?1:turn.direction==='next'?1:2)}/></div></div>}</div>
      <div className="book-controls"><button onClick={()=>change(group-1)} disabled={group===0||!!turn} aria-label="Previous menu page"><ArrowLeft size={20}/> Previous</button><span>PAGE {visible} OF {pages.length}</span><button onClick={()=>change(group+1)} disabled={group===groups-1||!!turn} aria-label="Next menu page">Next <ArrowRight size={20}/></button></div></div>
      <p className="book-source">Names and prices transcribed from the <a href={bookSource} target="_blank" rel="noreferrer">Lovefools public delivery listing <ArrowUpRight size={13}/></a>. This independent prototype is not the restaurant’s official menu. For current dine-in prices, allergens and availability, contact The Lovefools directly.</p>
    </main><footer className="book-footer"><a href="/#home">the skyfools</a><span>AN INDEPENDENT LOVEFOOLS-INSPIRED PROTOTYPE</span><a href="tel:+919820203360">+91 98202 03360</a></footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<MenuBook/>);
