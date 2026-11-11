"use client";
import {useEffect,useId,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import PublicPageLink from './PublicPageLink';
const groups = [
  {title:'Explore S.O.H CONSULTS',links:[['/','Home'],['/updates','Latest Updates'],['/opportunities','Opportunities'],['/deadlines','Admission Deadlines'],['/guides','Guides'],['/writers','Our Writers'],['/services','Services']]},
  {title:'Student tools',links:[['/tools','All Student Tools'],['/screening-calculator','Screening Calculators'],['/cgpa-calculator','CGPA Calculator & Planner'],['/schools','Find Your School'],['/my-school','My School Feed'],['/#contact','Contact Us']]},
];
export default function PortalNavigation(){
  const path=usePathname(),id=useId(),panel=useRef<HTMLDetailsElement>(null);
  const [open,setOpen]=useState(false);
  const previousPath=useRef(path);
  useEffect(()=>{if(previousPath.current!==path)panel.current?.removeAttribute('open');previousPath.current=path;},[path]);
  useEffect(()=>{
    const outside=(event:PointerEvent)=>{if(panel.current&&!panel.current.contains(event.target as Node))panel.current.removeAttribute('open');};
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&panel.current?.open){panel.current.removeAttribute('open');panel.current.querySelector('summary')?.focus();}};
    document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
  },[]);
  return <><a href="https://wa.me/2348182141088?text=Hello%20S.O.H%20CONSULTS%2C%20I%20need%20educational%20guidance." target="_blank" rel="noopener noreferrer" className="soh-portal-whatsapp">WhatsApp</a><details className="soh-portal-navigation" ref={panel} onToggle={event=>setOpen(event.currentTarget.open)}><summary role="button" aria-expanded={open} aria-label="Website navigation" aria-controls={id}><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg><span className="soh-portal-menu-label">Menu</span></summary><nav id={id} className="soh-portal-menu" aria-label="Website sections">{groups.map(group=><div key={group.title}><p>{group.title}</p>{group.links.map(([href,label])=><PublicPageLink key={href} href={href} aria-current={path===href?'page':undefined} onClick={()=>panel.current?.removeAttribute('open')}>{label}</PublicPageLink>)}</div>)}</nav></details></>;
}
