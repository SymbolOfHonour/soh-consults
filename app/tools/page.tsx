import PublicPageLink from "../components/PublicPageLink";
import { DisplaySettingsButton } from "../components/DisplayPreferences";
import PortalNavigation from "../components/PortalNavigation";
import { withPublicSocial } from "../../lib/public-metadata";
import type { Metadata } from "next";
import styles from "./tools.module.css";

export const metadata: Metadata = withPublicSocial({
  title: "Student Tools",
  alternates: { canonical: "/tools" },
  description: "Check school screening scores and requirements, calculate your GPA and CGPA, and plan your next academic goal with S.O.H CONSULTS.",
});

function ToolIcon({ chart = false }: { chart?: boolean }) {
  return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{chart ? <><path d="M4 20V12h4v8m2 0V4h4v16m2 0V8h4v12M2 20h20" /></> : <><path d="m2 8 10-5 10 5-10 5L2 8Zm4 3v6c4 3 8 3 12 0v-6M22 8v9" /></>}</svg>;
}

export default function ToolsPage() {
  return <main className={styles.page}>
    <header className={styles.header}><div className={styles.nav}>
      <PublicPageLink href="/" aria-label="S.O.H CONSULTS homepage"><img src="/soh-logo.jpg" alt="S.O.H CONSULTS" width="145" height="72" className={styles.logo} /></PublicPageLink>
      <nav aria-label="Student tools navigation" className={styles.links}><PublicPageLink href="/">Home</PublicPageLink><PublicPageLink href="/updates">Updates</PublicPageLink><PublicPageLink href="/tools" aria-current="page">Student Tools</PublicPageLink></nav>
      <div className={styles.actions}><DisplaySettingsButton /><PublicPageLink href="/search" className={styles.search}>Search</PublicPageLink><PortalNavigation /></div>
    </div></header>
    <section className={styles.hero}><div className={styles.heroInner}>
      <div><p className={styles.eyebrow}>S.O.H CONSULTS · STUDENT TOOLS</p><h1>A clearer next step.<br />At every stage.</h1><p className={styles.intro}>Preparing for admission or planning your next semester?<br />Start with the right tool.</p></div>
      <div className={styles.journey} aria-hidden="true"><span className={styles.journeyIcon}><ToolIcon /></span><p>From your first choice<br />to your next milestone.</p><div><span>Apply</span><i /><span>Study</span><i /><span>Progress</span></div></div>
    </div></section>
    <div className={styles.content}>
      <section aria-labelledby="choose-tool" className={styles.workspace}>
        <div className={styles.sectionHead}><div><p className={styles.kicker}>WHAT ARE YOU WORKING TOWARDS?</p><h2 id="choose-tool">Choose your next step.</h2></div><span className={styles.free}>Free to use · No sign-up needed</span></div>
        <div className={styles.grid}>
          <PublicPageLink href="/screening-calculator" className={`${styles.card} ${styles.admission}`}>
            <div className={styles.cardTop}><span className={styles.icon}><ToolIcon /></span><span className={styles.stage}>BEFORE ADMISSION</span></div>
            <h3>Admission &amp;<br />Screening Calculators</h3><p>Find your school, check your estimated screening score and see your course requirements.</p>
            <div className={styles.features}><span>School requirements</span><span>Screening scores</span></div>
            <span className={styles.cta}>Find my school <span aria-hidden="true">→</span></span>
          </PublicPageLink>
          <PublicPageLink href="/cgpa-calculator" className={`${styles.card} ${styles.academic}`}>
            <div className={styles.cardTop}><span className={styles.icon}><ToolIcon chart /></span><span className={styles.stage}>DURING YOUR STUDIES</span></div>
            <h3>CGPA Calculator<br />&amp; Target Planner</h3><p>Understand your GPA and CGPA, explore possible results and plan the grades you need.</p>
            <div className={styles.features}><span>GPA &amp; CGPA</span><span>Targets &amp; projections</span></div>
            <span className={styles.cta}>Plan my grades <span aria-hidden="true">→</span></span>
          </PublicPageLink>
        </div>
        <nav aria-label="CGPA planning tools" className={styles.quick}>
          <span className={styles.quickTitle}>Know where you’re going?</span>
          <PublicPageLink href="/cgpa-calculator/planner">Open CGPA Academic Planner <span aria-hidden="true">↗</span></PublicPageLink>
          <PublicPageLink href="/cgpa-calculator/select-scale">Choose Your University Grading Scale <span aria-hidden="true">↗</span></PublicPageLink>
          <PublicPageLink href="/schools">Find your school <span aria-hidden="true">↗</span></PublicPageLink>
        </nav>
      </section>
      <p className={styles.note}>Screening scores are estimates for guidance. Always confirm your school’s official admission requirements.</p>
    </div>
  </main>;
}
