import {createModuleRecord,listModuleRecords,type ModuleKey} from "./admin-module-store";

import {analyticsEvents,analyticsLabel,type AnalyticsEvent} from "./analytics-events";
export type {AnalyticsEvent} from "./analytics-events";
export async function recordAnalyticsEvent(event:AnalyticsEvent,label=""){return createModuleRecord("analytics",{title:event,subtitle:"Measured event",status:"MEASURED",details:analyticsLabel(event,label),value:"1"});}
export async function analyticsSummary(){const rows=await listModuleRecords("analytics");const counts=Object.fromEntries(analyticsEvents.map(event=>[event,0])) as Record<AnalyticsEvent,number>;for(const row of rows)if(row.status==="MEASURED"&&Object.hasOwn(counts,row.title))counts[row.title as AnalyticsEvent]++;return counts;}
export async function recordHealth(name:string,ok:boolean,details=""){return createModuleRecord("settings",{title:`Health: ${name}`,subtitle:"Operations health",status:ok?"OK":"FAILED",details:details.slice(0,12000),value:new Date().toISOString()});}
export async function latestHealth(){const rows=await listModuleRecords("settings");return rows.filter(r=>r.title.startsWith("Health: ")).slice(0,20);}
export async function moduleCount(module:ModuleKey){return (await listModuleRecords(module)).length;}
export async function serverSnapshotTime(){return Date.now();}
