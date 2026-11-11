"use client";
import ScreeningReportDownloads from '../components/ScreeningReportDownloads';


import { useMemo, useRef, useState } from 'react';
import PublicPageLink from '../components/PublicPageLink';
import LasuStyleOLevel, { type OLevelResultEntry } from '../components/LasuStyleOLevel';
import { FUSTECH_SITTING_NOTICE, calculate, gradePoints, jambSubjects, programmes, sources, subjects } from '@/lib/fustech/calculate';

const field = 'mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900';
const card = 'rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7';

export default function FustechCalculator() {
  const [candidate, setCandidate] = useState('');
  const [course, setCourse] = useState('');
  const [score, setScore] = useState('');
  const [electives, setElectives] = useState(['', '', '']);
  const [results, setResults] = useState<OLevelResultEntry[]>([]);
  const sittings = 1 as const;
  const [board, setBoard] = useState('WAEC');
  const [checked, setChecked] = useState(false);
  const resultRef = useRef<HTMLElement>(null);
  function checkEligibility() {
    setChecked(true);
    requestAnimationFrame(() => {
      const result = resultRef.current;
      if (!result) return;
      result.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'start'});
      result.focus({preventScroll:true});
    });
  }
  const [resetKey, setResetKey] = useState(0);
  const programme = programmes.find(p => p.code === course);
  const activeResults = useMemo(() => results.filter(row => row.sitting === 1), [results]);
  const calculation = useMemo(() => programme ? calculate(programme, score, activeResults, electives) : null, [programme, score, activeResults, electives]);
  const missingCompulsoryCredits = programme?.oLevelSlots
    .filter(slot => slot.length === 1).map(slot => slot[0])
    .filter(subject => !activeResults.some(row => row.subject === subject && gradePoints[row.grade] > 0)) || [];
  const notes = [
    ...(!programme ? ['Select your programme.'] : []),
    ...(programme && !calculation?.scoreValid ? ['Enter a valid UTME score between 0 and 400.'] : []),
    ...(calculation?.scoreValid && !calculation.minimumMet ? ['FUSTECH’s published minimum UTME score is 185.'] : []),
    ...(programme && !calculation?.subjectsMet ? ['Your three UTME subjects must match the programme’s published combination, in addition to Use of English.'] : []),
    ...(programme && !calculation?.creditsMet ? ['Enter credit grades (A1–C6) in all five relevant O’Level subjects, including English Language and Mathematics.' + (missingCompulsoryCredits.length ? ' Missing compulsory credits: ' + missingCompulsoryCredits.join(', ') + '.' : '')] : []),
  ];
  function reset() {
    setCandidate(''); setCourse(''); setScore(''); setElectives(['', '', '']); setResults([]); setBoard('WAEC'); setChecked(false); setResetKey(key => key + 1);
  }
  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl">
    <header className="rounded-3xl bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 p-6 text-white shadow-lg sm:p-8">
      <nav className="mb-6 flex gap-3 text-xs font-bold"><PublicPageLink href="/" className="rounded-full bg-white px-4 py-2 !text-green-800">Home</PublicPageLink><PublicPageLink href="/screening-calculator" className="rounded-full border border-white/40 px-4 py-2">All calculators</PublicPageLink></nav>
      <p className="text-xs font-bold uppercase tracking-widest text-green-100">S.O.H CONSULTS · 2026/2027</p>
      <h1 className="mt-3 text-3xl font-black sm:text-4xl">FUSTECH Screening Calculator</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-green-50">Federal University of Science and Technology, Epe. Calculate your estimated aggregate and check the subjects required for your programme.</p>
      <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-white/15 px-3 py-2">UTME 70% + O’Level 30%</span><span className="rounded-full bg-white/15 px-3 py-2">Minimum UTME: 185</span><span className="rounded-full bg-white/15 px-3 py-2">34 programmes</span></div>
    </header>
    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900"><p className="font-black">One O’Level sitting only</p><p>{FUSTECH_SITTING_NOTICE}</p><a href={sources.announcement} target="_blank" rel="noreferrer" className="mt-2 inline-block font-bold underline">FUSTECH’s official admission announcement ↗</a></div>
    <div className="mt-7 grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
      <section className={card}>
        <h2 className="text-xl font-black">Candidate information</h2>
        <label className="mt-5 block text-sm font-bold">Candidate name (optional)<input className={field} value={candidate} onChange={event => setCandidate(event.target.value)} placeholder="Enter candidate name" maxLength={120}/></label>
        <label className="mt-5 block text-sm font-bold">Programme<select className={field} aria-invalid={checked&&!programme} value={course} onChange={event => {setCourse(event.target.value); setChecked(false);}}><option value="">Select your programme</option>{programmes.map(p => <option key={p.code} value={p.code}>{p.name} ({p.degree})</option>)}</select></label>
        {programme && <div className="mt-4 space-y-3 rounded-2xl bg-green-50 p-4 text-sm leading-6"><h3 className="font-black text-green-800">Official programme requirements</h3><p><b>O’Level:</b> {programme.oLevel}</p><p><b>UTME:</b> {programme.utme.replace(/\b[A-Z]{3}\b/g, code => jambSubjects[code === 'CHM' ? 'CHE' : code] || code)}</p></div>}
        <h2 className="mt-8 text-xl font-black">JAMB UTME</h2>
        <label className="mt-4 block text-sm font-bold">UTME score<input className={field} type="number" min="0" max="400" step="1" aria-invalid={checked&&(!calculation?.scoreValid||!calculation?.minimumMet)} value={score} onChange={event => setScore(event.target.value)} placeholder="Score out of 400"/></label>
        <p className="mt-4 text-sm text-slate-600">Use of English is compulsory. Select your other three UTME subjects.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">{electives.map((value, index) => <label key={index} className="text-xs font-bold">UTME subject {index + 2}<select className={field} aria-invalid={checked&&!calculation?.subjectsMet} value={value} onChange={event => setElectives(old => old.map((v, i) => i === index ? event.target.value : v))}><option value="">Select subject</option>{Object.entries(jambSubjects).filter(([code]) => code !== 'ENG').map(([code, name]) => <option key={code} value={code} disabled={electives.some((other, i) => i !== index && other === code)}>{name}</option>)}</select></label>)}</div>
        <h2 className="mt-8 text-xl font-black">O’Level results</h2><p className="mt-2 text-sm leading-6 text-slate-600">Enter up to nine subjects from one O’Level sitting. We select five distinct relevant credits, keeping compulsory subjects and using the best valid grades.</p>
        <LasuStyleOLevel key={resetKey} subjects={subjects} grades={Object.keys(gradePoints)} value={results} onChange={setResults} sittings={sittings} onSittingsChange={() => {}} singleSittingOnly note={FUSTECH_SITTING_NOTICE}/>
        <label className="mt-5 block text-sm font-bold">Exam body<select className={field} value={board} onChange={event => setBoard(event.target.value)}>{['WAEC','NECO','NABTEB'].map(exam => <option key={exam}>{exam}</option>)}</select></label>
        <div className="mt-6 flex flex-wrap gap-3"><button className="rounded-xl bg-green-700 px-5 py-3 text-sm font-black text-white" onClick={checkEligibility} aria-controls="fustech-result">Check Eligibility &amp; View Report</button><button className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold" onClick={reset}>Reset</button></div>
      </section>
      <aside className="space-y-5 lg:sticky lg:top-24">
        <section id="fustech-result" ref={resultRef} tabIndex={-1} aria-labelledby="fustech-result-title" className={card} aria-live="polite"><h2 id="fustech-result-title" className="text-xs font-black uppercase tracking-widest text-green-700">{checked ? "Your screening result" : "Live aggregate"}</h2><h2 className="mt-3 text-5xl font-black">{(calculation?.total || 0).toFixed(2)}<span className="text-lg text-slate-500"> /100</span></h2>
          <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-500">UTME</p><p className="mt-1 text-xl font-black">{(calculation?.utme || 0).toFixed(2)}<span className="text-xs"> /70</span></p></div><div className="rounded-xl bg-green-50 p-4"><p className="text-xs font-bold text-green-800">O’LEVEL</p><p className="mt-1 text-xl font-black">{calculation?.oLevel || 0}<span className="text-xs"> /30</span></p></div></div>
          {!calculation?.creditsMet && <p className="mt-4 text-sm text-slate-600">Provisional estimate. Complete five relevant credits to include your O’Level points.</p>}
          {!!calculation?.selected.length && <div className="mt-5"><h3 className="text-sm font-black">Five selected credits</h3><ul className="mt-3 space-y-2 text-sm">{calculation.selected.map(row => <li key={row.subject} className="flex justify-between gap-3 border-b border-slate-200 pb-2"><span>{row.subject}</span><b>{row.grade} · {gradePoints[row.grade]} pts</b></li>)}</ul></div>}
          {checked && <div className="mt-5 rounded-xl border border-slate-200 p-4 text-sm"><h3 className="font-black">Subject assessment</h3><ul className="mt-2 space-y-2"><li><b>UTME score:</b> {calculation?.scoreValid && calculation.minimumMet ? 'Minimum score met' : 'Enter a valid score of at least 185'}</li><li><b>UTME subjects:</b> {calculation?.subjectsMet ? 'Combination matched' : 'Combination incomplete or incorrect'}</li><li><b>O’Level credits:</b> {calculation?.creditsMet ? 'Five relevant credits matched' : 'Required credits incomplete'}</li></ul></div>}
          {checked && <div className={'mt-5 rounded-xl p-4 text-sm ' + (notes.length ? 'bg-amber-50 text-amber-900' : 'bg-green-50 text-green-900')}><h3 className="font-black">{notes.length ? 'Requirements need attention' : 'Entered score and subject requirements met'}</h3>{notes.length > 0 && <ul className="mt-2 list-disc space-y-2 pl-4">{notes.map(note => <li key={note}>{note}</li>)}</ul>}<p className="mt-3">This is an estimate, not an admission offer. FUSTECH must be your first choice and your verified O’Level results must be on JAMB CAPS.</p></div>}
          {checked && programme && calculation && <ScreeningReportDownloads disabled={!calculation.scoreValid} report={{school:'FUSTECH',candidate,programme:programme.name,score:calculation.total.toFixed(2)+' / 100',status:notes.length?'Requirements need attention':'Entered score and subject requirements met',positive:notes.length===0,breakdown:[['UTME score',score+' / 400'],['UTME points (70%)',calculation.utme.toFixed(2)+' / 70'],["O-Level points",calculation.oLevel+' / 30'],['Sittings',String(sittings)],['Exam bodies',board]],results:calculation.selected.map(row=>({...row,points:gradePoints[row.grade]})),notes:[...notes,FUSTECH_SITTING_NOTICE,'O-Level requirement: '+programme.oLevel,'UTME subjects: '+['ENG',...electives].map(code=>jambSubjects[code]||'Not selected').join(', '),'Official UTME requirement: '+programme.utme,'First choice and verified O-Level upload on JAMB CAPS are also required. No departmental aggregate cutoff has been assumed.','Sources checked '+sources.checked+': '+sources.announcement+' ; '+sources.guidelines+' ; '+sources.requirements]}}/>}
        </section>
        <section className={card}><h2 className="text-lg font-black">How your score is calculated</h2><p className="mt-3 text-sm leading-6 text-slate-600">UTME score ÷ 400 × 70, plus the points from five relevant O’Level credits.</p><div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">{Object.entries(gradePoints).filter(([,points]) => points > 0).map(([grade, points]) => <div className="rounded-xl bg-slate-50 p-3" key={grade}><b>{grade}</b><p className="text-slate-600">{points} {points === 1 ? 'point' : 'points'}</p></div>)}</div><p className="mt-4 text-xs leading-5 text-slate-500">No departmental aggregate cutoff or sitting penalty has been assumed.</p></section>
        <section className={card}><h2 className="text-lg font-black">Official sources</h2><p className="mt-2 text-xs text-slate-500">Checked {sources.checked}</p><a href={sources.guidelines} target="_blank" rel="noreferrer" className="mt-4 block text-sm font-bold text-green-700 underline">FUSTECH screening guidelines ↗</a><a href={sources.requirements} target="_blank" rel="noreferrer" className="mt-3 block text-sm font-bold text-green-700 underline">Programme requirements checker ↗</a><PublicPageLink href="/disclaimer" className="mt-3 block text-xs text-slate-500 underline">Independent guidance disclaimer</PublicPageLink></section>
      </aside>
    </div>
  </div></main>;
}
