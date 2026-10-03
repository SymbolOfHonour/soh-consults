"use client";
import { useEffect, useRef } from "react";
export default function ArticleAd({slot,enabled}:{slot:string;enabled:boolean}) {
 const ref=useRef<HTMLModElement>(null);
 const requested=useRef(false);
 const active=enabled&&/^\d{5,20}$/.test(slot);
 useEffect(()=>{
  if(!active||!ref.current||requested.current)return;
  const observer=new IntersectionObserver(entries=>{
   if(!entries.some(entry=>entry.isIntersecting)||requested.current)return;
   requested.current=true;
   try{const queue=(window as Window & {adsbygoogle?:unknown[]}).adsbygoogle||[];(window as Window & {adsbygoogle?:unknown[]}).adsbygoogle=queue;queue.push({});}catch{ /* Preserve reserved space when ads are unavailable. */ }
   observer.disconnect();
  },{rootMargin:"200px"});
  observer.observe(ref.current);
  return()=>observer.disconnect();
 },[active]);
 return <aside aria-label="Advertisement" className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"><p className="mb-2 text-center text-xs text-gray-500">Advertisement</p><div className="h-[250px] overflow-hidden">{active?<ins ref={ref} className="adsbygoogle block h-[250px] w-full" style={{height:250}} data-ad-client="ca-pub-9913781873857877" data-ad-slot={slot}/>:<div className="grid h-full place-items-center text-xs text-gray-500">Reserved advertising space</div>}</div></aside>;
}
