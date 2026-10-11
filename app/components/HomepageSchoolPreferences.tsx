"use client";
import { useEffect, useState } from "react";
import { SCHOOL_PREFERENCES_KEY, feedTopics } from "../../lib/school-feed";

type Saved = { schools: string[]; topics: string[] };
const empty: Saved = { schools: [], topics: [] };
function readSaved(): Saved {
  try {
    const raw = JSON.parse(localStorage.getItem(SCHOOL_PREFERENCES_KEY) || "null");
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return empty;
    const clean = (values: unknown, max: number) => Array.isArray(values)
      ? [...new Set(values.filter((value): value is string => typeof value === "string" && value.length <= 160 && value.trim().length > 0))].slice(0, max)
      : [];
    return { schools: clean(raw.schools, 5), topics: clean(raw.topics, 5).filter(topic => (feedTopics as readonly string[]).includes(topic)) };
  } catch { return empty; }
}
export default function HomepageSchoolPreferences() {
  const [saved, setSaved] = useState<Saved>(empty);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const refresh = () => setSaved(readSaved());
    refresh();
    setReady(true);
    window.addEventListener("storage", refresh);
    window.addEventListener("pageshow", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("pageshow", refresh); };
  }, []);
  const selected = saved.schools.length > 0 || saved.topics.length > 0;
  return <section aria-label="My school preferences" className="border-b border-green-100 bg-green-50">
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-green-800">S.O.H CONSULTS · My School</p>
          <h2 className="mt-1 text-xl font-black text-green-950">{ready && selected ? "Welcome back! Your institution preferences" : "Your schools. Your next step."}</h2>
          <p className="mt-1 text-sm text-gray-600">{ready && selected ? "Your choices are saved on this device. Continue to your personalised school feed." : "Choose your preferred institutions and interests to get relevant updates. No account required."}</p>
          {ready && saved.schools.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{saved.schools.map(school => <span key={school} className="max-w-full break-words rounded-full border border-green-200 bg-white px-3 py-1.5 text-sm font-semibold text-green-950">{school}</span>)}</div>}
          {ready && saved.topics.length > 0 && <p className="mt-3 text-xs text-green-900">Interests: {saved.topics.join(", ")}</p>}
          <p className="mt-2 text-xs text-gray-500">Preferences stay in this browser and may disappear if its storage is cleared.</p>
        </div>
        <a href="/my-school" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-green-800 px-5 py-3 text-sm font-bold text-white hover:bg-green-900">{ready && selected ? "View / manage my preferences →" : "Create my school feed →"}</a>
      </div>
    </div>
  </section>;
}
