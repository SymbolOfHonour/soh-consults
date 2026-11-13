import PublicPageLink from "../components/PublicPageLink";
import { DisplaySettingsButton } from "../components/DisplayPreferences";
import PortalNavigation from "../components/PortalNavigation";
import BusinessContacts from "../components/BusinessContacts";
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
  return <main className={`${styles.page} soh-tools-page`}>
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
            <div className={styles.cardTop}><span className={styles.icon}><ToolIcon /></span><span className={styles.stage}>FOR ADMISSION SEEKERS</span></div>
            <h3>Admission &amp;<br />Screening Calculators</h3><p>Find your school, check your estimated screening score and see your course requirements.</p>
            <div className={styles.features}><span>School requirements</span><span>Screening scores</span></div>
            <span className={styles.cta}>Find my school <span aria-hidden="true">→</span></span>
          </PublicPageLink>
          <PublicPageLink href="/cgpa-calculator" className={`${styles.card} ${styles.academic}`}>
            <div className={styles.cardTop}><span className={styles.icon}><ToolIcon chart /></span><span className={styles.stage}>FOR STUDENTS</span></div>
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
      <section className={styles.guide} aria-labelledby="tools-guide-title">
        <p className={styles.kicker}>MAKE THE MOST OF YOUR TOOLS</p>
        <h2 id="tools-guide-title">A few steps to your next decision.</h2>
        <div className={styles.guideGrid}>
          <article><span className={styles.guideTag}>FOR ADMISSION SEEKERS</span><h3>Check your school requirements first.</h3><ol><li><strong>Choose your school.</strong><p>Open the screening calculators and select your institution.</p></li><li><strong>Enter your results.</strong><p>Have your UTME score, subject combination and O’Level grades ready. Follow your school’s sitting policy.</p></li><li><strong>Review your assessment.</strong><p>Check your estimated score and subject requirements. Confirm admission decisions with your school.</p></li></ol><PublicPageLink href="/screening-calculator">Start with your school →</PublicPageLink></article>
          <article><span className={styles.guideTag}>FOR STUDENTS</span><h3>Turn your grades into a plan.</h3><ol><li><strong>Select your grading system.</strong><p>Choose the scale your institution uses before entering your grades.</p></li><li><strong>Gather your course records.</strong><p>Keep your course units, grades and previous academic totals ready.</p></li><li><strong>Explore your next semester.</strong><p>Calculate your GPA or CGPA, then explore the grades you may need to work towards your target.</p></li></ol><PublicPageLink href="/cgpa-calculator">Choose your grading system →</PublicPageLink></article>
        </div>
      </section>
      <section className={styles.contact} aria-labelledby="tools-contact-title"><h2 id="tools-contact-title">Need help? Contact S.O.H CONSULTS</h2><p>Ask about screening, course requirements or using our student tools.</p><BusinessContacts compact /></section>
      <p className={styles.note}>Screening scores are estimates for guidance. Always confirm your school’s official admission requirements.</p>
    </div>
  </main>;
}
