"use client";
import { useEffect, useState } from "react";
// Keep searches shareable and restore them on Back without sending any new tracking data.
export function useDiscoveryFilters<T extends Record<string,string>>(defaults:T) {
  const [filters,setFilters]=useState<T>(defaults);
  useEffect(()=>{
    const read=()=>{const params=new URLSearchParams(window.location.search);setFilters(Object.fromEntries(Object.entries(defaults).map(([key,value])=>[key,params.get(key)||value])) as T);};
    read();window.addEventListener("popstate",read);
    return ()=>window.removeEventListener("popstate",read);
    // Defaults are a fixed schema for this explorer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  const update=(patch:Partial<T>)=>{
    const next={...filters,...patch};setFilters(next);
    const url=new URL(window.location.href);
    for(const [key,value] of Object.entries(next)){if(!value||value===defaults[key])url.searchParams.delete(key);else url.searchParams.set(key,value);}
    window.history.replaceState(null,"",`${url.pathname}${url.search}${url.hash}`);
  };
  return [filters,update] as const;
}
