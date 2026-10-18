import type {ArticleBlock} from "./article-blocks";

export type TableBlock=Extract<ArticleBlock,{type:"table"}>;
export const MAX_TABLE_COLUMNS=20;
export const MAX_TABLE_ROWS=300;
export function safeTableLink(value:string):boolean {
 try { const url=new URL(value);return url.protocol==="https:" && !!url.hostname && !url.username && !url.password && !/\s/.test(value); }
 catch {return false;}
}
/** Parse spreadsheet TSV and quoted CSV, including commas/newlines within quoted values. */
export function parseDelimitedRows(text:string,delimiter?:"\t"|","):string[][] {
 const sep=delimiter||(text.includes("\t")?"\t":",");
 const rows:string[][]=[];let row:string[]=[];let cell="";let quoted=false;
 for(let i=0;i<text.length;i++){
  const ch=text[i];
  if(ch==='"'){
   if(quoted && text[i+1]==='"'){cell+='"';i++;}
   else if(!cell || quoted)quoted=!quoted;
   else cell+=ch;
  }else if(ch===sep && !quoted){row.push(cell);cell="";}
  else if((ch==="\n"||ch==="\r")&&!quoted){
   if(ch==="\r"&&text[i+1]==="\n")i++;
   row.push(cell);if(row.some(value=>value.trim()))rows.push(row);
   if(rows.length>MAX_TABLE_ROWS+1)throw Error("Table exceeds 300 data rows.");
   row=[];cell="";
  }else cell+=ch;
 }
 if(quoted)throw Error("CSV contains an unclosed quoted value.");
 row.push(cell);if(row.some(value=>value.trim()))rows.push(row);
 if(rows.some(values=>values.length>MAX_TABLE_COLUMNS))throw Error("Tables support a maximum of 20 columns.");
 return rows;
}
export function tableFromRows(rows:string[][],firstRowHeaders=true):TableBlock {
 if(!rows.length)throw Error("Paste a spreadsheet containing at least one row.");
 const width=Math.max(...rows.map(row=>row.length));
 if(width<1||width>MAX_TABLE_COLUMNS)throw Error("Tables require between 1 and 20 columns.");
 const headings=firstRowHeaders?rows[0]:Array.from({length:width},(_,i)=>"Column "+(i+1));
 const body=firstRowHeaders?rows.slice(1):rows;
 if(body.length>MAX_TABLE_ROWS)throw Error("Tables support a maximum of 300 data rows.");
 if(headings.some(cell=>cell.length>1000))throw Error("Table headings support a maximum of 1000 characters.");
 if(body.some(row=>row.some(cell=>cell.length>3000)))throw Error("Table cells support a maximum of 3000 characters.");
 return {type:"table",headers:Array.from({length:width},(_,i)=>headings[i]||"Column "+(i+1)),rows:body.map(row=>Array.from({length:width},(_,i)=>row[i]||""))};
}
/** Runs only in the browser. DOM text is extracted, never inserted as raw HTML. */
export function tableFromHtml(html:string):TableBlock|null {
 if(typeof DOMParser==="undefined")return null;
 const doc=new DOMParser().parseFromString(html,"text/html");
 doc.querySelectorAll("script,style,iframe,object,embed").forEach(node=>node.remove());
 const table=doc.querySelector("table");if(!table)return null;
 function cellText(node:Node):string {
  if(node.nodeType===3)return node.textContent||"";
  if(node.nodeType!==1)return "";
  const element=node as Element;
  if(element.tagName==="BR")return "\n";
  const inner=Array.from(element.childNodes).map(cellText).join("");
  if(element.tagName==="A"){
   const href=element.getAttribute("href")||"";
   if(safeTableLink(href))return "["+inner.replace(/[\[\]]/g,"")+"]("+href.replace(/\(/g,"%28").replace(/\)/g,"%29")+")";
  }
  return inner+(["P","DIV"].includes(element.tagName)?"\n":"");
 }
 const tableRows=Array.from(table.querySelectorAll("tr")).filter(row=>row.closest("table")===table);
 const rows=tableRows.map(row=>Array.from(row.children).filter(cell=>cell.tagName==="TH"||cell.tagName==="TD").map(cell=>cellText(cell).trim())).filter(row=>row.length);
 if(!rows.length)return null;
 const hasHeaders=Boolean(tableRows[0]&&Array.from(tableRows[0].children).some(cell=>cell.tagName==="TH"));
 return tableFromRows(rows,hasHeaders);
}
