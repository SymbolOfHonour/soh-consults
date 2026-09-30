"use client";
import {useRef,useState} from "react";
export default function GalleryCarousel({urls}:{urls:string[]}){
 const [active,setActive]=useState(0);const startX=useRef<number|null>(null);const count=urls.length;
 if(!count)return null;
 const go=(next:number)=>setActive((next+count)%count);
 return <section className="relative overflow-hidden rounded-2xl border bg-white" aria-label={`Article gallery, ${count} pictures`} onTouchStart={e=>{startX.current=e.touches[0]?.clientX??null;}} onTouchEnd={e=>{if(startX.current===null)return;const end=e.changedTouches[0]?.clientX??startX.current;const delta=end-startX.current;startX.current=null;if(Math.abs(delta)>45)go(active+(delta<0?1:-1));}}>
  <div className="relative flex min-h-[260px] items-center justify-center bg-gray-50 sm:min-h-[420px]">
   <img src={urls[active]} alt={`Article gallery picture ${active+1} of ${count}`} className="max-h-[650px] w-full select-none object-contain" draggable={false}/>
   {count>1&&<><button type="button" onClick={()=>go(active-1)} aria-label="Previous picture" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/65 px-4 py-3 text-2xl font-bold text-white shadow-lg hover:bg-black/80">‹</button><button type="button" onClick={()=>go(active+1)} aria-label="Next picture" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/65 px-4 py-3 text-2xl font-bold text-white shadow-lg hover:bg-black/80">›</button></>}
  </div>
  {count>1&&<div className="flex items-center justify-between gap-3 px-4 py-3"><span className="text-sm font-bold text-gray-700">{active+1} / {count}</span><div className="flex flex-wrap justify-center gap-2" aria-label="Choose picture">{urls.map((_,i)=><button key={i} type="button" onClick={()=>setActive(i)} aria-label={`Show picture ${i+1}`} aria-current={i===active?"true":undefined} className={`h-2.5 w-2.5 rounded-full ${i===active?"bg-green-700":"bg-gray-300"}`}/>)}</div><span className="text-xs text-gray-500">Swipe</span></div>}
 </section>;
}
