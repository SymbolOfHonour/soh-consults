"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { admissionMatcherRequirements } from "../../lib/admission-matcher/data";
import { canonicalSubject, coverage, discoverProgrammes, discoverSubjects, discoverUtmeSubjects, isEnglish, normalise } from "../../lib/admission-matcher/catalogue";
import { matchCandidate, validateCandidate } from "../../lib/admission-matcher/match";
import type { CandidateProfile, MatchStatus, ProgrammeRequirement } from "../../lib/admission-matcher/types";

const programmes = discoverProgrammes(admissionMatcherRequirements);
const suggestions = [...new Set(admissionMatcherRequirements.flatMap(r => [r.programme, ...(r.aliases ?? [])]))].sort();
const subjectOptions = discoverSubjects(admissionMatcherRequirements);
const utmeOptions = discoverUtmeSubjects(admissionMatcherRequirements);
const scope = coverage(admissionMatcherRequirements);
const institutions = [...new Map(admissionMatcherRequirements.map(r => [r.institutionId, r.institutionName])).entries()].sort((a,b) => a[1].localeCompare(b[1]));
const fieldClass = "mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-950";
const statusLabels: Record<MatchStatus,string> = {match:"Requirements Matched",review:"Needs Review",not_match:"Requirements Not Matched"};
const statusStyles: Record<MatchStatus,string> = {match:"bg-emerald-50 text-emerald-900",review:"bg-amber-50 text-amber-950",not_match:"bg-rose-50 text-rose-900"};
const PAGE_SIZE = 10;
type NationalCatalogue = { programmes: string[]; institutions: {id:string;name:string}[]; observedAt:string; stats:{institutions:number;sourceOfferings:number;presentationPairs:number;programmeLabels:number} };

function SubjectPicker({kind, selected, onChange, max}: {kind:"utme"|"olevel";selected:string[];onChange:(next:string[])=>void;max?:number}) {
  const [search,setSearch] = useState("");
  const options = (kind === "utme" ? utmeOptions : subjectOptions).filter(s => (kind !== "utme" || !isEnglish(s)) && normalise(s).includes(normalise(canonicalSubject(search))));
  const label = kind === "utme" ? "UTME subjects apart from Use of English" : "O'Level credit subjects (A1 to C6)";
  return <fieldset className="min-w-0"><legend className="text-sm font-semibold text-slate-900">{label}</legend>
    <p className="mt-1 text-sm text-slate-600">{kind === "utme" ? `Select exactly three subjects. ${selected.length} of 3 selected. Use of English is implicit.` : `${selected.length} credits selected. Select all subjects in which you have a credit.`}</p>
    <label htmlFor={`${kind}-search`} className="sr-only">Search {kind === "utme" ? "UTME" : "O'Level"} subjects</label><input id={`${kind}-search`} className={fieldClass} type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subjects, e.g. Accounting" />
    {!!selected.length && <div className="mt-3 flex flex-wrap gap-2" aria-label={`Selected ${kind} subjects`}>{selected.map(s => <button type="button" key={s} onClick={()=>onChange(selected.filter(v=>v!==s))} aria-label={`Remove ${s} from ${kind}`} className="min-h-11 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-950">{s} ×</button>)}</div>}
    <div className="mt-3 grid max-h-64 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-slate-200 p-2 sm:grid-cols-2" aria-label={`${label} options`}>{options.map(s => {
      const checked = selected.includes(s), disabled = !checked && !!max && selected.length >= max;
      return <label key={s} className={`flex min-h-11 items-center gap-3 rounded-lg border px-3 py-2 text-sm ${checked ? "border-emerald-700 bg-emerald-50 text-emerald-950" : "border-slate-200 text-slate-800"} ${disabled ? "opacity-50" : "cursor-pointer"}`}><input type="checkbox" aria-label={`${kind === "utme" ? "UTME" : "O'Level"} ${s}`} checked={checked} disabled={disabled} onChange={e=>onChange(e.target.checked ? [...selected,s] : selected.filter(v=>v!==s))}/><span className="break-words">{s}</span></label>;
    })}{!options.length && <p className="p-2 text-sm text-slate-600">No subject with that name. Try its official name.</p>}</div>
  </fieldset>;
}
export default function MatcherClient() {
  const [nationalCatalogue,setNationalCatalogue] = useState<NationalCatalogue|null>(null);
  const [nationalRows,setNationalRows] = useState<ProgrammeRequirement[]>([]);
  const [loading,setLoading] = useState(false);
  const [institutionSearch,setInstitutionSearch] = useState("");
  const requestSequence = useRef(0);
  useEffect(()=>{let active=true;fetch("/api/public/admission-matcher", {signal: AbortSignal.timeout(15000)}).then(response=>{if(!response.ok)throw new Error("Catalogue unavailable");return response.json();}).then(data=>{if(active)setNationalCatalogue(data);}).catch(()=>{});return()=>{active=false;};},[]);
  const visibleSuggestions = useMemo(()=>{const names=new Map<string,string>();for(const name of [...suggestions,...(nationalCatalogue?.programmes??[])])if(!names.has(normalise(name)))names.set(normalise(name),name);return [...names.values()].sort((a,b)=>a.localeCompare(b));},[nationalCatalogue]);
  const selectableInstitutions = useMemo(()=>{const names=new Map<string,[string,string]>(institutions.map(item=>[normalise(item[1]),item]));for(const institution of nationalCatalogue?.institutions??[])if(!names.has(normalise(institution.name)))names.set(normalise(institution.name),[institution.id,institution.name]);return [...names.values()].sort((a,b)=>a[1].localeCompare(b[1]));},[nationalCatalogue]);
  const [programme,setProgramme] = useState("");
  const [utmeScore,setUtmeScore] = useState("");
  const [utmeSubjects,setUtmeSubjects] = useState<string[]>([]);
  const [olevelCredits,setOlevelCredits] = useState<string[]>([]);
  const [sittings,setSittings] = useState("");
  const [firstChoiceInstitution,setFirstChoiceInstitution] = useState("");
  const [certificateType,setCertificateType] = useState<"SSCE"|"NBC">("SSCE");
  const [profile,setProfile] = useState<CandidateProfile|null>(null);
  const [errors,setErrors] = useState<string[]>([]);
  const [filter,setFilter] = useState<"all"|MatchStatus>("all");
  const [search,setSearch] = useState("");
  const [page,setPage] = useState(1);
  const results = useMemo(()=>profile ? matchCandidate(profile,[...admissionMatcherRequirements,...nationalRows]) : [],[profile,nationalRows]);
  const filtered = results.filter(r => (filter === "all" || r.status === filter) && normalise(r.requirement.institutionName).includes(normalise(search)));
  const pageCount = Math.max(1,Math.ceil(filtered.length / PAGE_SIZE));
  const reset = () => {requestSequence.current++;setLoading(false);setProfile(null);setErrors([]);setPage(1);};
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const candidate: CandidateProfile={programme,utmeScore:utmeScore.trim()?Number(utmeScore):NaN,utmeSubjects,olevelCredits,sittings:sittings?Number(sittings) as 1|2:undefined,firstChoiceInstitution,certificateType};
    const issues=validateCandidate(candidate);if(!sittings)issues.push("Choose your O'Level sitting count.");setErrors(issues);if(issues.length)return;
    const sequence=++requestSequence.current;setLoading(true);setProfile(null);
    try {
      const response=await fetch(`/api/public/admission-matcher?programme=${encodeURIComponent(programme)}`, {signal: AbortSignal.timeout(15000)});
      if(!response.ok)throw new Error("Catalogue unavailable");
      const data=await response.json();if(!Array.isArray(data.requirements))throw new Error("Invalid catalogue response");
      if(sequence!==requestSequence.current)return;
      setNationalRows(data.requirements);setProfile(candidate);setFilter("all");setSearch("");setPage(1);
    } catch {if(sequence===requestSequence.current)setErrors(["The national catalogue could not load. Please try again; incomplete results have not been shown."]);}
    finally {if(sequence===requestSequence.current)setLoading(false);}
  };
  return <div className="mt-8 min-w-0">
    <div className="mb-6 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700"><strong>Dataset coverage:</strong> {scope.programmes} named programmes and {scope.institutions} institutions across {scope.records} records. {scope.verifiedRecords} fully verified matching records cover {scope.verifiedProgrammes} programmes at {scope.verifiedInstitutions} institution. Other records remain under review. {nationalCatalogue ? <>The JAMB catalogue captured on {nationalCatalogue.observedAt} adds {nationalCatalogue.stats.institutions} degree-awarding institutions and {nationalCatalogue.stats.sourceOfferings} official programme listings. These new entries remain Needs Review until their requirements and institutional exceptions are fully reconciled. A listing never becomes an automatic eligibility decision.</> : <>The national catalogue is loading. Complete programme results are checked when you submit.</>}</div>
    <form className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" onSubmit={submit}>
      <div><label htmlFor="programme" className="text-sm font-semibold text-slate-900">Desired course/programme</label><input id="programme" className={fieldClass} list="programme-options" required value={programme} onChange={e=>{setProgramme(e.target.value);reset();}} placeholder="Search a course, e.g. Accounting" autoComplete="off"/><datalist id="programme-options">{visibleSuggestions.map(name=><option key={name} value={name}/>)}</datalist><p className="mt-1 text-xs text-slate-600">{nationalCatalogue ? nationalCatalogue.stats.programmeLabels : programmes.length} JAMB programme labels, alongside existing verified profiles. Programme aliases such as Accountancy are accepted. An unsupported course will be shown honestly.</p></div>
      <div className="grid gap-5 sm:grid-cols-2"><div><label className="text-sm font-semibold text-slate-900" htmlFor="utmeScore">JAMB/UTME score</label><input id="utmeScore" type="number" min="0" max="400" step="1" required value={utmeScore} onChange={e=>{setUtmeScore(e.target.value);reset();}} className={fieldClass} placeholder="e.g. 245"/></div><div><label htmlFor="sittings" className="text-sm font-semibold text-slate-900">O&apos;Level sittings</label><select id="sittings" required value={sittings} onChange={e=>{setSittings(e.target.value);reset();}} className={fieldClass}><option value="">Choose sittings</option><option value="1">One sitting</option><option value="2">Two sittings</option></select></div></div>
      <SubjectPicker kind="utme" selected={utmeSubjects} onChange={v=>{setUtmeSubjects(v);reset();}} max={3}/>
      <SubjectPicker kind="olevel" selected={olevelCredits} onChange={v=>{setOlevelCredits(v);reset();}}/>
      <div><label htmlFor="first-choice" className="text-sm font-semibold text-slate-900">First-choice institution (optional)</label><label htmlFor="first-choice-search" className="sr-only">Search first-choice institutions</label><input id="first-choice-search" type="search" className={fieldClass} placeholder="Search institution name" value={institutionSearch} onChange={e=>setInstitutionSearch(e.target.value)}/><select id="first-choice" className={fieldClass} value={firstChoiceInstitution} onChange={e=>{setFirstChoiceInstitution(e.target.value);reset();}}><option value="">Not supplied / another institution</option>{selectableInstitutions.filter(([id,name])=>id===firstChoiceInstitution||normalise(name).includes(normalise(institutionSearch))).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select><p className="mt-1 text-xs text-slate-600">Required for a confirmed match where an official screening notice requires first choice.</p></div>
      <div><label htmlFor="certificate" className="text-sm font-semibold text-slate-900">Certificate category</label><select id="certificate" className={fieldClass} value={certificateType} onChange={e=>{setCertificateType(e.target.value as "SSCE"|"NBC");reset();}}><option value="SSCE">SSCE / GCE / NECO equivalent</option><option value="NBC">NBC (requires certificate-specific review)</option></select><p className="mt-1 text-xs text-slate-600">This tool checks UTME entry. Direct Entry, pass-grade waivers and other certificate exceptions need separate review.</p></div>
      {!!errors.length && <ul role="alert" className="list-disc rounded-xl bg-rose-50 p-4 pl-8 text-sm text-rose-900">{errors.map(error=><li key={error}>{error}</li>)}</ul>}
      <button type="submit" disabled={utmeSubjects.length !== 3 || loading} className="min-h-12 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{loading?"Checking options…":"Check my options"}</button>
    </form>
    {profile && <section className="mt-8" aria-label="Admission results" aria-live="polite"><h2 className="text-2xl font-bold text-slate-950">Your admission options</h2><p className="mt-2 text-sm text-slate-600">{results.length} records for {profile.programme}. Matched results appear first, followed by review and non-matches.</p>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">{(["match","review","not_match"] as MatchStatus[]).map(status=><span key={status} className={`rounded-lg px-3 py-2 ${statusStyles[status]}`}>{statusLabels[status]}: {results.filter(r=>r.status===status).length}</span>)}</div>
      {!!results.length && <div className="my-5 grid gap-4 sm:grid-cols-2"><div><label htmlFor="result-filter" className="text-sm font-semibold">Filter status</label><select id="result-filter" className={fieldClass} value={filter} onChange={e=>{setFilter(e.target.value as typeof filter);setPage(1);}}><option value="all">All results</option>{Object.entries(statusLabels).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></div><div><label htmlFor="institution-search" className="text-sm font-semibold">Search institutions</label><input id="institution-search" type="search" className={fieldClass} value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Institution name"/></div></div>}
      {!results.length ? <div className="mt-4 rounded-xl border p-5"><p className="font-semibold">No supported record for this programme yet.</p><p className="mt-2 text-sm text-slate-600">This does not mean you are ineligible. We have insufficient registered requirements to assess this course. Try the official programme name or check JAMB IBASS and the institution.</p></div> : !filtered.length ? <p className="p-4 text-slate-600">No results meet these filters. Change the filter to see other records.</p> : filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE).map(result=>{
        const r=result.requirement;
        return <article key={`${r.institutionId}-${r.programme}`} className="mt-4 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"><span className={`inline-block rounded-lg px-3 py-2 text-sm font-semibold ${statusStyles[result.status]}`}>{statusLabels[result.status]}</span><h3 className="mt-3 break-words text-xl font-bold text-slate-950">{r.institutionName}</h3><p className="mt-1 break-words text-sm text-slate-600">{r.programme} · {r.institutionType === "other" ? "degree-awarding institution" : r.institutionType?.replaceAll("-"," ")}</p><p className="mt-3 text-sm font-medium text-slate-800">{r.minimumUtmeScore !== undefined ? `${r.minimumUtmeScore} UTME minimum (${r.scoreScope === "institution-screening" ? "institution screening floor" : "programme screening"})` : "Current institutional screening score: unknown"}</p>
          {([['Passed checks',result.passed],['Failed checks',result.failed],['Needs verification',result.needsReview]] as [string,string[]][]).map(([label,items])=>!!items.length && <div className="mt-4" key={label}><p className="font-semibold text-slate-900">{label}</p><ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">{items.map(item=><li className="break-words" key={item}>{item}</li>)}</ul></div>)}
          <details className="mt-4 text-sm"><summary className="min-h-11 cursor-pointer py-3 font-semibold text-slate-800">Official sources and limitations</summary><ul className="space-y-3">{r.sources.map(s=><li key={s.url} className="break-words"><a className="inline-block min-h-11 py-2 font-medium text-emerald-800 underline" href={s.url} target="_blank" rel="noopener noreferrer">{s.label} ↗</a><p className="text-xs leading-5 text-slate-600">Session: {s.session} · Last checked: {s.lastVerified}{s.scope ? ` · ${s.scope}` : ""}{s.locator ? ` · ${s.locator}` : ""}</p></li>)}</ul>{!!r.notes?.length && <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">{r.notes.map(note=><li key={note}>{note}</li>)}</ul>}</details>
          <div className="mt-4 flex flex-wrap gap-2 border-t pt-4"><a href="/updates" className="min-h-11 rounded-lg border px-3 py-2 text-sm font-semibold">Latest Updates</a><a href="/deadlines" className="min-h-11 rounded-lg border px-3 py-2 text-sm font-semibold">Deadlines</a>{r.calculatorPath && <a href={r.calculatorPath} className="min-h-11 rounded-lg border px-3 py-2 text-sm font-semibold">Screening Calculator</a>}</div>
        </article>;
      })}
      {!!filtered.length && <nav className="mt-5 flex flex-wrap items-center justify-between gap-3" aria-label="Result pages"><button type="button" disabled={page===1} onClick={()=>setPage(p=>p-1)} className="min-h-11 rounded-lg border px-4 py-2 disabled:opacity-40">Previous</button><p className="text-sm text-slate-600">Page {page} of {pageCount} · {filtered.length} results</p><button type="button" disabled={page===pageCount} onClick={()=>setPage(p=>p+1)} className="min-h-11 rounded-lg border px-4 py-2 disabled:opacity-40">Next</button></nav>}
      <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">Matching stored basic requirements does not guarantee admission. Missing information needs review, never automatic eligibility. Current JAMB and institutional requirements, administrative checks and admission decisions remain authoritative.</p>
    </section>}
  </div>;
}
