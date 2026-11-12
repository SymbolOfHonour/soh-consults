import type { ReactNode } from "react";
import PublicPageLink from "../components/PublicPageLink";
import { DisplaySettingsButton } from "../components/DisplayPreferences";
import PortalNavigation from "../components/PortalNavigation";

export function PlannerHero() {
  return <section className="cgpa-hero"><div className="cgpa-hero-inner"><div><p className="cgpa-eyebrow">Your next academic goal starts here</p><h1>A clearer path to<br />a better CGPA.</h1><p className="cgpa-intro">Understand where you stand. Explore what’s possible.<br />Plan your next semester with confidence.</p></div><div className="cgpa-visual" aria-hidden="true"><small>SMALL STEPS. REAL PROGRESS.</small><strong>Your next level →</strong><div className="cgpa-bars">{[25,42,58,76,100].map(height=><i key={height} style={{height:`${height}%`}} />)}</div></div></div></section>;
}
export function PlannerHeader() {
  return <header className="cgpa-header"><div className="cgpa-nav"><PublicPageLink href="/" aria-label="S.O.H CONSULTS homepage"><img src="/soh-logo.jpg" alt="S.O.H CONSULTS" width="145" height="72" /></PublicPageLink><nav className="cgpa-desktop-nav" aria-label="Academic planner navigation"><PublicPageLink href="/">Home</PublicPageLink><PublicPageLink href="/updates">Updates</PublicPageLink><PublicPageLink href="/tools" className="cgpa-active">Student Tools</PublicPageLink></nav><div className="cgpa-actions"><DisplaySettingsButton /><PublicPageLink href="/search" className="cgpa-search">Search</PublicPageLink><PortalNavigation /></div></div></header>;
}
export function PlannerSteps({step=1}:{step?:number}) {
  return <ol className="cgpa-steps" aria-label="Planner progress">{["Grading system","Choose your tool","Make your plan"].map((title,i)=><li key={title} className={step>=i+1?"cgpa-step-on":""} aria-current={step===i+1?"step":undefined}><b>{i+1}</b><span>{title}</span></li>)}</ol>;
}
export function PlannerShell({children,step=1}:{children:ReactNode;step?:number}) {
  return <main className="cgpa-design"><PlannerHeader /><PlannerHero /><div className="cgpa-main"><section className="cgpa-workspace"><PlannerSteps step={step} />{children}</section></div><div className="cgpa-signoff"><span>S.O.H CONSULTS · Academic Planner</span><span>A little planning. A lot more clarity.</span></div></main>;
}
export function PlannerIcon({kind=0}:{kind?:number}) {
  return <span className={`cgpa-icon cgpa-icon-${kind}`}><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{kind===0?<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>:kind===1?<><path d="M4 20V10h4v10m2 0V4h4v16m2 0V7h4v13M2 20h20"/></>:kind===2?<><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6M12 8v5l3 2"/></>:<><path d="m3 8 9-5 9 5-9 5-9-5Zm4 3v7c3 3 7 3 10 0v-7M21 8v9"/></>}</svg></span>;
}
