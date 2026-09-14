"use client";

import { useState } from "react";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <a href={`https://wa.me/?text=${encodeURIComponent(`${title} | S.O.H CONSULTS ${url}`)}`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-green-700 px-5 py-3 text-sm font-black text-white">Share on WhatsApp</a>
      <button onClick={copyLink} className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-black text-gray-900">{copied ? "Link Copied ✓" : "Copy Link"}</button>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-black text-gray-900">Share on Facebook</a>
    </div>
  );
}
