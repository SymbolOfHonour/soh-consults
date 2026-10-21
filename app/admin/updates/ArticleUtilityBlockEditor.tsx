"use client";
import type {ArticleBlock} from "../../../lib/article-blocks";
type Editable=Extract<ArticleBlock,{type:"notice"|"quote"|"faq"|"divider"|"collapsible"}>;
type Props={block:Editable;disabled:boolean;onChange:(updated:Editable)=>void};
const field="w-full min-w-0 rounded-lg border border-gray-300 bg-white p-3 text-base text-gray-950";
const button="rounded-lg border border-green-300 bg-white px-3 py-2 text-sm font-semibold text-green-800 disabled:opacity-40";
export default function ArticleUtilityBlockEditor({block,disabled,onChange}:Props){
 if(block.type==="divider")return <div className="space-y-3"><label className="block text-sm font-semibold">Divider position<select aria-label="Divider position" className={field} disabled={disabled} value={block.align||"center"} onChange={e=>onChange({...block,align:e.target.value as "left"|"center"|"right"})}><option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option></select></label><p className="text-sm text-gray-600">This divider is a visual separator. Use an expandable section to show or hide text beneath a clickable title.</p><button type="button" className={button} disabled={disabled} onClick={()=>onChange({type:"collapsible",title:"",text:""})}>Convert to expandable section</button></div>;
 if(block.type==="collapsible")return <div className="space-y-3">
  <p className="text-sm text-gray-600">Readers click the title or arrow to show or hide the text below. Move the text you want to hide into Section text. Other article blocks stay visible.</p>
  <label className="block text-sm font-semibold">Section title<input aria-label="Section title" className={field} maxLength={200} disabled={disabled} value={block.title} placeholder="Before You Apply" onChange={e=>onChange({...block,title:e.target.value})}/></label>
  <label className="block text-sm font-semibold">Section text<textarea aria-label="Section text" className={field} rows={7} maxLength={30000} disabled={disabled} value={block.text} onChange={e=>onChange({...block,text:e.target.value})}/></label>
  <p className="text-xs text-gray-500">Supports the same bold, italic, lists and links as article text. Click the title in Live article preview to test it.</p>
 </div>;
 if(block.type==="notice")return <div className="space-y-3">
  <label className="block text-sm font-semibold">Notice type<select className={field} disabled={disabled} value={block.variant} onChange={e=>onChange({...block,variant:e.target.value as "info"|"warning"|"deadline"})}><option value="info">Information</option><option value="deadline">Deadline</option><option value="warning">Important warning</option></select></label>
  <label className="block text-sm font-semibold">Notice heading<input className={field} maxLength={200} disabled={disabled} value={block.title||""} onChange={e=>onChange({...block,title:e.target.value})}/></label>
  <label className="block text-sm font-semibold">Notice text<textarea className={field} rows={4} maxLength={12000} disabled={disabled} value={block.text} onChange={e=>onChange({...block,text:e.target.value})}/></label>
 </div>;
 if(block.type==="quote")return <div className="space-y-3">
  <label className="block text-sm font-semibold">Quotation<textarea className={field} rows={4} maxLength={12000} disabled={disabled} value={block.text} onChange={e=>onChange({...block,text:e.target.value})}/></label>
  <label className="block text-sm font-semibold">Attribution (optional)<input className={field} maxLength={250} disabled={disabled} value={block.attribution||""} onChange={e=>onChange({...block,attribution:e.target.value})}/></label>
 </div>;
 return <div className="space-y-3" aria-label="FAQ editor">
  {block.entries.map((entry,i)=><div key={i} className="rounded-lg border p-3">
   <label className="block text-sm font-semibold">Question {i+1}<input className={field} maxLength={500} disabled={disabled} value={entry.question} onChange={e=>onChange({...block,entries:block.entries.map((value,n)=>n===i?{...value,question:e.target.value}:value)})}/></label>
   <label className="mt-2 block text-sm font-semibold">Answer<textarea className={field} rows={4} maxLength={10000} disabled={disabled} value={entry.answer} onChange={e=>onChange({...block,entries:block.entries.map((value,n)=>n===i?{...value,answer:e.target.value}:value)})}/></label>
   <div className="mt-2 flex gap-2">
    <button type="button" className={button} disabled={disabled||i===0} onClick={()=>{const entries=[...block.entries];[entries[i-1],entries[i]]=[entries[i],entries[i-1]];onChange({...block,entries});}}>↑ Up</button>
    <button type="button" className={button} disabled={disabled||i===block.entries.length-1} onClick={()=>{const entries=[...block.entries];[entries[i+1],entries[i]]=[entries[i],entries[i+1]];onChange({...block,entries});}}>↓ Down</button>
    <button type="button" className={button} disabled={disabled} onClick={()=>onChange({...block,entries:block.entries.filter((_,n)=>n!==i)})}>Remove</button>
   </div>
  </div>)}
  <button type="button" className={button} disabled={disabled||block.entries.length>=40} onClick={()=>onChange({...block,entries:[...block.entries,{question:"",answer:""}]})}>+ Add FAQ</button>
 </div>;
}
