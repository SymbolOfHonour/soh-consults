"use client";

import { useMemo, useState } from "react";
import { admissionMatcherRequirements } from "../../lib/admission-matcher/data";
import { matchCandidate } from "../../lib/admission-matcher/match";

const programmes = [...new Set(admissionMatcherRequirements.flatMap((item) => [item.programme, ...(item.aliases ?? [])]))].sort();
const subjectOptions = [...new Set(admissionMatcherRequirements.flatMap((item) => [
  ...item.requiredUtmeSubjects,
  ...(item.utmeAlternatives ?? []).flat(),
  ...item.requiredOlevelCredits,
  ...(item.olevelAlternatives ?? []).flat(),
]).filter((subject) => !["english language", "use of english"].includes(subject.trim().toLowerCase())))].sort();
const olevelSubjectOptions = [...new Set(admissionMatcherRequirements.flatMap((item) => [
  ...item.requiredOlevelCredits,
  ...(item.olevelAlternatives ?? []).flat(),
]))].sort();

function SubjectPicker({ label, selected, onChange, hint, max, options = subjectOptions }: { label: string; selected: string[]; onChange: (next: string[]) => void; hint: string; max?: number; options?: string[] }) {
  return <fieldset><legend className="text-sm font-semibold text-slate-900">{label}</legend><p className="mt-1 text-xs text-slate-500">{hint}</p><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{options.map((subject) => {
    const checked = selected.includes(subject);
    const disabled = !checked && typeof max === "number" && selected.length >= max;
    return <label key={subject} className={`flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}><input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked ? [...selected, subject] : selected.filter((item) => item !== subject))} />{subject}</label>;
  })}</div></fieldset>;
}

export default function MatcherClient() {
  const [programme, setProgramme] = useState(programmes[0] ?? "");
  const [utmeScore, setUtmeScore] = useState("");
  const [utmeSubjects, setUtmeSubjects] = useState<string[]>([]);
  const [olevelCredits, setOlevelCredits] = useState<string[]>([]);
  const [olevelSittings, setOlevelSittings] = useState<1 | 2>(1);
  const [submitted, setSubmitted] = useState(false);

  const results = useMemo(() => {
    if (!submitted || !programme || !utmeScore) return [];
    return matchCandidate({ programme, utmeScore: Number(utmeScore), utmeSubjects, olevelCredits, olevelSittings }, admissionMatcherRequirements);
  }, [submitted, programme, utmeScore, utmeSubjects, olevelCredits, olevelSittings]);

  const resetSubmission = () => setSubmitted(false);

  return <div className="mt-8">
    <form className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
      <div><label className="text-sm font-semibold text-slate-900" htmlFor="programme">Course you want to study</label><select id="programme" value={programme} onChange={(event) => { setProgramme(event.target.value); resetSubmission(); }} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3">{programmes.map((item) => <option key={item}>{item}</option>)}</select></div>
      <div><label className="text-sm font-semibold text-slate-900" htmlFor="utmeScore">JAMB/UTME score</label><input id="utmeScore" type="number" min="0" max="400" required value={utmeScore} onChange={(event) => { setUtmeScore(event.target.value); resetSubmission(); }} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="e.g. 245" /></div>
      <SubjectPicker label="UTME subjects apart from Use of English" selected={utmeSubjects} onChange={(next) => { setUtmeSubjects(next); resetSubmission(); }} hint="Select exactly the three other subjects you sat for in UTME." max={3} />
      <div><label className="text-sm font-semibold text-slate-900" htmlFor="olevelSittings">O'Level sittings used</label><select id="olevelSittings" value={olevelSittings} onChange={(event) => { setOlevelSittings(Number(event.target.value) as 1 | 2); resetSubmission(); }} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"><option value={1}>One sitting</option><option value={2}>Two sittings</option></select></div>
      <SubjectPicker label="O'Level subjects where you have a credit (A1-C6)" selected={olevelCredits} onChange={(next) => { setOlevelCredits(next); resetSubmission(); }} hint="Select every relevant subject in which you have a credit pass across the sitting(s) selected above." options={olevelSubjectOptions} />
      <button type="submit" disabled={!programme || !utmeScore || utmeSubjects.length !== 3 || olevelCredits.length < 5} className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Check my options</button>
    </form>

    {submitted && <section className="mt-8" aria-live="polite"><div className="flex flex-wrap items-end justify-between gap-2"><div><h2 className="text-2xl font-bold text-slate-950">Your admission options</h2><p className="mt-1 text-sm text-slate-600">Compared only against programmes currently verified in this private Beta dataset.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{results.length} result{results.length === 1 ? "" : "s"}</span></div>
      {results.length === 0 ? <div className="mt-4 rounded-2xl border border-slate-200 p-5"><p className="font-semibold text-slate-900">No verified match is available for this course yet.</p><p className="mt-2 text-sm text-slate-600">That does not mean you are ineligible. It means this programme is not yet represented in the verified Beta dataset.</p></div> : results.map((result) => {
        const label = result.status === "match" ? "Requirements Matched" : result.status === "review" ? "Needs Review" : "Requirements Not Matched";
        const source = result.requirement.sources[0];
        return <article key={`${result.requirement.institutionId}-${result.requirement.programme}`} className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><p className="text-sm font-semibold text-emerald-700">{label}</p><h3 className="mt-1 text-xl font-bold text-slate-950">{result.requirement.institutionName}</h3><p className="mt-1 text-sm text-slate-600">{result.requirement.programme} · {source?.session}</p>
          {typeof result.requirement.minimumUtmeScore === "number" && <p className="mt-3 text-sm font-medium text-slate-700">Verified stored UTME minimum: {result.requirement.minimumUtmeScore}</p>}
          {result.passed.length > 0 && <div className="mt-4"><p className="font-semibold text-slate-900">Passed checks</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{result.passed.map((item) => <li key={item}>{item}</li>)}</ul></div>}
          {result.failed.length > 0 && <div className="mt-4"><p className="font-semibold text-slate-900">Why this did not fully match</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{result.failed.map((item) => <li key={item}>{item}</li>)}</ul></div>}
          {result.needsReview.length > 0 && <div className="mt-4"><p className="font-semibold text-slate-900">Needs verification</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{result.needsReview.map((item) => <li key={item}>{item}</li>)}</ul></div>}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4"><a href="/updates" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Latest Updates</a><a href="/deadlines" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Deadlines</a>{result.requirement.calculatorPath && <a href={result.requirement.calculatorPath} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Screening Calculator</a>}{source && <a href={source.url} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Official Source</a>}</div><div className="mt-3 text-xs text-slate-500">Last verified {source?.lastVerified}</div></article>;
      })}<p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">A match means the information you supplied satisfies the requirements currently stored for this Beta. It is not an admission offer or guarantee. Institutional requirements and admission decisions remain authoritative.</p></section>}
  </div>;
}
