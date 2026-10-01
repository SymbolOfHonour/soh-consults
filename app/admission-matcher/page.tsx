import type { Metadata } from "next";

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
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          Enter your admission details and the Matcher will compare them with requirements that have been independently verified for this tool.
        </p>

        <div className="mt-8 rounded-2xl bg-emerald-50 p-5 text-sm leading-6 text-emerald-950">
          <strong>Beta safety rule:</strong> a match means the supplied details satisfy the requirements currently stored in the Matcher dataset. It is not an admission offer or guarantee.
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-950">Independent data</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Every supported programme will carry its source, admission session and last verification date.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-950">Existing calculators protected</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">The Matcher is separate. Existing screening calculators are not used as its data source and are not modified by this feature.</p>
          </div>
        </div>

        <p className="mt-8 text-sm text-slate-500">Candidate input and live matching controls will be enabled after the first verified programme dataset passes QA.</p>
      </section>
    </main>
  );
}
