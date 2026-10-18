"use client";
import {useState} from "react";
import type {TableBlock} from "../../../lib/article-tables";
import {MAX_TABLE_COLUMNS,MAX_TABLE_ROWS,parseDelimitedRows,tableFromRows,tableFromHtml} from "../../../lib/article-tables";
type Props={block:TableBlock;disabled:boolean;onChange:(next:TableBlock)=>void};
const field="w-full min-w-0 rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-950";
const btn="rounded-lg border border-green-300 bg-white px-2 py-2 text-sm font-semibold text-green-900 disabled:opacity-40";
function reorder<T>(values:T[],from:number,to:number):T[]{if(to<0||to>=values.length)return values;const copy=[...values];[copy[from],copy[to]]=[copy[to],copy[from]];return copy;}
export default function ArticleTableEditor({block,disabled,onChange}:Props){
 const [raw,setRaw]=useState("");
 const [firstRowHeader,setFirstRowHeader]=useState(true);
 const [message,setMessage]=useState("");
 function editRow(r:number,c:number,value:string){onChange({...block,rows:block.rows.map((row,i)=>i===r?row.map((v,j)=>j===c?value:v):row)});}
 function editHeading(c:number,value:string){onChange({...block,headers:block.headers.map((v,i)=>i===c?value:v)});}
 function addRow(){if(block.rows.length>=MAX_TABLE_ROWS)return;onChange({...block,rows:[...block.rows,block.headers.map(()=>"")]});}
 function moveRow(from:number,to:number){onChange({...block,rows:reorder(block.rows,from,to)});}
 function removeRow(index:number){onChange({...block,rows:block.rows.filter((_,i)=>i!==index)});}
 function addColumn(){if(block.headers.length>=MAX_TABLE_COLUMNS)return;onChange({...block,headers:[...block.headers,"Column "+(block.headers.length+1)],rows:block.rows.map(row=>[...row,""]),aligns:[...(block.aligns||block.headers.map(()=>"left" as const)),"left"],widths:[...(block.widths||block.headers.map(()=>0)),0]});}
 function removeColumn(c:number){if(block.headers.length<=1)return;onChange({...block,headers:block.headers.filter((_,i)=>i!==c),rows:block.rows.map(row=>row.filter((_,i)=>i!==c)),aligns:block.aligns?.filter((_,i)=>i!==c),widths:block.widths?.filter((_,i)=>i!==c)});}
 function moveColumn(from:number,to:number){onChange({...block,headers:reorder(block.headers,from,to),rows:block.rows.map(row=>reorder(row,from,to)),aligns:block.aligns?reorder(block.aligns,from,to):undefined,widths:block.widths?reorder(block.widths,from,to):undefined});}
 function alignColumn(c:number,alignment:"left"|"center"|"right"){onChange({...block,aligns:block.headers.map((_,i)=>i===c?alignment:block.aligns?.[i]||"left")});}
 function widthColumn(c:number,width:number){onChange({...block,widths:block.headers.map((_,i)=>i===c?width:block.widths?.[i]||0)});}
 function numberRows(){if(block.headers[0]?.trim().toLowerCase()==="s/n"){onChange({...block,rows:block.rows.map((r,i)=>r.map((v,c)=>c===0?String(i+1):v))});return;}if(block.headers.length>=MAX_TABLE_COLUMNS){setMessage("Remove a column before inserting serial numbers.");return;}onChange({...block,headers:["S/N",...block.headers],rows:block.rows.map((row,i)=>[String(i+1),...row]),aligns:["left",...(block.aligns||block.headers.map(()=>"left" as const))],widths:[80,...(block.widths||block.headers.map(()=>0))]});}
 function importData(text:string,html?:string){try{const converted=html?tableFromHtml(html):null;const imported=converted||tableFromRows(parseDelimitedRows(text),firstRowHeader);onChange({...imported,caption:block.caption||imported.caption});setMessage("Table imported. Review the columns before saving.");setRaw("");}catch(error){setMessage(error instanceof Error?error.message:"Unable to import this table.");}}
 async function importFile(file:File){if(file.size>512000){setMessage("Import a CSV or TSV file smaller than 500 KB.");return;}importData(await file.text());}
 return <section className="space-y-3" aria-label="Table editor">
  <label className="block text-sm font-semibold">Table caption (optional)
   <input className={field} disabled={disabled} value={block.caption||""} maxLength={250} onChange={e=>onChange({...block,caption:e.target.value})}/>
  </label>
  <p className="text-xs text-gray-600">Add website links inside cells as [Official website](https://school.edu.ng). Published tables scroll horizontally on small screens.</p>
  <div className="flex flex-wrap gap-2">
   <button type="button" className={btn} disabled={disabled||block.rows.length>=MAX_TABLE_ROWS} onClick={addRow}>+ Row</button>
   <button type="button" className={btn} disabled={disabled||block.headers.length>=MAX_TABLE_COLUMNS} onClick={addColumn}>+ Column</button>
   <button type="button" className={btn} disabled={disabled} onClick={numberRows}>Auto-number S/N</button>
  </div>
  <div className="max-w-full overflow-x-auto rounded-lg border border-gray-200" tabIndex={0} role="region" aria-label="Editable table">
   <table className="min-w-max w-full border-collapse text-sm">
    <thead className="bg-green-50"><tr>{block.headers.map((header,c)=><th scope="col" key={c} className="min-w-40 border-b border-r p-2 align-top">
     <input aria-label={"Column "+(c+1)+" heading"} className={field} disabled={disabled} maxLength={1000} value={header} onChange={e=>editHeading(c,e.target.value)}/>
     <div className="mt-2 flex flex-wrap items-center gap-1">
      <button type="button" className={btn} aria-label={"Move column "+(c+1)+" left"} disabled={disabled||c===0} onClick={()=>moveColumn(c,c-1)}>←</button>
      <button type="button" className={btn} aria-label={"Move column "+(c+1)+" right"} disabled={disabled||c===block.headers.length-1} onClick={()=>moveColumn(c,c+1)}>→</button>
      <button type="button" className={btn} aria-label={"Remove column "+(c+1)} disabled={disabled||block.headers.length===1} onClick={()=>removeColumn(c)}>×</button>
     </div>
     <select className={field} aria-label={"Column "+(c+1)+" alignment"} disabled={disabled} value={block.aligns?.[c]||"left"} onChange={e=>alignColumn(c,e.target.value as "left"|"center"|"right")}>
      <option value="left">Align left</option><option value="center">Align centre</option><option value="right">Align right</option>
     </select>
     <select className={field} aria-label={"Column "+(c+1)+" width"} disabled={disabled} value={block.widths?.[c]||0} onChange={e=>widthColumn(c,Number(e.target.value))}>
      <option value="0">Auto width</option><option value="80">80px</option><option value="120">120px</option><option value="220">220px</option><option value="320">320px</option><option value="440">440px</option>
     </select>
    </th>)}<th scope="col" className="border-b p-2">Rows</th></tr></thead>
    <tbody>{block.rows.map((row,r)=><tr key={r} className="even:bg-gray-50">{row.map((cell,c)=><td key={c} className="border-b border-r p-1 align-top">
     <textarea aria-label={"Row "+(r+1)+", column "+(c+1)} className={field} rows={2} maxLength={3000} disabled={disabled} value={cell} onChange={e=>editRow(r,c,e.target.value)}/>
    </td>)}<td className="border-b p-1"><div className="flex items-center gap-1">
     <button className={btn} type="button" aria-label={"Move row "+(r+1)+" up"} disabled={disabled||r===0} onClick={()=>moveRow(r,r-1)}>↑</button>
     <button className={btn} type="button" aria-label={"Move row "+(r+1)+" down"} disabled={disabled||r===block.rows.length-1} onClick={()=>moveRow(r,r+1)}>↓</button>
     <button className={btn} type="button" aria-label={"Remove row "+(r+1)} disabled={disabled} onClick={()=>removeRow(r)}>×</button>
    </div></td></tr>)}</tbody>
   </table>
  </div>
  <div className="space-y-2 rounded-lg border border-dashed border-green-300 p-3">
   <strong>Import a table from a spreadsheet or website</strong>
   <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={firstRowHeader} disabled={disabled} onChange={e=>setFirstRowHeader(e.target.checked)}/>First pasted row contains column headings</label>
   <textarea className={field} disabled={disabled} rows={3} value={raw} placeholder="Paste Excel/Google Sheets cells, CSV, TSV or an HTML table here" onChange={e=>setRaw(e.target.value)}
    onPaste={e=>{const html=e.clipboardData.getData("text/html");if(html.includes("<table")){e.preventDefault();importData(e.clipboardData.getData("text/plain"),html);}}}/>
   <div className="flex flex-wrap items-center gap-2">
    <button type="button" className={btn} disabled={disabled||!raw.trim()} onClick={()=>importData(raw)}>Import pasted rows</button>
    <label className="text-sm font-semibold">Or choose CSV/TSV file <input className="mt-1 block w-full text-xs" type="file" accept=".csv,.tsv,text/csv,text/tab-separated-values" disabled={disabled} onChange={e=>{const file=e.target.files?.[0];if(file)void importFile(file);e.target.value="";}}/></label>
   </div>
   {message&&<p role="status" className="text-sm text-green-800">{message}</p>}
  </div>
 </section>;
}
