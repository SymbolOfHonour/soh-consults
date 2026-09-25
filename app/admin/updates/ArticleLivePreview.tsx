"use client";
import {useState} from "react";
import type {ArticleBlock} from "../../../lib/article-blocks";
import {writeArticleBlocks} from "../../../lib/article-blocks";
import StructuredArticle from "../../updates/[id]/StructuredArticle";
export default function ArticleLivePreview({blocks,title,summary,featured}:{blocks:ArticleBlock[];title:string;summary:string;featured?:string|null}){
 const [open,setOpen]=useState(true);
 const ready=blocks.filter(block=>(block.type==="paragraph"||block.type==="heading")?Boolean(block.text.trim()):block.type==="image"?Boolean(block.url.trim()):block.type==="gallery"?block.urls.length>0:true);
 return <section aria-label="Live article preview" className="overflow-hidden rounded-2xl border border-green-300 bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b bg-green-50 p-4"><div><h2 className="text-xl font-black text-green-950">Live article preview</h2><p className="text-sm text-gray-600">Updates as you type. Review formatting and links before saving or publishing.</p></div><button type="button" onClick={()=>setOpen(value=>!value)} aria-expanded={open} className="rounded-xl border border-green-700 bg-white px-4 py-2 font-bold text-green-800">{open?"Hide preview":"Show preview"}</button></div>{open&&<div className="mx-auto w-full max-w-6xl space-y-5 p-4 sm:p-8 xl:max-w-[1240px]"><h2 className="break-words text-3xl font-black">{title||"Article headline"}</h2>{summary&&<p className="break-words text-lg text-gray-600">{summary}</p>}{featured&&<img src={featured} alt="Featured image preview" className="max-h-96 w-full rounded-xl object-contain"/>}{ready.length?<StructuredArticle details={writeArticleBlocks("",ready)}/>:<p className="text-gray-500">Start writing article blocks to see the formatted preview.</p>}</div>}</section>;
}
