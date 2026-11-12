"use client";
import { useState } from "react";
import Image from "next/image";
import styles from "./screening-design.module.css";
import { DisplaySettingsButton } from "../components/DisplayPreferences";
import PortalNavigation from "../components/PortalNavigation";
import PublicPageLink from "../components/PublicPageLink";
const schools = [
  {short:"UNILORIN",name:"University of Ilorin",type:"Post-UTME Examination",location:"Kwara",href:"/unilorin-calculator"},
  {short:"EKSU",name:"Ekiti State University, Ado-Ekiti",type:"Online Screening",location:"Ekiti",href:"/eksu-calculator"},
  {short:"OAU",name:"Obafemi Awolowo University, Ile-Ife",type:"Post-UTME Examination",location:"Osun",href:"/oau-calculator"},
  {short:"FUSTECH",name:"Federal University of Science and Technology, Epe",type:"Online Screening",location:"Lagos",href:"/fustech-calculator"},
  {short:"LASU",name:"Lagos State University",type:"Online Screening",location:"Lagos",href:"/lasu-calculator"},
  {short:"FUOYE",name:"Federal University Oye-Ekiti",type:"Online Screening",location:"Ekiti",href:"/fuoye-calculator"},
  {short:"OOU",name:"Olabisi Onabanjo University",type:"Post-UTME Examination",location:"Ogun",href:"/oou-calculator"},
  {short:"FUADSI",name:"Federal University of Agriculture and Development Studies, Iragbiji",type:"Online Screening",location:"Osun",href:"/fuadsi-calculator"},
  {short:"UNIOSUN",name:"Osun State University",type:"Online Screening",location:"Osun",href:"/uniosun-calculator"},
  {short:"LASUSTECH",name:"Lagos State University of Science and Technology",type:"Online Screening",location:"Lagos",href:"/lasustech-calculator"},
  {short:"LASUED",name:"Lagos State University of Education",type:"Online Screening",location:"Lagos",href:"/lasued-calculator"},
  {short:"YABATECH",name:"Yaba College of Technology",type:"Post-UTME Screening",location:"Lagos",href:"/yabatech-calculator"},
].sort((a,b)=>a.short==="LASU"?-1:b.short==="LASU"?1:a.short.localeCompare(b.short));
const filters = ["All schools","Online screening","Post-UTME"] as const;
export default function InstitutionPicker() {
 const [query,setQuery] = useState("");
 const [filter,setFilter] = useState<(typeof filters)[number]>("All schools");
 const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
 const visible = schools.filter(s=>words.every(word=>(s.short+" "+s.name+" "+s.location).toLowerCase().includes(word)) && (filter==="All schools" || (filter==="Online screening" ? s.type==="Online Screening" : s.type!=="Online Screening")));
 return <main className={`${styles.page} soh-screening-layout`}>
  <header className={styles.header}><div className={styles.nav}>
   <PublicPageLink href="/" aria-label="S.O.H CONSULTS homepage"><Image src="/soh-logo.jpg" alt="S.O.H CONSULTS" width={145} height={72} className={styles.logo} priority /></PublicPageLink>
   <nav className={styles.links} aria-label="Student tools navigation"><PublicPageLink href="/">Home</PublicPageLink><PublicPageLink href="/updates">Updates</PublicPageLink><PublicPageLink href="/tools">Student Tools</PublicPageLink></nav>
   <div className={styles.actions}><DisplaySettingsButton/><PublicPageLink href="/cgpa-calculator" className={styles.planner}>CGPA Planner ↗</PublicPageLink><PortalNavigation/></div>
  </div></header>
  <section className={styles.hero}><div className={styles.heroInner}><div><p className={styles.eyebrow}>Your admission journey starts here</p><h1>Your dream school.<br/>A clearer next step.</h1><p className={styles.intro}>Find your school. Understand your requirements.<br/>Check your screening score with confidence.</p></div><div className={styles.visual} aria-hidden="true"><small>PREPARE TODAY. GO FURTHER.</small><strong>Your next<br/>chapter →</strong><div className={styles.bars}>{[25,42,58,76,100].map(height=><i key={height} style={{height:`${height}%`}}/>)}</div></div></div></section>
  <div className={styles.content}><section className={styles.workspace} aria-labelledby="school-picker-title">
   <ol className={styles.steps} aria-label="Screening journey">{["Choose your school","Enter your results","View your report"].map((label,i)=><li key={label} aria-current={i===0?"step":undefined}><b>{i+1}</b>{label}</li>)}</ol>
   <div className={styles.sectionhead}><div><p className={styles.kicker}>{schools.length} schools · Free to use</p><h2 id="school-picker-title">Where are you heading?</h2><p>Choose your institution to check your score and course requirements.</p></div><label className={styles.search}><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg><input type="search" aria-label="Search schools" value={query} onChange={e=>setQuery(e.target.value)} placeholder="School name, abbreviation or state" autoComplete="off"/></label></div>
   <div className={styles.filters} role="group" aria-label="Filter calculators">{filters.map(item=><button key={item} type="button" aria-pressed={filter===item} onClick={()=>setFilter(item)}>{item}</button>)}{(query||filter!=="All schools")&&<button type="button" onClick={()=>{setQuery("");setFilter("All schools")}}>Clear filters</button>}</div>
   <p role="status" className={styles.count}>{visible.length} {visible.length===1?"school":"schools"} {query||filter!=="All schools"?"found":"to explore"}</p>
   <div className={styles.grid}>{visible.map(s=><PublicPageLink key={s.short} href={s.href} className={styles.card}><div className={styles.cardTop}><Image src={"/school-logos/"+s.short.toLowerCase()+".png"} alt={s.short+" emblem"} width={65} height={65}/><span className={styles.location}>{s.location}</span></div><h3>{s.short}</h3><p>{s.name}</p><span className={styles.type}><span aria-hidden="true">●</span> {s.type}</span><span className={styles.go}>Calculate my score <span aria-hidden="true">→</span></span></PublicPageLink>)}</div>
   {visible.length===0&&<div className={styles.empty}><h3>No schools found</h3><p>Try the school’s abbreviation or clear your filters to see all calculators.</p></div>}
   <div className={styles.directory}><p>Still exploring your options? Get to know more institutions.</p><PublicPageLink href="/schools">Browse the school directory →</PublicPageLink></div>
   <p className={styles.note}>Scores are estimates for guidance. Each school sets its own screening rules and makes the final admission decision.</p>
  </section></div><div className={styles.signoff}><span>S.O.H CONSULTS · Screening Calculators</span><span>A little preparation. A clearer path.</span></div>
 </main>;
}
