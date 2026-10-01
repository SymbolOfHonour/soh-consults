import type { Metadata } from "next";
import MatcherClient from "./MatcherClient";

export const metadata: Metadata = {
  title: "Admission Matcher Beta | S.O.H CONSULTS",
  description: "A private beta workspace for matching candidate details against verified Nigerian tertiary admission requirements.",
  robots: { index: false, follow: false },
};

export default function AdmissionMatcherBetaPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">S.O.H CONSULTS</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">Admission Matcher Beta</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">Enter your admission details and compare them with Nigerian tertiary admission requirements that have been independently verified for this tool.</p>
        <div className="mt-6 rounded-2xl bg-emerald-50 p-5 text-sm leading-6 text-emerald-950"><strong>Private Beta:</strong> coverage now spans the verified programmes and institutions currently registered in the Matcher dataset. Coverage is expanded only from JAMB IBASS and official institution sources; unsupported requirements are never guessed.</div>
        <MatcherClient />
      </section>
    </main>
  );
}
