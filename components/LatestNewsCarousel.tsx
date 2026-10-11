"use client";
import {useEffect,useState} from "react";
type Article={id:string;title:string;summary:string;category:string;date:string;slug:string;image?:string|null};
export default function LatestNewsCarousel({articles}:{articles:Article[]}){
 const [index,setIndex]=useState(0),[paused,setPaused]=useState(false);
 const slides=articles.slice(0,5);
 useEffect(()=>{setIndex(i=>slides.length?i%slides.length:0)},[slides.length]);
 useEffect(()=>{if(paused||slides.length<2)return;const timer=window.setInterval(()=>setIndex(i=>(i+1)%slides.length),6500);return()=>window.clearInterval(timer)},[paused,slides.length]);
 if(!slides.length)return null;
 const article=slides[index];const href=`/updates/${article.slug}`;
 let touchStart=0;
 return <section aria-label="Latest news slider" className="relative min-w-0 overflow-hidden rounded-2xl bg-[#043b29] text-white shadow-lg" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocusCapture={()=>setPaused(true)} onBlurCapture={()=>setPaused(false)} onTouchStart={e=>{touchStart=e.touches[0].clientX;setPaused(true)}} onTouchEnd={e=>{const distance=e.changedTouches[0].clientX-touchStart;if(Math.abs(distance)>45)setIndex(i=>(i+(distance<0?1:slides.length-1))%slides.length);setPaused(false)}}>
  <a href={href} className="block"><div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[16/10]">{article.image?<img src={article.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover"/>:<div className="absolute inset-0 bg-gradient-to-br from-[#07603f] to-[#021c16]"/>}<div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent"/><div className="absolute bottom-0 left-0 right-0 px-5 pb-14 pt-16 sm:px-8"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#efc46e]">Latest Update · {article.category} · {article.date}</p><h3 className="line-clamp-3 text-xl font-black leading-tight sm:text-3xl">{article.title}</h3><p className="mt-3 inline-block rounded-lg bg-[#efc46e] px-4 py-2 text-xs font-black text-[#032c20]">Read Story →</p></div></div></a>
  {slides.length>1&&<><button type="button" aria-label="Previous story" onClick={()=>setIndex(i=>(i+slides.length-1)%slides.length)} className="absolute left-2 top-1/2 rounded-full bg-black/60 px-3 py-2 text-white hover:bg-black/85">‹</button><button type="button" aria-label="Next story" onClick={()=>setIndex(i=>(i+1)%slides.length)} className="absolute right-2 top-1/2 rounded-full bg-black/60 px-3 py-2 text-white hover:bg-black/85">›</button><div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">{slides.map((s,i)=><button key={s.id} type="button" aria-label={`Show story ${i+1}`} aria-current={index===i?"true":undefined} onClick={()=>setIndex(i)} className={`h-1.5 rounded-full transition-all ${index===i?"w-7 bg-[#efc46e]":"w-2 bg-white/60"}`}/>)}</div></>}
 </section>
}
