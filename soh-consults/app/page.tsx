"use client";

import { useState } from "react";


const WHATSAPP_NUMBER = "2348182141088";
const INSTAGRAM_URL = "https://www.instagram.com/oluyepeadetayo/";

const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const services = [
  {
    title: "Admission Registration",
    description:
      "Post UTME, Direct Entry, Part-Time, Pre-Degree and other admission applications.",
    icon: "🎓",
  },
  {
    title: "JAMB Services",
    description:
      "JAMB registration support, CAPS guidance, O'Level upload, result and admission letter services.",
    icon: "📝",
  },
  {
    title: "Admission Guidance",
    description:
      "Personalised guidance to help you understand your admission options and next steps.",
    icon: "🧭",
  },
  {
    title: "WAEC, NECO & NABTEB",
    description:
      "Result checking, certificate services, scratch cards and related educational support.",
    icon: "📄",
  },
  {
    title: "Printing & Documentation",
    description:
      "Admission letters, original JAMB results and other important academic documents.",
    icon: "🖨️",
  },
  {
    title: "Educational Consultation",
    description:
      "Get reliable guidance on schools, programmes, applications and other education matters.",
    icon: "💡",
  },
];


export default function Home() {
  const [showServices, setShowServices] = useState(false);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/soh-logo.jpg"
              alt="S.O.H CONSULTS"
              className="h-20 w-auto object-contain sm:h-24"
            />
          </a>

          <nav className="hidden items-center gap-4 text-xs font-semibold lg:flex xl:gap-6 xl:text-sm">
            <a href="/" className="whitespace-nowrap transition hover:text-green-700">
              Home
            </a>
            <a href="/updates" className="whitespace-nowrap transition hover:text-green-700">
              Updates
            </a>
            <a href="/opportunities" className="whitespace-nowrap transition hover:text-green-700">
              Opportunities
            </a>
            <a href="/deadlines" className="whitespace-nowrap transition hover:text-green-700">
              Deadlines
            </a>
            <a href="/guides" className="whitespace-nowrap transition hover:text-green-700">
              Guides
            </a>
            <a
              href="/lasu-calculator"
              className="whitespace-nowrap transition hover:text-green-700"
            >
              LASU Calculator
            </a>
          </nav>

          <a
            href={whatsappLink(
              "Hello S.O.H CONSULTS, I need assistance with an admission or educational service."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800"
          >
            WhatsApp Us
          </a>
        </div>
      </header>

      {/* HERO */}
      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-br from-green-950 via-green-900 to-green-700"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div className="text-white">
            <div className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              Admission • Education • Consultation
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Your Guide.
              <br />
              Your Success.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-green-50">
              S.O.H CONSULTS helps students and prospective applicants
              navigate admissions, educational opportunities and important
              academic processes with clarity and confidence.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/opportunities"
                className="rounded-full bg-white px-7 py-4 font-black !text-green-800 shadow-md transition hover:bg-green-50 hover:!text-green-950"
              >
                Explore Opportunities
              </a>

              <a
                href="/lasu-calculator"
                className="rounded-full bg-green-300 px-7 py-4 font-bold text-green-950 transition hover:bg-green-200"
              >
                LASU Aggregate Calculator
              </a>

              <a
                href={whatsappLink(
                  "Hello S.O.H CONSULTS, I need admission guidance. Please assist me."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/30 bg-white/10 px-7 py-4 font-bold text-white transition hover:bg-white/20"
              >
                Get Guidance
              </a>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-white/20 pt-7">
              <div>
                <p className="text-2xl font-black">5+</p>
                <p className="text-sm text-green-100">
                  Years of Service
                </p>
              </div>

              <div>
                <p className="text-2xl font-black">24/7</p>
                <p className="text-sm text-green-100">
                  Updates & Support
                </p>
              </div>

              <div>
                <p className="text-2xl font-black">1:1</p>
                <p className="text-sm text-green-100">
                  Personal Guidance
                </p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur">
              <div className="rounded-2xl bg-white p-7">
                <p className="text-sm font-bold uppercase tracking-widest text-green-700">
                  S.O.H CONSULTS
                </p>

                <h2 className="mt-3 text-3xl font-black text-gray-900">
                  Stay informed.
                  <br />
                  Apply with confidence.
                </h2>

                <p className="mt-4 leading-7 text-gray-600">
                  Get admission opportunities, important education updates and
                  direct assistance when you need it.
                </p>

                <div className="mt-7 space-y-3">
                  <div className="rounded-xl bg-green-50 p-4 font-semibold text-green-900">
                    ✓ Admission Opportunities
                  </div>
                  <div className="rounded-xl bg-green-50 p-4 font-semibold text-green-900">
                    ✓ Latest Education Updates
                  </div>
                  <div className="rounded-xl bg-green-50 p-4 font-semibold text-green-900">
                    ✓ Direct WhatsApp Guidance
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="scroll-mt-24 bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-bold uppercase tracking-widest text-green-700">
              What We Do
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Education support made simpler
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              From registration to admission guidance and educational
              consultation, S.O.H CONSULTS is here to help you take the right
              steps.
            </p>
          </div>

          <div className="mt-7">
            <button
              type="button"
              onClick={() => setShowServices((current) => !current)}
              aria-expanded={showServices}
              className="inline-flex items-center gap-2 rounded-full bg-green-700 px-6 py-3 font-black text-white shadow-sm transition hover:bg-green-800"
            >
              {showServices ? "Hide Services ↑" : "View Our Services ↓"}
            </button>

            {showServices && (
              <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <div
                    key={service.title}
                    className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="text-4xl">{service.icon}</div>

                    <h3 className="mt-5 text-xl font-black">
                      {service.title}
                    </h3>

                    <p className="mt-3 leading-7 text-gray-600">
                      {service.description}
                    </p>

                    <a
                      href={whatsappLink(
                        `Hello S.O.H CONSULTS, I am interested in your ${service.title} service. Please guide me.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-block font-bold text-green-700 hover:text-green-900"
                    >
                      Get Assistance →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-bold uppercase tracking-widest text-green-700">
              Explore S.O.H CONSULTS
            </p>
<p className="mt-4 leading-7 text-gray-600">
              Open our dedicated pages for current admission opportunities,
              important education updates, deadlines, admission guides and the LASU aggregate calculator.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <a
              href="/updates"
              className="group rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-2xl">📰</div>
              <h3 className="mt-5 text-2xl font-black text-gray-950">Latest Updates</h3>
              <p className="mt-3 leading-7 text-gray-600">
                Read important admission, JAMB and education updates in one dedicated space.
              </p>
              <span className="mt-6 inline-block font-black text-green-700 transition group-hover:translate-x-1">
                View Latest Updates →
              </span>
            </a>

            <a
              href="/opportunities"
              className="group rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-2xl">🎓</div>
              <h3 className="mt-5 text-2xl font-black text-gray-950">Admission Opportunities</h3>
              <p className="mt-3 leading-7 text-gray-600">
                Browse available university, polytechnic, college and other admission opportunities.
              </p>
              <span className="mt-6 inline-block font-black text-green-700 transition group-hover:translate-x-1">
                Explore Opportunities →
              </span>
            </a>

            <a
              href="/deadlines"
              className="group rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-2xl">⏰</div>
              <h3 className="mt-5 text-2xl font-black text-gray-950">Deadline Tracker</h3>
              <p className="mt-3 leading-7 text-gray-600">
                Track known admission deadlines and see how much time remains before applications close.
              </p>
              <span className="mt-6 inline-block font-black text-green-700 transition group-hover:translate-x-1">
                Track Deadlines →
              </span>
            </a>

            <a
              href="/guides"
              className="group rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-2xl">📚</div>
              <h3 className="mt-5 text-2xl font-black text-gray-950">Admission Guides</h3>
              <p className="mt-3 leading-7 text-gray-600">
                Understand JAMB CAPS statuses, O'Level uploads and important admission next steps.
              </p>
              <span className="mt-6 inline-block font-black text-green-700 transition group-hover:translate-x-1">
                Open Knowledge Hub →
              </span>
            </a>

            <a
              href="/lasu-calculator"
              className="group rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-2xl">🧮</div>
              <h3 className="mt-5 text-2xl font-black text-gray-950">LASU Calculator</h3>
              <p className="mt-3 leading-7 text-gray-600">
                Check your LASU aggregate score and programme eligibility using the dedicated calculator.
              </p>
              <span className="mt-6 inline-block font-black text-green-700 transition group-hover:translate-x-1">
                Open Calculator →
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="font-bold uppercase tracking-widest text-green-700">
                Why S.O.H CONSULTS
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                More than registration
              </h2>

              <p className="mt-5 leading-8 text-gray-600">
                We understand that admission can be confusing. Our goal is to
                make the process easier by providing useful information,
                practical guidance and direct support.
              </p>

              <div className="mt-8 space-y-5">
                {[
                  "Clear and practical admission guidance",
                  "Regular education and admission updates",
                  "Support with important application processes",
                  "Direct communication through WhatsApp",
                  "Personalised assistance when you need it",
                ].map((item) => (
                  <div key={item} className="flex gap-3">
                    <span className="font-black text-green-700">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-green-950 p-8 text-white shadow-xl sm:p-10">
              <p className="text-sm font-bold uppercase tracking-widest text-green-300">
                Our Promise
              </p>

              <h3 className="mt-4 text-3xl font-black">
                Your admission journey deserves clarity.
              </h3>

              <p className="mt-5 leading-8 text-green-50">
                Whether you're applying for admission, checking your status,
                trying to understand a requirement or simply looking for the
                next available opportunity, S.O.H CONSULTS is here to guide
                you.
              </p>

              <a
                href={whatsappLink(
                  "Hello S.O.H CONSULTS, I need assistance with my admission journey."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-block rounded-full bg-white px-7 py-3 font-black !text-green-900 shadow-md transition hover:bg-green-50 hover:!text-green-950"
              >
                Talk to Us
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* MEET THE FOUNDER */}
      <section
        id="founder"
        className="scroll-mt-24 overflow-hidden bg-gradient-to-br from-white via-green-50/40 to-white py-20"
      >
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="relative">
              <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-green-100 blur-2xl" />
              <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-red-100 blur-2xl" />

              <div className="relative overflow-hidden rounded-3xl border border-green-100 bg-green-950 shadow-2xl">
                <img
                  src="/founder.jpg"
                  alt="Oluyepe Adetayo Sunday, Founder of S.O.H CONSULTS"
                  className="aspect-[4/5] w-full object-cover object-top"
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-7 pb-7 pt-24 text-white">
                  <p className="text-2xl font-black">Your Guide.</p>
                  <p className="text-2xl font-black text-green-300">
                    Your Success.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <span className="h-0.5 w-10 bg-green-700" />
                <p className="font-black uppercase tracking-[0.28em] text-green-700">
                  Meet the Founder
                </p>
              </div>

              <h2 className="mt-5 text-4xl font-black leading-tight text-gray-950 sm:text-5xl">
                Oluyepe Adetayo Sunday
              </h2>

              <p className="mt-3 text-xl font-black text-green-700">
                Founder, S.O.H CONSULTS
              </p>
              <p className="mt-1 font-semibold tracking-wide text-gray-500">
                B.Sc. Marketing
              </p>

              <div className="mt-7 space-y-5 leading-8 text-gray-600">
                <p>
                  Oluyepe Adetayo Sunday is the Founder of{" "}
                  <strong className="text-green-800">S.O.H CONSULTS</strong>, an
                  educational support and consulting brand built from years of
                  firsthand experience navigating the admission process and
                  helping students do the same.
                </p>

                <p>
                  His journey into the university was not straightforward. After
                  several attempts at gaining admission, he eventually earned
                  admission into Lagos State University, where he studied
                  Marketing. That experience shaped a simple conviction:{" "}
                  <strong className="text-gray-900">
                    students should not have to navigate important educational
                    decisions without access to clear, reliable guidance.
                  </strong>
                </p>

                <p>
                  What began as helping prospective students understand
                  admissions has grown into{" "}
                  <strong className="text-green-800">S.O.H CONSULTS</strong>,
                  providing admission guidance, registration assistance, JAMB
                  services, documentation support and timely educational
                  information to students and applicants.
                </p>

                <p>
                  Beyond entrepreneurship, Oluyepe developed extensive leadership
                  experience during his university years, culminating in his
                  service as{" "}
                  <strong className="text-gray-900">
                    General Secretary of the Lagos State University Students&apos;
                    Union
                  </strong>
                  , where he contributed to the administration of the students&apos;
                  union across the university&apos;s campuses.
                </p>

                <p>
                  Today, his focus is on growing{" "}
                  <strong className="text-green-800">S.O.H CONSULTS</strong> into
                  a trusted education and consulting brand that helps people make
                  informed decisions and successfully navigate opportunities.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="https://wa.me/2348182141088"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-green-700 px-6 py-3.5 font-black text-white shadow-sm transition hover:bg-green-800"
                >
                  WhatsApp: 0818 214 1088
                </a>

                <a
                  href="https://www.linkedin.com/in/adetayo-sunday-oluyepe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border-2 border-green-700 bg-white px-6 py-3 font-black text-green-800 transition hover:bg-green-50"
                >
                  LinkedIn Profile
                </a>
              </div>

              <div className="mt-9 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                  <div className="text-2xl">🎓</div>
                  <p className="mt-3 font-black text-gray-900">B.Sc. Marketing</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Lagos State University
                  </p>
                </div>

                <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                  <div className="text-2xl">👥</div>
                  <p className="mt-3 font-black text-gray-900">Student Leader</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Former LASUSU General Secretary
                  </p>
                </div>

                <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                  <div className="text-2xl">🌱</div>
                  <p className="mt-3 font-black text-gray-900">
                    Education Advocate
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Helping students succeed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="scroll-mt-24 bg-gray-50 py-20">
        <div className="mx-auto max-w-5xl px-5 text-center lg:px-8">
          <p className="font-bold uppercase tracking-widest text-green-700">
            About S.O.H CONSULTS
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Your Guide. Your Success.
          </h2>

          <p className="mx-auto mt-6 max-w-3xl leading-8 text-gray-600">
            S.O.H CONSULTS is an education and admission support platform
            committed to helping students and prospective applicants make
            informed decisions throughout their educational journey.
          </p>

          <p className="mx-auto mt-4 max-w-3xl leading-8 text-gray-600">
            From admission opportunities and application support to timely
            educational updates and consultation, we aim to make important
            information easier to understand and act upon.
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="scroll-mt-24 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="rounded-3xl bg-green-900 p-8 text-white sm:p-12">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="font-bold uppercase tracking-widest text-green-300">
                  Contact Us
                </p>

                <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                  Need help with admission?
                </h2>

                <p className="mt-5 max-w-xl leading-8 text-green-50">
                  Send us a message on WhatsApp and tell us what you need
                  help with. We'll guide you on the next step.
                </p>
              </div>

              <div className="space-y-4">
                <a
                  href={whatsappLink(
                    "Hello S.O.H CONSULTS, I would like to make an enquiry."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl bg-white p-5 text-green-900 transition hover:bg-green-50"
                >
                  <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                    WhatsApp
                  </p>
                  <p className="mt-1 text-xl font-black">
                    0818 214 1088
                  </p>
                </a>

                <a
                  href="mailto:Oluyepeadetayo@gmail.com"
                  className="block rounded-2xl bg-white p-5 text-green-900 transition hover:bg-green-50"
                >
                  <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                    Email
                  </p>
                  <p className="mt-1 break-all font-black">
                    Oluyepeadetayo@gmail.com
                  </p>
                </a>

                {INSTAGRAM_URL ? (
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl bg-white p-5 text-green-900 transition hover:bg-green-50"
                  >
                    <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                      Instagram
                    </p>
                    <p className="mt-1 font-black">S.O.H EDU-HUB</p>
                  </a>
                ) : (
                  <div className="rounded-2xl bg-white/10 p-5">
                    <p className="text-sm font-bold uppercase tracking-wide text-green-300">
                      Instagram
                    </p>
                    <p className="mt-1 font-black">S.O.H EDU-HUB</p>
                  </div>
                )}

                <a
                  href="https://whatsapp.com/channel/0029VbD6QQp3GJP68dl9TK29"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl bg-white p-5 text-green-900 transition hover:bg-green-50"
                >
                  <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                    WhatsApp Channel
                  </p>
                  <p className="mt-1 font-black">
                    Join S.O.H CONSULTS Updates
                  </p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 px-5 py-10 text-gray-400 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-lg font-black text-white">S.O.H CONSULTS</p>
            <p className="mt-1 text-sm">Your Guide. Your Success.</p>
          </div>

          <div className="text-sm sm:text-right">
            <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 sm:justify-end">
              <a href="/updates" className="hover:text-white">
                Latest Updates
              </a>
              <a href="/opportunities" className="hover:text-white">
                Opportunities
              </a>
              <a href="/deadlines" className="hover:text-white">
                Deadlines
              </a>
              <a href="/guides" className="hover:text-white">
                Guides
              </a>
              <a href="/#founder" className="hover:text-white">
                Meet the Founder
              </a>
              <a href="/lasu-calculator" className="hover:text-white">
                LASU Calculator
              </a>
              <a
                href="https://whatsapp.com/channel/0029VbD6QQp3GJP68dl9TK29"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                WhatsApp Channel
              </a>
            </div>
            <p>Admission • Education • Consultation</p>
            <p className="mt-1">
              © {new Date().getFullYear()} S.O.H CONSULTS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}