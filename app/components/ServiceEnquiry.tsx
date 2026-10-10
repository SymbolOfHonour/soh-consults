"use client";
import { useId, useState } from "react";
import { enquiryServices, serviceEnquiryUrl } from "../../lib/service-enquiry";
export default function ServiceEnquiry({ school = "", context = "" }: { school?: string; context?: string }) {
  const id = useId();
  const [service, setService] = useState(enquiryServices[0]);
  const [institution, setInstitution] = useState(school);
  return <div className="min-w-0 rounded-2xl border border-green-200 bg-green-50 p-5 text-gray-900">
    <h2 className="text-xl font-black text-green-950">Get help from S.O.H CONSULTS</h2>
    <label htmlFor={`${id}-service`} className="mt-4 block text-sm font-bold">What do you need?</label>
    <select id={`${id}-service`} value={service} onChange={e => setService(e.target.value)} className="mt-2 min-h-12 w-full min-w-0 rounded-xl border bg-white px-3 text-base">{enquiryServices.map(value => <option key={value}>{value}</option>)}</select>
    <label htmlFor={`${id}-school`} className="mt-4 block text-sm font-bold">School or programme (optional)</label>
    <input id={`${id}-school`} value={institution} maxLength={180} onChange={e => setInstitution(e.target.value)} className="mt-2 min-h-12 w-full min-w-0 rounded-xl border bg-white px-3 text-base" placeholder="e.g. LASU Post-UTME"/>
    <a href={serviceEnquiryUrl(service, institution, context)} target="_blank" rel="noopener noreferrer" className="mt-5 block rounded-xl bg-green-800 px-4 py-3 text-center font-bold text-white">Continue on WhatsApp ↗</a>
    <p className="mt-3 text-xs leading-5 text-gray-600">Opens a message you can review and send. Request current pricing from us.</p>
  </div>;
}
