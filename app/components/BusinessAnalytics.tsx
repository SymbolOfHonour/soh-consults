"use client";
import {useEffect} from "react";
import {usePathname} from "next/navigation";
import {sendAnalytics} from "./AnalyticsEvent";
export default function BusinessAnalytics(){const pathname=usePathname();useEffect(()=>{if(/^\/updates\/[^/]+$/.test(pathname))sendAnalytics("article_view",pathname.slice(0,160));},[pathname]);useEffect(()=>{function click(event:MouseEvent){const target=event.target;if(!(target instanceof Element))return;const anchor=target.closest("a[href]");if(anchor instanceof HTMLAnchorElement&&/^https:\/\/(?:wa\.me|api\.whatsapp\.com|www\.whatsapp\.com)\//i.test(anchor.href))sendAnalytics("whatsapp_click",window.location.pathname.slice(0,160));if(window.location.pathname==="/lasu-calculator"&&target.closest("button")?.textContent?.match(/calculate|check eligibility|check aggregate/i))sendAnalytics("calculator_use");}document.addEventListener("click",click);return()=>document.removeEventListener("click",click)},[]);return null;}
