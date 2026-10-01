"use client";

import { useMemo, useState } from "react";
import { admissionMatcherRequirements } from "../../lib/admission-matcher/data/fuoye-2026";
import { matchCandidate } from "../../lib/admission-matcher/match";

const programmes = [...new Set(admissionMatcherRequirements.map((item) => item.programme))].sort();
const splitSubjects = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

export default function MatcherClient() {
  const [programme, setProgramme] = useState(programmes[0] ?? "");
  const [utmeScore, setUtmeScore] = useState("");
  const [utmeSubjects, setUtmeSubjects] = useState("");
  const [olevelCredits, setOlevelCredits] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const results = useMemo(() => {
    if (!submitted || !programme || !utmeScore) return [];
    return matchCandidate({
      programme,
      utmeScore: Number(utmeScore),
      utmeSubjects: splitSubjects(utmeSubjects),
      olevelCredits: splitSubjects(olevelCredits),
    }, admissionMatcherRequirements);
  }, [submitted, programme, utmeScore, utmeSubjects, olevelCredits]);

  return (
    <div className="mt-8">
      <form className="grid gap-5 rounded-2xl border border-slate-200 p-5 sm:p-6" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
        <div>
          <label className="text-sm font-semibold text-slate-900" htmlFor="programme">Programme</label>
          <select id="programme" value={programme} onChange={(event) => { setProgramme(event.target.value); setSubmitted(false); }} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
            {programmes.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-900" htmlFor="utmeScore">JAMB/UTME score</label>
          <input id="utmeScore" type="number" min="0" max="400" required value={utmeScore} onChange={(event) => { setUtmeScore(event.target.value); setSubmitted(false); }} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="e.g. 245" />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-900" htmlFor="utmeSubjects">UTME subjects apart from English</label>
          <input id="utmeSubjects" required value={utmeSubjects} onChange={(event) => { setUtmeSubjects(event.target.value); setSubmitted(false); }} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Physics, Chemistry, Biology" />
          <p className="mt-1 text-xs text-slate-500">Separate subjects with commas. Use of English is treated as compulsory by JAMB and does not need to be entered here.</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-900" htmlFor="olevelCredits">O'Level subjects with credit (A1-C6)</label>
          <input id="olevelCredits" required value={olevelCredits} onChange={(event) => { setOlevelCredits(event.target.value); setSubmitted(false); }} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="English Language, Mathematics, Biology, Physics, Chemistry" />
          <p className="mt-1 text-xs text-slate-500">Enter only subjects in which you have a credit pass.</p>
        </div>
        <button type="submit" className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800">Check my options</button>
      </form>

      {submitted && (
        <section className="mt-8" aria-live="polite">
          <h2 className="text-2xl font-bold text-slate-950">Your Beta result</h2>
          {results.length === 0 ? <p className="mt-3 text-slate-600">This programme is not yet supported in the verified Beta dataset.</p> : results.map((result) => {
            const label = result.status === "match" ? "Basic requirements matched" : result.status === "review" ? "Manual review needed" : "Requirements not matched";
            return (
              <article key={`${result.requirement.institutionId}-${result.requirement.programme}`} className="mt-4 rounded-2xl border border-slate-200 p-5 sm:p-6">
                <p className="text-sm font-semibold text-emerald-700">{label}</p>
                <h3 className="mt-1 text-xl font-bold text-slate-950">{result.requirement.institutionName}</h3>
                <p className="mt-1 text-sm text-slate-600">{result.requirement.programme} · {result.requirement.sources[0]?.session}</p>
                {result.passed.length > 0 && <div className="mt-4"><p className="font-semibold text-slate-900">Passed checks</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{result.passed.map((item) => <li key={item}>{item}</li>)}</ul></div>}
                {result.failed.length > 0 && <div className="mt-4"><p className="font-semibold text-slate-900">Needs attention</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{result.failed.map((item) => <li key={item}>{item}</li>)}</ul></div>}
                <div className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">Source: {result.requirement.sources[0]?.label} · Last verified {result.requirement.sources[0]?.lastVerified}</div>
              </article>
            );
          })}
          <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">A match means the details you supplied satisfy the requirements currently stored for this Beta. It is not an admission offer or guarantee. Always confirm current requirements before applying.</p>
        </section>
      )}
    </div>
  );
}
