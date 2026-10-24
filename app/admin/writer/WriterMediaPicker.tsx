"use client";
import {useEffect,useRef} from 'react';
import type {MediaKind,ReusableMedia} from '../../../lib/reusable-media';
import WriterMedia from './WriterMedia';
export default function WriterMediaPicker({kind,onSelect,onClose}:{kind:MediaKind;onSelect:(file:ReusableMedia)=>void;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const dialog=ref.current,previous=document.activeElement instanceof HTMLElement?document.activeElement:null;dialog?.showModal();return()=>{dialog?.close();if(previous?.isConnected)previous.focus();};},[]);
 return <dialog ref={ref} aria-labelledby="writer-media-picker-title" onCancel={e=>{e.preventDefault();onClose();}} className="max-h-[88dvh] w-[94vw] max-w-5xl overflow-y-auto rounded-2xl border p-4 text-gray-950 shadow-2xl backdrop:bg-black/50 sm:p-6"><div className="mb-4 flex items-start justify-between gap-4"><div><h2 id="writer-media-picker-title" className="text-2xl font-bold">Choose an existing {kind==='image'?'picture':kind}</h2><p className="mt-1 text-sm text-gray-600">Your article stays open while you choose.</p></div><button type="button" onClick={onClose} aria-label="Close media library" className="min-h-11 min-w-11 rounded-lg border px-3 text-xl">×</button></div><WriterMedia key={kind} kind={kind} onSelect={onSelect}/></dialog>;
}
