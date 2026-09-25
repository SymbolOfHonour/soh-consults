"use client";

import { useEffect, useState } from "react";

type HomepageUpdate = {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  slug: string;
  updatedAt: string;
};

const WA = "https://wa.me/2348182141088";
const links = [
  { label: "Home", href: "/" }, { label: "Updates", href: "/updates" },
  { label: "Opportunities", href: "/opportunities" }, { label: "Deadlines", href: "/deadlines" },
  { label: "Guides", href: "/guides" }, { label: "Screening Calculator", href: "/screening-calculator" },
  { label: "CGPA Simulator / Planner", href: "/cgpa-calculator" },
];
const shortcuts = [
  { label: "Latest Admission Updates", href: "/updates", icon: "▤" },
  { label: "Available Opportunities", href: "/opportunities", icon: "🎓" },
  { label: "Check Post-UTME Screening Aggregate", href: "/screening-calculator", icon: "▦" },
  { label: "CGPA Simulator / Planner", href: "/cgpa-calculator", icon: "▥" },
  { label: "Direct WhatsApp Guidance", href: WA, icon: "◉" },
];
const services = [
  { title: "Admission Support", description: "Post-UTME, Direct Entry, part-time and other applications.", icon: "🎓" },
  { title: "JAMB Services", description: "CAPS guidance, O’Level uploads, results and admission letters.", icon: "📝" },
  { title: "Documentation", description: "Certificates, result checking and academic documents.", icon: "📄" },
  { title: "Educational Consultation", description: "Personal guidance on programmes and admission choices.", icon: "💡" },
  { title: "Examination Support", description: "WAEC, NECO and NABTEB-related assistance.", icon: "📚" },
  { title: "Opportunities", description: "Find educational opportunities and relevant updates.", icon: "🌍" },
];
const contact = (message: string) => `${WA}?text=${encodeURIComponent(message)}`;

export default function Home() {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [recentUpdates, setRecentUpdates] = useState<HomepageUpdate[]>([]);
  const [updatesLoaded, setUpdatesLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/public/updates", { cache: "no-store", signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error("Unable to load recent updates.");
        return response.json() as Promise<HomepageUpdate[]>;
      })
      .then(items => {
        setRecentUpdates(
          items
            .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
            .slice(0, 3),
        );
      })
      .catch(error => {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error(error.message);
        }
      })
      .finally(() => setUpdatesLoaded(true));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <main className="min-h-screen bg-[#faf8f2] text-[#102720]">
      <header className="sticky top-0 z-50 border-b border-[#e7e9df] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-2 sm:px-7 lg:px-10">
          <a href="/" aria-label="S.O.H CONSULTS home" className="shrink-0"><img src="/soh-logo.jpg" alt="S.O.H CONSULTS" className="h-12 w-auto object-contain sm:h-14" /></a>
          <nav aria-label="Main navigation" className="hidden items-center gap-4 lg:flex xl:gap-6">{links.map(link => <a key={link.href} href={link.href} className="text-xs font-bold hover:text-[#087245] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d9aa4c] xl:text-sm">{link.label}</a>)}</nav>
          <div className="flex items-center gap-2"><a href={WA} target="_blank" rel="noopener noreferrer" className="hidden rounded-xl bg-[#075738] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#043d29] sm:inline-flex">WhatsApp Us</a><button type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg border border-[#dce6dc] px-3 py-2 text-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075738] lg:hidden">{menuOpen ? "×" : "☰"}</button></div>
        </div>
        {menuOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" className="grid max-h-[calc(100dvh-4.5rem)] grid-cols-1 gap-1 overflow-y-auto border-t border-[#e7e9df] bg-white px-4 py-3 min-[360px]:grid-cols-2 lg:hidden">{links.map(link => <a key={link.href} href={link.href} className="rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-[#edf5ee] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#075738]" onClick={() => setMenuOpen(false)}>{link.label}</a>)}<a href={WA} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-[#075738] px-3 py-2.5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d9aa4c] min-[360px]:col-span-2" onClick={() => setMenuOpen(false)}>WhatsApp Us</a></nav>}
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#043b29] via-[#06452f] to-[#07583b] text-white">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full border-[45px] border-[#0b6243]/50" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-5 px-4 pt-8 sm:px-7 lg:grid-cols-[1.05fr_1fr_.85fr] lg:gap-4 lg:px-10 lg:pt-10">
          <div className="relative z-10 lg:pb-10"><p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-[#e6f0e9]">Admissions • Education • Consultation</p><h1 className="text-4xl font-black leading-[1.08] sm:text-5xl xl:text-6xl">Your Guide.<br /><span className="text-[#efc46e]">Your Success.</span></h1><p className="mt-4 max-w-lg text-sm leading-6 text-[#f2f5ef] sm:text-base">Trusted admission support, educational opportunities and professional guidance for a brighter future.</p><div className="mt-6 flex flex-wrap gap-2"><a href="/opportunities" className="rounded-xl bg-[#efc46e] px-4 py-3 text-sm font-extrabold text-[#102720] hover:bg-[#ffdb8e]">Explore Opportunities →</a><a href="/screening-calculator" className="rounded-xl border border-white px-4 py-3 text-sm font-bold text-white hover:bg-white/10">Check Screening Aggregate →</a><a href="/cgpa-calculator" className="rounded-xl border border-white px-4 py-3 text-sm font-bold text-white hover:bg-white/10">CGPA Simulator / Planner →</a><a href={contact("Hello S.O.H CONSULTS, I need admission guidance.")} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/60 px-4 py-3 text-sm font-bold text-white hover:bg-white/10">Chat with Us</a></div><div className="mt-7 grid max-w-md grid-cols-3 gap-2 border-t border-white/20 pt-4"><div><strong className="text-xl">4+</strong><p className="text-xs text-[#dcece3]">Years of Service</p></div><div><strong className="text-xl">24/7</strong><p className="text-xs text-[#dcece3]">Online Updates</p></div><div><strong className="text-xl">1:1</strong><p className="text-xs text-[#dcece3]">Personal Guidance</p></div></div></div>
          <div className="relative order-2 flex min-h-[220px] items-end justify-center overflow-hidden lg:h-full lg:min-h-[360px]"><img src="/hero-students.png" alt="Two students wearing S.O.H CONSULTS hoodies, holding study materials" className="relative z-10 max-h-[320px] w-full max-w-[470px] object-contain object-bottom sm:max-h-[390px] lg:absolute lg:bottom-0 lg:max-h-[440px] lg:max-w-none" /></div>
          <div className="relative z-10 order-3 mb-7 rounded-2xl bg-white p-4 text-[#102720] shadow-xl lg:mb-10 lg:p-5"><h2 className="text-xl font-black">Get Started Today</h2><p className="mb-3 text-sm text-[#52615a]">Discover opportunities, check requirements and get the guidance you need.</p><div className="divide-y divide-[#e7e9df]">{shortcuts.map(item => <a key={item.label} href={item.href} target={item.href === WA ? "_blank" : undefined} rel={item.href === WA ? "noopener noreferrer" : undefined} className="flex items-center gap-3 py-2.5 text-xs font-bold hover:text-[#087245] sm:text-sm"><span aria-hidden="true" className="text-xl text-[#075738]">{item.icon}</span><span className="flex-1">{item.label}</span><span aria-hidden="true">›</span></a>)}</div><a href="https://whatsapp.com/channel/0029VbD6QQp3GJP68dl9TK29" target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-between rounded-xl bg-[#edf6ef] px-3 py-3 text-sm font-bold text-[#075738]">Join our Community <span aria-hidden="true">→</span></a></div>
        </div>
      </section>

      <section aria-label="Our key services" className="mx-auto grid max-w-[1440px] grid-cols-2 gap-2 px-4 py-4 sm:grid-cols-3 sm:px-7 lg:grid-cols-6 lg:px-10">{[{name:"Admission Support",icon:"🎓"},{name:"Documentation",icon:"📄"},{name:"Consultation",icon:"👥"},{name:"Opportunities",icon:"🌍"},{name:"Guides",icon:"📚"},{name:"Deadlines",icon:"⏰"}].map((item,index) => <a key={item.name} href={index < 3 ? "#services" : ["/opportunities","/guides","/deadlines"][index-3]} onClick={index < 3 ? () => setServicesOpen(true) : undefined} className="flex items-center gap-2 rounded-xl border border-[#e2e5dc] bg-white p-3 shadow-sm hover:border-[#d9aa4c]"><span aria-hidden="true" className="text-2xl">{item.icon}</span><span className="text-xs font-bold sm:text-sm">{item.name}</span></a>)}</section>

      <section className="mx-auto max-w-[1440px] px-4 py-5 sm:px-7 lg:px-10"><div className="rounded-2xl bg-[#06452f] p-6 text-white shadow-lg sm:p-8"><div className="grid items-center gap-5 md:grid-cols-[1fr_auto]"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#efc46e]">Admission Tool</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">Check Your Post-UTME Screening Aggregate</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[#e6f0e9]">Select your institution and calculate your screening or admission aggregate using the method applicable to that school.</p></div><a href="/screening-calculator" className="rounded-xl bg-[#efc46e] px-5 py-3 text-center text-sm font-black text-[#102720] hover:bg-[#ffdb8e]">Select Your School →</a></div></div></section>

      <section className="mx-auto grid max-w-[1440px] gap-5 px-4 py-4 sm:px-7 lg:grid-cols-[1.7fr_.85fr] lg:px-10"><div><div className="mb-3 flex items-end justify-between gap-3"><div><h2 className="text-2xl font-black">Latest Updates</h2><p className="text-sm text-[#52615a]">Admission and education news in one place.</p></div><a href="/updates" className="shrink-0 text-xs font-bold text-[#075738] hover:underline sm:text-sm">View All Updates →</a></div><div className="grid gap-3 sm:grid-cols-3">{!updatesLoaded ? Array.from({ length: 3 }, (_, index) => <div key={index} className="h-40 animate-pulse rounded-xl border border-[#e2e5dc] bg-white p-4 shadow-sm"><div className="h-3 w-28 rounded bg-[#e5ece6]" /><div className="mt-4 h-4 w-full rounded bg-[#e5ece6]" /><div className="mt-2 h-4 w-3/4 rounded bg-[#e5ece6]" /><div className="mt-4 h-3 w-full rounded bg-[#edf1ed]" /></div>) : recentUpdates.length ? recentUpdates.map(update => <article key={update.id} className="flex flex-col rounded-xl border border-[#e2e5dc] bg-white p-4 shadow-sm"><p className="text-xs font-bold text-[#087245]">{update.category} · {update.date}</p><h3 className="mt-2 text-sm font-black leading-snug">{update.title}</h3><p className="mt-2 line-clamp-3 flex-1 text-xs leading-5 text-[#52615a]">{update.summary}</p><a href={`/updates/${update.slug}`} className="mt-3 text-xs font-bold text-[#075738] hover:underline">Read More →</a></article>) : <div className="rounded-xl border border-dashed border-[#cbd8cd] bg-white p-5 text-sm text-[#52615a] sm:col-span-3">No published update is available right now. <a href="/updates" className="font-bold text-[#075738] hover:underline">Open the Updates page</a>.</div>}</div></div><aside className="flex flex-col justify-center rounded-2xl bg-[#06452f] p-5 text-white"><div className="mb-3 text-3xl" aria-hidden="true">🎓</div><h2 className="text-xl font-black">Need Admission Assistance?</h2><p className="mt-2 text-sm text-[#e6f0e9]">Send us a message and let us guide you through the process.</p><a href={contact("Hello S.O.H CONSULTS, I need admission assistance.")} target="_blank" rel="noopener noreferrer" className="mt-5 rounded-xl bg-[#efc46e] px-4 py-3 text-center text-sm font-black text-[#102720] hover:bg-[#ffdb8e]">Chat on WhatsApp →</a><div className="mt-4 flex flex-wrap gap-3 text-xs"><a href="mailto:oluyepeadetayo@gmail.com" className="hover:underline">Email Us</a><a href="https://www.instagram.com/oluyepeadetayo/" target="_blank" rel="noopener noreferrer" className="hover:underline">Instagram</a><a href="https://whatsapp.com/channel/0029VbD6QQp3GJP68dl9TK29" target="_blank" rel="noopener noreferrer" className="hover:underline">Join Channel</a></div></aside></section>

      <section id="services" className="scroll-mt-24 mx-auto max-w-[1440px] px-4 py-3 sm:px-7 lg:px-10"><button type="button" aria-expanded={servicesOpen} aria-controls="services-panel" onClick={() => setServicesOpen(!servicesOpen)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#d9e6dc] bg-[#edf6ef] px-5 py-4 text-left hover:bg-[#e4f1e8]"><span><strong className="block text-base">Our Services</strong><span className="text-xs text-[#52615a]">{servicesOpen ? "Hide the full list of services" : "Click to view the full list of services we offer"}</span></span><span className="text-2xl text-[#075738]" aria-hidden="true">{servicesOpen ? "⌃" : "⌄"}</span></button>{servicesOpen && <div id="services-panel" className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{services.map(service => <article key={service.title} className="rounded-xl border border-[#e2e5dc] bg-white p-4"><span className="text-2xl" aria-hidden="true">{service.icon}</span><h3 className="mt-2 font-black">{service.title}</h3><p className="mt-1 text-sm text-[#52615a]">{service.description}</p><a href={contact(`Hello S.O.H CONSULTS, I need help with ${service.title}.`)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-bold text-[#075738] hover:underline">Get Assistance →</a></article>)}</div>}</section>

      <section className="mx-auto grid max-w-[1440px] gap-5 px-4 py-5 sm:px-7 lg:grid-cols-[1.2fr_1fr] lg:px-10">
        <div><h2 className="text-lg font-black">Why Choose S.O.H CONSULTS?</h2><div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">{["Clear Guidance","Student-Centred","Timely Updates","Personal Support"].map(item => <div key={item} className="rounded-xl bg-white p-3 font-bold shadow-sm"><span className="mr-1 text-[#087245]">✓</span>{item}</div>)}</div></div>
        <section aria-labelledby="founder-heading" className="rounded-2xl border border-[#e2e5dc] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start"><img src="/founder.jpg" alt="Oluyepe Adetayo Sunday, founder of S.O.H CONSULTS" className="h-44 w-36 shrink-0 rounded-xl object-cover object-top sm:h-48 sm:w-36" /><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-[#087245]">Meet the Founder</p><h2 id="founder-heading" className="mt-1 text-xl font-black">Oluyepe Adetayo Sunday</h2><p className="mt-1 text-sm font-semibold text-[#075738]">Founder, S.O.H CONSULTS · B.Sc. Marketing · Former LASUSU General Secretary</p><p className="mt-3 text-sm leading-6 text-[#52615a]">S.O.H CONSULTS provides admission guidance, registration assistance, JAMB services, documentation support and educational updates to students and prospective applicants.</p><p className="mt-3 text-sm leading-6 text-[#52615a]">After navigating multiple admission attempts himself, Oluyepe earned admission into Lagos State University and studied Marketing. His experience shaped a commitment to making educational decisions easier through clear guidance.</p><p className="mt-3 text-sm leading-6 text-[#52615a]">He also served as General Secretary of the Lagos State University Students’ Union, supporting its administration across the university’s campuses.</p><a href="/about" className="mt-4 inline-block rounded-lg bg-[#edf6ef] px-4 py-2 text-sm font-bold text-[#075738] hover:bg-[#dcefe1]">More About the Founder →</a></div></div>
        </section>
      </section>

      <footer className="bg-[#043b29] text-white"><div className="mx-auto grid max-w-[1440px] gap-5 px-4 py-6 sm:px-7 md:grid-cols-3 lg:px-10"><div><img src="/soh-logo.jpg" alt="S.O.H CONSULTS" className="h-12 w-auto rounded bg-white object-contain" /><p className="mt-2 text-xs text-[#e6f0e9]">Your Guide. Your Success.</p></div><div><h2 className="text-sm font-black">Quick Links</h2><div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">{links.slice(0,5).map(link => <a key={link.href} href={link.href} className="text-xs text-[#e6f0e9] hover:underline">{link.label}</a>)}</div></div><div><h2 className="text-sm font-black">Contact Us</h2><a href={WA} className="mt-2 block text-xs text-[#e6f0e9] hover:underline">WhatsApp: 0818 214 1088</a><a href="mailto:oluyepeadetayo@gmail.com" className="mt-2 block text-xs text-[#e6f0e9] hover:underline">oluyepeadetayo@gmail.com</a></div></div><div className="border-t border-white/20 px-4 py-3 text-center text-xs text-[#e6f0e9]">© {new Date().getFullYear()} S.O.H CONSULTS. Your Guide. Your Success.</div></footer>
    </main>
  );
}
