import type { Metadata } from "next";
import MatcherClient from "./MatcherClient";

export const metadata: Metadata = {
  title: "Admission Matcher Beta | S.O.H CONSULTS",
  description: "A private beta workspace for matching candidate details against verified admission requirements.",
  robots: { index: false, follow: false },
};

export default function AdmissionMatcherBetaPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">S.O.H CONSULTS</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">Admission Matcher Beta</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">Enter your admission details and the Matcher will compare them with requirements independently verified for this tool.</p>
        <div className="mt-6 rounded-2xl bg-emerald-50 p-5 text-sm leading-6 text-emerald-950"><strong>Private Beta:</strong> the first verified dataset currently covers selected FUOYE 2026/2027 programmes. More institutions can be added only after their requirements are verified from primary sources.</div>
        <MatcherClient />
      </section>
    </main>
  );
}
