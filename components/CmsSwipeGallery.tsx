"use client";

import { useRef } from "react";
import type { CmsItem } from "../lib/site-manager";

export default function CmsSwipeGallery({items}:{items:CmsItem[]}){
 const rail=useRef<HTMLDivElement>(null);
 const slides=items.filter(item=>item.image);
 const move=(direction:-1|1)=>{const el=rail.current;if(!el)return;el.scrollBy({left:direction*el.clientWidth,behavior:"smooth"})};
 if(!slides.length)return null;
 return <div className="relative">
  <div ref={rail} className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Image gallery">
   {slides.map((item,index)=><article key={item.id} className="min-w-full snap-center overflow-hidden rounded-2xl border border-[#e2e5dc] bg-white shadow-sm">
    {item.link?<a href={item.link} className="block"><img src={item.image} alt={item.title||`Gallery image ${index+1}`} className="max-h-[680px] w-full object-contain" loading="lazy"/></a>:<img src={item.image} alt={item.title||`Gallery image ${index+1}`} className="max-h-[680px] w-full object-contain" loading="lazy"/>}
    {(item.title||item.description)&&<div className="p-4 sm:p-5">{item.title&&<h3 className="font-black">{item.title}</h3>}{item.description&&<p className="mt-1 text-sm leading-6 text-[#52615a]">{item.description}</p>}</div>}
   </article>)}
  </div>
  {slides.length>1&&<><button type="button" onClick={()=>move(-1)} aria-label="Previous image" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/95 px-3 py-2 text-xl font-black shadow-md">‹</button><button type="button" onClick={()=>move(1)} aria-label="Next image" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/95 px-3 py-2 text-xl font-black shadow-md">›</button><p className="mt-1 text-center text-xs font-bold text-[#52615a]">Swipe to view {slides.length} images</p></>}
 </div>;
}
