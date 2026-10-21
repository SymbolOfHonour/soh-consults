"use client";
import {useEffect,useState} from 'react';
import type {QueuedStory} from '../../../lib/news-queue';
import type {TeamMember} from '../../../lib/editor-team';
import WriterArticleEditor from './WriterArticleEditor';
export default function WriterArticles({member,newArticle=false,onNavigationBlock}:{member:TeamMember;newArticle?:boolean;onNavigationBlock:(blocked:boolean)=>void}){const [stories,setStories]=useState<QueuedStory[]>([]),[selected,setSelected]=useState<QueuedStory|null|undefined>(newArticle?null:undefined),[query,setQuery]=useState(''),[message,setMessage]=useState('');
 async function load(){const r=await fetch('/api/admin/writer/articles');const d=await r.json();if(!r.ok)throw Error(d.error);setStories(d.stories);}
 useEffect(()=>{void load().catch(e=>setMessage(e.message));},[]);
 if(selected!==undefined)return <WriterArticleEditor key={selected?.id||'new'} member={member} article={selected} onNavigationBlock={onNavigationBlock} onClose={()=>{setSelected(undefined);void load().catch(e=>setMessage(e.message));}}/>;
 return <section className="space-y-4 rounded-2xl border bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><h2 className="text-2xl font-bold">All articles</h2><button onClick={()=>setSelected(null)} className="rounded-xl bg-green-800 px-4 py-2 font-bold text-white">+ New article</button><button onClick={()=>void load().catch(e=>setMessage(e.message))} className="rounded-xl border px-4 py-2">Refresh articles</button></div><p>Browse and edit the shared article library. Published articles stay live when you save changes.</p><input aria-label="Search articles" placeholder="Search title, school or status" value={query} onChange={e=>setQuery(e.target.value)} className="w-full rounded-xl border p-3"/>{message&&<p role="status">{message}</p>}<div className="divide-y">{stories.filter(s=>`${s.title} ${s.institution} ${s.status}`.toLowerCase().includes(query.toLowerCase())).map(s=><button key={s.id} onClick={()=>setSelected(s)} className="block w-full py-4 text-left"><strong>{s.title}</strong><p className="text-sm text-gray-600">{s.institution} · {s.status} · Open editor →</p></button>)}</div></section>;
}
