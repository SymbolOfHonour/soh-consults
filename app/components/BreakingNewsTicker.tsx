"use client";
import { useEffect, useState } from "react";
type Story = { title: string; href: string };
export default function BreakingNewsTicker({ stories }: { stories: Story[] }) {
  const [paused, setPaused] = useState(false);
  const [liveStories, setLiveStories] = useState(stories);
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const response = await fetch("/api/public/updates", { cache: "no-store" });
        if (!response.ok) return;
        const updates: {title:string;slug:string;publishedAt?:string;breaking?:boolean}[] = await response.json();
        const seen = new Set<string>();
        const fresh = updates.filter(item => {
          if (!item.slug || !item.title || seen.has(item.slug)) return false;
          seen.add(item.slug); return true;
        }).slice(0, 10).map(item => ({ title: item.title, href: `/updates/${item.slug}` }));
        if (active && fresh.length) setLiveStories(fresh);
      } catch { /* Retain previously loaded headlines on network failure. */ }
    };
    const timer = window.setInterval(refresh, 60000);
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { active = false; window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, []);
  if (!liveStories.length) return null;
  const links = liveStories.map((story, i) => <a key={i} href={story.href} className="inline-block shrink-0 px-6 font-bold hover:underline focus:underline">{story.title}</a>);
  return <div aria-label="Important breaking education updates" className="flex min-h-11 items-center overflow-hidden bg-[#f1e8c8] text-[#06452f]">
    <span className="z-10 flex min-h-11 shrink-0 items-center bg-[#06452f] px-4 text-xs font-black uppercase tracking-wider text-[#efc46e]">⚡ Breaking</span>
    <div className="relative min-w-0 flex-1 overflow-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
      {reduceMotion ? <div className="flex gap-2 overflow-x-auto whitespace-nowrap py-3 text-sm">{links}</div> :
      <div className="flex w-max whitespace-nowrap py-3 text-sm" style={{ animation: "soh-breaking-scroll 55s linear infinite", animationPlayState: paused ? "paused" : "running" }}>
        <span className="flex shrink-0 items-center">{links}</span><span className="flex shrink-0 items-center" aria-hidden="true">{liveStories.map((story,i) => <span key={i} className="inline-block px-6 font-bold">{story.title}</span>)}</span>
      </div>}
    </div>
    <style jsx>{`@keyframes soh-breaking-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
  </div>;
}
