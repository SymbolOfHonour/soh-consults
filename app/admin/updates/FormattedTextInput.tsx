"use client";
import {useEffect,useRef,useState} from "react";
import {parseDelimitedRows,tableFromRows,tableFromHtml,type TableBlock} from "../../../lib/article-tables";
type Props={value:string;onChange:(value:string)=>void;disabled:boolean;heading:boolean;label:string;onInsertTable?:(table:TableBlock)=>void};
const actions=[{label:"Bold",before:"**",after:"**",example:"bold text"},{label:"Italic",before:"*",after:"*",example:"italic text"},{label:"Underline",before:"++",after:"++",example:"underlined text"},{label:"Strike",before:"~~",after:"~~",example:"struck text"},{label:"Link",before:"[",after:"](https://example.com)",example:"link text"}] as const;
function richHtmlToMarkdown(html:string){
 const doc=new DOMParser().parseFromString(html,"text/html");
 function walk(node:Node):string{
  if(node.nodeType===Node.TEXT_NODE)return node.textContent||"";
  if(!(node instanceof HTMLElement))return Array.from(node.childNodes).map(walk).join("");
  const inner=Array.from(node.childNodes).map(walk).join("");
  const tag=node.tagName.toLowerCase();
  if(tag==="strong"||tag==="b")return `**${inner}**`;
  if(tag==="em"||tag==="i")return `*${inner}*`;
  if(tag==="u")return `++${inner}++`;
  if(tag==="s"||tag==="strike"||tag==="del")return `~~${inner}~~`;
  if(tag==="a"){const href=node.getAttribute("href");return href&&/^https:\/\/[^\s)]+$/i.test(href)?`[${inner}](${href})`:inner;}
  if(tag==="li")return `- ${inner.trim()}\n`;
  if(tag==="br")return "\n";
  if(["p","div","h1","h2","h3","h4","h5","h6"].includes(tag))return `${inner.trim()}\n\n`;
  return inner;
 }
 return walk(doc.body).replace(/\n{3,}/g,"\n\n").trim();
}
export default function FormattedTextInput({value,onChange,disabled,heading,label,onInsertTable}:Props){
 const ref=useRef<HTMLTextAreaElement>(null);const [plainOnly,setPlainOnly]=useState(false);const [linkOpen,setLinkOpen]=useState(false);const [linkSearch,setLinkSearch]=useState("");const [links,setLinks]=useState<{title:string;permalink:string}[]>([]);const [linkStatus,setLinkStatus]=useState("");
 useEffect(()=>{if(!linkOpen)return;let active=true;void fetch(window.location.pathname.startsWith("/admin/writer")?"/api/admin/writer/links":"/api/admin/stories",{cache:"no-store"}).then(async response=>{if(!response.ok)throw Error("Unable to load updates");const result=await response.json();if(active){setLinks((result.stories||[]).filter((item:{title:string;permalink?:string;status:string})=>item.status==="published"&&typeof item.permalink==="string").map((item:{title:string;permalink:string})=>({title:item.title,permalink:item.permalink})));setLinkStatus("");}}).catch(()=>{if(active)setLinkStatus("Could not load published articles.");});return()=>{active=false;};},[linkOpen]);
 function wrap(before:string,after:string,example:string){const area=ref.current;if(!area)return;const start=area.selectionStart,end=area.selectionEnd;const selected=value.slice(start,end)||example;onChange(value.slice(0,start)+before+selected+after+value.slice(end));requestAnimationFrame(()=>{area.focus();area.setSelectionRange(start+before.length,start+before.length+selected.length);});}
 function line(prefix:string){const area=ref.current;if(!area)return;const start=area.selectionStart,end=area.selectionEnd;const lineStart=value.lastIndexOf("\n",start-1)+1;const selection=value.slice(lineStart,end);const replacement=selection.split("\n").map(line=>prefix+line).join("\n");onChange(value.slice(0,lineStart)+replacement+value.slice(end));requestAnimationFrame(()=>area.focus());}
 function paste(event:React.ClipboardEvent<HTMLTextAreaElement>){
  if(plainOnly)return;
  const html=event.clipboardData.getData("text/html");
  const plain=event.clipboardData.getData("text/plain");
  if(!heading&&onInsertTable){
   try {
    const imported=html?tableFromHtml(html):null;
    if(imported){event.preventDefault();onInsertTable(imported);return;}
    if(plain.includes("\t")&&plain.trim().split(/\r?\n/).length>=2){
     const table=tableFromRows(parseDelimitedRows(plain),true);
     event.preventDefault();onInsertTable(table);return;
    }
   }catch{/* Keep the clipboard text usable even if a table is malformed. */}
  }
  if(!html)return;
  const converted=richHtmlToMarkdown(html);if(!converted)return;
  event.preventDefault();const area=ref.current;if(!area)return;
  const start=area.selectionStart,end=area.selectionEnd;
  onChange(value.slice(0,start)+converted+value.slice(end));
  requestAnimationFrame(()=>{area.focus();area.setSelectionRange(start+converted.length,start+converted.length);});
 }
 return <div className="space-y-2"><div role="toolbar" aria-label={`${label} formatting`} className="flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-gray-50 p-2">{actions.map(action=><button key={action.label} type="button" disabled={disabled} onClick={()=>wrap(action.before,action.after,action.example)} className="rounded-lg border bg-white px-3 py-2 text-sm font-bold text-gray-800 disabled:opacity-50" title={`Format selected text: ${action.label}`}>{action.label}</button>)}{!heading&&<><button type="button" disabled={disabled} onClick={()=>line("- ")} className="rounded-lg border bg-white px-3 py-2 text-sm font-bold">• List</button><button type="button" disabled={disabled} onClick={()=>line("1. ")} className="rounded-lg border bg-white px-3 py-2 text-sm font-bold">1. List</button><button type="button" disabled={disabled} onClick={()=>setLinkOpen(open=>!open)} className="rounded-lg border bg-white px-3 py-2 text-sm font-bold" aria-expanded={linkOpen}>Link existing article</button></>}</div>{linkOpen&&<div className="rounded-lg border border-green-200 bg-green-50 p-3"><label className="block text-sm font-semibold">Search published articles<input className="mt-1 w-full rounded-lg border p-2" value={linkSearch} onChange={e=>setLinkSearch(e.target.value)} placeholder="Search an existing update"/></label>{linkStatus&&<p role="status">{linkStatus}</p>}<div className="mt-2 max-h-56 space-y-1 overflow-y-auto">{links.filter(item=>item.title.toLowerCase().includes(linkSearch.toLowerCase())).slice(0,12).map((item,i)=><button type="button" className="block w-full rounded-lg bg-white px-3 py-2 text-left text-sm text-green-900 hover:bg-green-100" key={item.permalink+"-"+i} disabled={disabled} onClick={()=>{wrap("[","]("+item.permalink+")",item.title);setLinkOpen(false);}}>{item.title}</button>)}</div></div>}<label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={plainOnly} disabled={disabled} onChange={e=>setPlainOnly(e.target.checked)}/>Paste as plain text</label><textarea ref={ref} aria-label={label} rows={heading?2:7} value={value} onPaste={paste} onChange={event=>onChange(event.target.value)} disabled={disabled} className="w-full min-w-0 rounded-xl border border-gray-300 bg-white px-3 py-3 text-base text-gray-950 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200" placeholder={heading?"Section heading":"Write your paragraph"}/><p className="text-xs text-gray-500">Paste formatted text directly or select text and use the toolbar. Bold, italic and links are preserved for the published article.</p></div>;
}
