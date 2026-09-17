"use client";
import {useEffect} from "react";
type Event="article_view"|"calculator_use"|"whatsapp_click";
export function sendAnalytics(event:Event,label=""){try{void fetch("/api/public/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event,label}),keepalive:true}).catch(()=>{});}catch{}}
export default function AnalyticsEvent({event,label=""}:{event:Event;label?:string}){useEffect(()=>{sendAnalytics(event,label)},[event,label]);return null;}
