"use client";
import {useState} from 'react';
import type {ScreeningReport} from '@/lib/reports/screening-report';
export default function ScreeningReportDownloads({report,disabled=false}:{report:ScreeningReport;disabled?:boolean}) {
  const [busy,setBusy]=useState<'pdf'|'jpg'|null>(null);
  const [error,setError]=useState('');
  async function download(kind:'pdf'|'jpg') {
    if(disabled||busy)return;
    setBusy(kind);setError('');
    try{const {downloadScreeningReport}=await import('@/lib/reports/screening-report');await downloadScreeningReport(report,kind);}
    catch{setError('Unable to generate the report. Please try again.');}
    finally{setBusy(null);}
  }
  return <div className="mt-5"><div className="flex flex-wrap gap-3"><button type="button" disabled={disabled||!!busy} onClick={()=>download('pdf')} className="rounded-xl bg-green-700 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50">{busy==='pdf'?'Preparing PDF…':'📄 Download Report (PDF)'}</button><button type="button" disabled={disabled||!!busy} onClick={()=>download('jpg')} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50">{busy==='jpg'?'Preparing JPG…':'🖼️ Download Report (JPG)'}</button></div><p className="mt-2 text-xs text-slate-500">Download your complete screening report as a PDF or JPG image.{disabled?' Complete the required score and result inputs first.':''}</p>{error&&<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}</div>;
}
