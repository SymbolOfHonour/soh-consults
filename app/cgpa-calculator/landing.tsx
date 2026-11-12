"use client";
import PublicPageLink from "../components/PublicPageLink";
import { PlannerShell, PlannerIcon } from "./PlannerDesign";
const groups = [
  { title: "Lagos State University", text: "LASU’s grading system.", badge: "5.0 scale", href: "/cgpa-calculator/planner?grading=lasu", action:"Choose LASU" },
  { title: "University Grading", text: "General university systems.", badge: "5.0 / 4.0", href: "/cgpa-calculator/select-scale?type=university", action:"Select grading" },
  { title: "ND / HND Grading", text: "Polytechnics and colleges of technology.", badge: "4.0 scale", href: "/cgpa-calculator/planner?grading=polytechnic-4", action:"Select grading" },
  { title: "NCE Grading", text: "Colleges of education.", badge: "5.0 / 4.0", href: "/cgpa-calculator/select-scale?type=nce", action:"Select grading" },
];
export default function Page(){return <PlannerShell><div className="cgpa-sectionhead"><div><h2>Let’s start with your grading system.</h2><p>Select the option your institution uses to get started.</p></div><span className="cgpa-badge">Made for your academic journey</span></div><div className="cgpa-grid">{groups.map((group,i)=><PublicPageLink key={group.title} href={group.href} className={`cgpa-card ${i===0?"cgpa-featured":""}`}><span className="cgpa-pill">{group.badge}</span><PlannerIcon kind={i} /><h3>{group.title}</h3><p>{group.text}</p><span className="cgpa-go">{group.action}<span aria-hidden="true">→</span></span></PublicPageLink>)}</div><p className="cgpa-note">ⓘ Your institution’s grading system determines how your CGPA is calculated.</p></PlannerShell>}
