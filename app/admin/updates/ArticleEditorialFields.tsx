"use client";
import type {SmartMeta} from "../../../lib/smart-operations";
export type EditorialFields=Pick<SmartMeta,"seoTitle"|"seoDescription"|"imageAlt"|"reviewAfter"|"correction">;
type Props={value:EditorialFields;onChange:(value:EditorialFields)=>void;disabled:boolean};
const field="mt-1 w-full min-w-0 rounded-lg border border-gray-300 bg-white p-3 text-base text-gray-950";
export default function ArticleEditorialFields({value,onChange,disabled}:Props){
 function change(key:keyof EditorialFields,text:string){onChange({...value,[key]:text});}
 return <details className="rounded-2xl border border-green-200 bg-white p-4 sm:p-6">
  <summary className="cursor-pointer text-lg font-black text-green-950">SEO, image accessibility and editorial review (optional)</summary>
  <p className="mt-2 text-sm text-gray-600">Leave SEO fields blank to use the article's existing headline and summary. Canonical URLs and permanent redirects continue to be generated automatically.</p>
  <div className="mt-4 grid gap-4 sm:grid-cols-2">
   <label className="block text-sm font-bold">Search-result title <span className="text-gray-500">({(value.seoTitle||"").length}/70)</span><input className={field} value={value.seoTitle||""} disabled={disabled} maxLength={70} onChange={e=>change("seoTitle",e.target.value)}/></label>
   <label className="block text-sm font-bold">Featured-image description <span className="text-gray-500">(alt text)</span><input className={field} value={value.imageAlt||""} disabled={disabled} maxLength={250} onChange={e=>change("imageAlt",e.target.value)}/></label>
   <label className="block text-sm font-bold sm:col-span-2">Search-result description <span className="text-gray-500">({(value.seoDescription||"").length}/160)</span><textarea className={field} rows={3} disabled={disabled} maxLength={160} value={value.seoDescription||""} onChange={e=>change("seoDescription",e.target.value)}/></label>
   <label className="block text-sm font-bold">Review article information on or after<input type="date" className={field} value={value.reviewAfter||""} disabled={disabled} onChange={e=>change("reviewAfter",e.target.value)}/></label>
   <label className="block text-sm font-bold sm:col-span-2">Published correction note (only if a correction is needed)<textarea className={field} rows={2} disabled={disabled} maxLength={2000} value={value.correction||""} onChange={e=>change("correction",e.target.value)}/></label>
   {value.reviewAfter&&new Date(value.reviewAfter+"T23:59:59").getTime()<Date.now()&&<p className="sm:col-span-2 text-amber-800">Review date has passed. Check that deadlines and school information are still current.</p>}
  </div>
 </details>;
}
