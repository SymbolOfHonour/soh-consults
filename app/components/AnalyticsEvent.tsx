"use client";
import {useEffect} from "react";
import type {AnalyticsEvent as Event} from "../../lib/analytics-events";
export function sendAnalytics(event:Event,label=""){try{void fetch("/api/public/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event,label}),keepalive:true}).catch(()=>{});}catch{}}
export default function AnalyticsEvent({event,label=""}:{event:Event;label?:string}){useEffect(()=>{sendAnalytics(event,label)},[event,label]);return null;}
