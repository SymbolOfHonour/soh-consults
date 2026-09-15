import{createModuleRecord,listModuleRecords,updateModuleRecord}from"./admin-module-store";
export type HomepageControl={enabled:boolean;title:string;message:string;link:string;label:string;tone:"green"|"amber"|"red"};
const TITLE="Homepage Announcement";
const defaults:HomepageControl={enabled:false,title:"Important Update",message:"",link:"/updates",label:"Read update",tone:"green"};
export async function getHomepageControl(){const row=(await listModuleRecords("settings")).find(r=>r.title===TITLE);if(!row)return defaults;try{return{...defaults,...JSON.parse(row.value)} as HomepageControl}catch{return defaults}}
export async function saveHomepageControl(value:HomepageControl){const rows=await listModuleRecords("settings"),row=rows.find(r=>r.title===TITLE),payload=JSON.stringify(value);if(row)return updateModuleRecord("settings",row.id,{...row,value:payload,status:value.enabled?"ACTIVE":"INACTIVE"});return createModuleRecord("settings",{title:TITLE,subtitle:"Public homepage banner",details:"Controls the optional public announcement banner.",value:payload,status:value.enabled?"ACTIVE":"INACTIVE"})}
