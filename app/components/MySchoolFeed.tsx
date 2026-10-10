"use client";
import { useEffect, useMemo, useState } from "react";
import type { DiscoveryItem } from "../../lib/algorithm-phase2";
import { emptyPreferences, feedTopics, parseSchoolPreferences, schoolFeed, SCHOOL_PREFERENCES_KEY, type SchoolPreferences } from "../../lib/school-feed";
export default function MySchoolFeed({ items, schools }: { items: DiscoveryItem[]; schools: string[] }) {
  const [preferences, setPreferences] = useState<SchoolPreferences>(emptyPreferences);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [schoolQuery, setSchoolQuery] = useState("");
  const [limit, setLimit] = useState(12);
  useEffect(() => {
    try { setPreferences(parseSchoolPreferences(JSON.parse(localStorage.getItem(SCHOOL_PREFERENCES_KEY) || "null"), schools)); }
    catch { /* A blocked store or older preference must not prevent using the feed. */ }
    setReady(true);
  }, [schools]);
  function update(next: SchoolPreferences) {
    setPreferences(next); setLimit(12);
    try { localStorage.setItem(SCHOOL_PREFERENCES_KEY, JSON.stringify(next)); setMessage("Preferences saved on this device."); }
    catch { setMessage("Preferences apply now, but this browser cannot save them for your next visit."); }
  }
  function toggle(kind: "schools" | "topics", value: string) {
    const previous = preferences[kind];
    update({ ...preferences, [kind]: previous.includes(value) ? previous.filter(v => v !== value) : [...previous, value].slice(0, 5) });
  }
  const results = useMemo(() => schoolFeed(items, preferences), [items, preferences]);
  const chosen = preferences.schools.length + preferences.topics.length > 0;
  return <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
    <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="min-w-0 rounded-2xl border bg-white p-5">
        <h2 className="text-xl font-black">Make it yours</h2><p className="mt-2 text-sm leading-6 text-gray-600">Choose up to five schools and the topics you want. Choices stay on this device. No account needed.</p>
        <fieldset disabled={!ready} className="mt-5"><legend className="font-bold">My schools</legend><label htmlFor="school-filter" className="sr-only">Find a school</label><input id="school-filter" type="search" value={schoolQuery} onChange={e => setSchoolQuery(e.target.value)} placeholder="Find your school…" className="mt-3 min-h-12 w-full rounded-xl border px-3 text-base"/><div className="mt-3 max-h-64 space-y-1 overflow-y-auto">{schools.filter(school => school.toLocaleLowerCase().includes(schoolQuery.trim().toLocaleLowerCase())).map(school => <label key={school} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-green-50"><input type="checkbox" checked={preferences.schools.includes(school)} disabled={!preferences.schools.includes(school) && preferences.schools.length >= 5} onChange={() => toggle("schools", school)} className="h-5 w-5 shrink-0 accent-green-800"/><span className="break-words text-sm">{school}</span></label>)}</div></fieldset>
        <fieldset disabled={!ready} className="mt-5"><legend className="font-bold">My interests</legend>{feedTopics.map(topic => <label key={topic} className="flex min-h-11 items-center gap-3 py-2"><input type="checkbox" checked={preferences.topics.includes(topic)} onChange={() => toggle("topics", topic)} className="h-5 w-5 accent-green-800"/><span className="capitalize">{topic === "cgpa" ? "CGPA" : topic}</span></label>)}</fieldset>
        <button disabled={!ready} onClick={() => { update({ schools: [], topics: [] }); }} className="mt-4 min-h-11 rounded-xl border px-4 py-2 font-bold">Clear preferences</button><p role="status" className="mt-3 text-xs leading-5 text-gray-600">{message}</p>
      </aside>
      <div className="min-w-0">
        <div className="rounded-2xl bg-green-950 p-6 text-white"><h2 className="text-2xl font-black">Your school feed</h2><p className="mt-2 leading-6 text-green-100">{chosen ? "Relevant updates, current opportunities, national guides and useful calculators." : "Choose a school or interest to start your feed."}</p><p className="mt-3 text-xs text-green-200">Your Guide. Your Success.</p>{preferences.schools.length ? <p className="mt-3 break-words text-sm text-green-100">Following: {preferences.schools.join(", ")}</p> : null}</div>
        <p aria-live="polite" role="status" className="my-4 text-sm font-bold text-gray-600">{!ready ? "Loading your preferences…" : chosen ? `${results.length} matching items · Closed applications are excluded` : "You control what appears here."}</p>
        {ready && chosen && !results.length ? <div className="rounded-2xl border bg-white p-6"><h3 className="font-bold">No matching content yet</h3><p className="mt-2 text-gray-600">Try another interest or browse all updates.</p><a href="/updates" className="mt-4 inline-block py-2 font-bold text-green-800">Browse updates →</a></div> : null}
        <div className="grid gap-4 sm:grid-cols-2">{results.slice(0, limit).map(({ item }) => <article key={`${item.kind}-${item.id}`} className="min-w-0 rounded-2xl border bg-white p-5"><p className="text-xs font-bold uppercase text-green-700">{item.kind} {item.institution ? `· ${item.institution}` : ""}</p><h3 className="mt-3 break-words text-lg font-black leading-7"><a href={item.href} className="hover:underline">{item.title}</a></h3><p className="mt-3 text-sm leading-6 text-gray-600">{item.summary}</p><a href={item.href} className="mt-4 inline-block min-h-11 py-3 font-bold text-green-800">{item.kind === "calculator" ? "Open calculator" : "View details"} →</a></article>)}</div>
        {results.length > limit ? <button onClick={() => setLimit(value => value + 12)} className="mt-6 min-h-12 rounded-xl border bg-white px-5 py-3 font-bold">Show more</button> : null}
      </div>
    </div>
  </section>;
}
