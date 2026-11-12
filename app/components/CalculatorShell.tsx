import type { ReactNode } from 'react';
import PublicPageLink from './PublicPageLink';
import styles from './CalculatorShell.module.css';

export default function CalculatorShell({ children }: { children: ReactNode }) {
  return <main className={styles.page}><div className={styles.content}>{children}</div></main>;
}

export function CalculatorHeader({ title, description, children }: {
  title: ReactNode; description: ReactNode; children?: ReactNode;
}) {
  return <header className={styles.hero}>
    <div className={styles.heroMeta}><nav aria-label="Calculator shortcuts" className={styles.shortcuts}>
      <PublicPageLink href="/" className={styles.home}>Home</PublicPageLink>
      <PublicPageLink href="/screening-calculator">All calculators</PublicPageLink>
    </nav>
    <p className={styles.brand}>S.O.H CONSULTS</p></div>
    <h1>{title}</h1>
    <p className={styles.description}>{description}</p>
    {children && <div className={styles.details}>{children}</div>}
  </header>;
}

export function CalculatorScore({ score, parts, note = 'Provisional estimate. Complete the required inputs and check the assessment below.' }: {
  score: number; parts: { label: string; value: number; maximum: number }[]; note?: string;
}) {
  return <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7" aria-label="Live aggregate">
    <h2 className="text-xs font-black uppercase tracking-widest text-green-700">Live aggregate</h2>
    <p className="mt-3 text-5xl font-black">{score.toFixed(2)}<span className="text-lg text-slate-500"> /100</span></p>
    <div className="mt-5 grid grid-cols-2 gap-3">{parts.map(part => <div key={part.label} className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-bold text-slate-500">{part.label}</p>
      <p className="mt-1 text-xl font-black">{part.value.toFixed(2)}<span className="text-xs"> /{part.maximum}</span></p>
    </div>)}</div>
    <p className="mt-4 text-sm leading-6 text-slate-600">{note}</p>
  </section>;
}
