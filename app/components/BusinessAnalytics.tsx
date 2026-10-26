"use client";
import {useEffect} from "react";
import {usePathname} from "next/navigation";
import {sendAnalytics} from "./AnalyticsEvent";
import {trafficSource} from "../../lib/analytics-events";
export default function BusinessAnalytics(){
 const pathname=usePathname();
 useEffect(()=>{if(pathname.startsWith("/admin")||/^\/writer(?:\/|$)/.test(pathname))return;
  if(/^\/updates\/[^/]+$/.test(pathname))sendAnalytics("article_view",pathname);
  if(/^\/services(?:\/[^/]+)?$/.test(pathname))sendAnalytics("service_view",pathname);
  try{const last=Number(sessionStorage.getItem("soh-traffic-observed")||0);if(!last||Date.now()-last>30*60*1000){sendAnalytics("traffic_source",trafficSource(document.referrer));sessionStorage.setItem("soh-traffic-observed",String(Date.now()))}}catch{/* Analytics must not affect page use when storage is unavailable. */}
 },[pathname]);
 useEffect(()=>{function click(event:MouseEvent){const target=event.target;if(!(target instanceof Element))return;
  const path=window.location.pathname;if(path.startsWith("/admin")||/^\/writer(?:\/|$)/.test(path))return;
  const anchor=target.closest("a[href]");if(anchor instanceof HTMLAnchorElement&&/^https:\/\/(?:wa\.me|api\.whatsapp\.com|www\.whatsapp\.com)\//i.test(anchor.href))sendAnalytics("whatsapp_click",path);
  if(/(?:calculator|\/tools)(?:\/|$)/.test(path)&&target.closest("button")?.textContent?.match(/calculate|check eligibility|check aggregate|simulate|plan/i))sendAnalytics("calculator_use",path);
 }document.addEventListener("click",click);return()=>document.removeEventListener("click",click)},[]);
 return null;
}
