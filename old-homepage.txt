"use client";

import { useState } from "react";

const WHATSAPP_NUMBER = "2348182141088";

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

const opportunities = [
  {
    institution: "FUOYE",
    programme: "Post UTME / Undergraduate Admission",
    category: "Universities",
    status: "OPEN",
    deadline: "Check latest deadline",
    description:
      "Federal University Oye-Ekiti admission information for the 2026/2027 academic session.",
  },
  {
    institution: "UNILAG",
    programme: "Direct Entry Screening",
    category: "Universities",
    status: "OPEN",
    deadline: "Check latest deadline",
    description:
      "University of Lagos Direct Entry screening information for the 2026/2027 academic session.",
  },
  {
    institution: "FUOTUOKE",
    programme: "Post UTME / Undergraduate Admission",
    category: "Universities",
    status: "OPEN",
    deadline: "Check latest deadline",
    description:
      "Federal University Otuoke Post UTME admission opportunity for 2026/2027.",
  },
  {
    institution: "FUOTUOKE",
    programme: "Part-Time Degree Admission",
    category: "Universities",
    status: "OPEN",
    deadline: "Check latest deadline",
    description:
      "Part-Time degree admission opportunity for the 2026/2027 academic session.",
  },
  {
    institution: "FEDPONAM",
    programme: "ND Post UTME Admission",
    category: "Polytechnics",
    status: "OPEN",
    deadline: "Check latest deadline",
    description:
      "Federal Polytechnic Kaura-Namoda ND admission opportunity for 2026/2027.",
  },
  {
    institution: "FEDPONAM",
    programme: "HND Admission",
    category: "Polytechnics",
    status: "OPEN",
    deadline: "Check latest deadline",
    description:
      "Federal Polytechnic Kaura-Namoda HND admission opportunity for 2026/2027.",
  },
  {
    institution: "BIDAPOLY",
    programme: "ND Full-Time Admission",
    category: "Polytechnics",
    status: "OPEN",
    deadline: "Check latest deadline",
    description:
      "Federal Polytechnic Bida admission information for ND Full-Time applicants.",
  },
  {
    institution: "FCE Iwo",
    programme: "NCE Post UTME",
    category: "Colleges",
    status: "OPEN",
    deadline: "Check latest deadline",
    description:
      "Federal College of Education Iwo NCE admission opportunity for 2026/2027.",
  },
  {
    institution: "NAUB",
    programme: "IJMB Admission",
    category: "Other",
    status: "OPEN",
    deadline: "Check latest deadline",
    description:
      "Nigerian Army University Biu IJMB admission opportunity for 2026/2027.",
  },
  {
    institution: "NAUB",
    programme: "Diploma Admission",
    category: "Other",
    status: "OPEN",
    deadline: "Check latest deadline",
    description:
      "Nigerian Army University Biu Diploma admission opportunity for 2026/2027.",
  },
];

const updates = [
  {
    id: 1,
    category: "Admission List",
    institution: "AFUED",
    title:
      "AFUED Admission List for 2026/2027 Academic Session",
    date: "11 September 2026",
    summary:
      "Adeyemi Federal University of Education, Ondo has released admission information for the 2026/2027 academic session.",
    details:
      "Candidates who applied to Adeyemi Federal University of Education should check their admission status and follow the institution's instructions for the next stage of the admission process.",
  },
  {
    id: 2,
    category: "Admission List",
    institution: "UNIMED",
    title:
      "UNIMED Admission List for 2026/2027 Academic Session",
    date: "11 September 2026",
    summary:
      "University of Medical Sciences, Ondo has released admission information for the 2026/2027 academic session.",
    details:
      "Candidates who applied to UNIMED should monitor their admission status and complete any required steps once their admission is available.",
  },
  {
    id: 3,
    category: "Admission List",
    institution: "ZAMSUT",
    title:
      "ZAMSUT Admission List for 2026/2027 Academic Session",
    date: "11 September 2026",
    summary:
      "Zamfara State University has released admission information for the 2026/2027 academic session.",
    details:
      "Applicants should check their admission status and follow the university's instructions regarding acceptance and registration.",
  },
  {
    id: 4,
    category: "Admission List",
    institution: "SSU",
    title:
      "SSU Admission List for 2026/2027 Academic Session",
    date: "11 September 2026",
    summary:
      "Sokoto State University has released admission information for the 2026/2027 academic session.",
    details:
      "Candidates who applied to SSU should check their admission status and proceed with the necessary admission steps where applicable.",
  },
  {
    id: 5,
    category: "Admission List",
    institution: "FUOYE",
    title:
      "FUOYE Admission List for 2026/2027 Academic Session",
    date: "11 September 2026",
    summary:
      "Federal University Oye-Ekiti has released admission information for the 2026/2027 academic session.",
    details:
      "Candidates should monitor their admission status and follow the university's instructions for acceptance and registration.",
  },
  {
    id: 6,
    category: "Admission",
    institution: "BIDAPOLY",
    title:
      "BIDAPOLY Admission List for 2026/2027 ND Full-Time Applicants",
    date: "11 September 2026",
    summary:
      "Federal Polytechnic Bida has released admission information for ND Full-Time applicants.",
    details:
      "Applicants should check their admission status and follow the institution's instructions for the next stage of the admission process.",
  },
  {
    id: 7,
    category: "Admission",
    institution: "FCE Iwo",
    title:
      "FCE Iwo Post UTME Form for 2026/2027 NCE Admission",
    date: "11 September 2026",
    summary:
      "Federal College of Education, Iwo has announced its NCE Post UTME admission opportunity for 2026/2027.",
    details:
      "Interested candidates should confirm eligibility and application requirements before proceeding with registration.",
  },
  {
    id: 8,
    category: "Admission",
    institution: "UNILAG",
    title:
      "UNILAG Direct Entry Screening Form for 2026/2027",
    date: "11 September 2026",
    summary:
      "University of Lagos has released information regarding its Direct Entry screening exercise.",
    details:
      "Eligible Direct Entry candidates should review the requirements and complete the necessary screening process.",
  },
  {
    id: 9,
    category: "Admission",
    institution: "FEDPONAM",
    title:
      "FEDPONAM HND Admission Form for 2026/2027",
    date: "11 September 2026",
    summary:
      "Federal Polytechnic Kaura-Namoda has announced HND admission information for the 2026/2027 academic session.",
    details:
      "Prospective HND applicants should confirm the available programmes, requirements and application procedure.",
  },
  {
    id: 10,
    category: "Admission",
    institution: "FUOTUOKE",
    title:
      "FUOTUOKE Post UTME Form for 2026/2027 Undergraduate Admission",
    date: "11 September 2026",
    summary:
      "Federal University Otuoke has released Post UTME admission information for the 2026/2027 session.",
    details:
      "Interested candidates should verify eligibility and application requirements before proceeding.",
  },
  {
    id: 11,
    category: "Admission",
    institution: "SAZU",
    title:
      "SAZU Admission List for 2026/2027 Academic Session",
    date: "11 September 2026",
    summary:
      "Sa'adu Zungur University has released updated admission information covering multiple batches.",
    details:
      "Candidates should check their admission status and follow the university's instructions for the next stage.",
  },
  {
    id: 12,
    category: "JAMB",
    institution: "JAMB",
    title: "New JAMB Admission Status Update",
    date: "Latest Update",
    summary:
      "JAMB admission status may now show PROPOSED, RECOMMENDED or APPROVED during the admission process.",
    details:
      "JAMB has updated the admission status portal, and candidates may now see PROPOSED, RECOMMENDED or APPROVED during the admission process.",
    jamb: true,
  },
];

const updateCategories = [
  "All",
  "JAMB",
  "Admission List",
  "Admission",
];

const opportunityCategories = [
  "All",
  "Universities",
  "Polytechnics",
  "Colleges",
  "Other",
];

export default function Home() {
  const [openUpdate, setOpenUpdate] = useState<number | null>(12);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeOpportunityCategory, setActiveOpportunityCategory] =
    useState("All");

  const filteredUpdates =
    activeCategory === "All"
      ? updates
      : updates.filter((item) => item.category === activeCategory);

  const filteredOpportunities =
    activeOpportunityCategory === "All"
      ? opportunities
      : opportunities.filter(
          (item) => item.category === activeOpportunityCategory
        );

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="#home" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="S.O.H CONSULTS"
              className="h-16 w-auto object-contain"
            />
          </a>

          <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <a href="#home" className="transition hover:text-green-700">
              Home
            </a>
            <a href="#services" className="transition hover:text-green-700">
              Services
            </a>
            <a
              href="#opportunities"
              className="transition hover:text-green-700"
            >
              Opportunities
            </a>
            <a href="#updates" className="transition hover:text-green-700">
              Latest Updates
            </a>
            <a href="#about" className="transition hover:text-green-700">
              About
            </a>
            <a href="#contact" className="transition hover:text-green-700">
              Contact
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
                href="#opportunities"
                className="rounded-full bg-white px-7 py-4 font-bold text-green-900 transition hover:bg-green-50"
              >
                Explore Opportunities
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
      <section id="services" className="bg-gray-50 py-20">
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

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        </div>
      </section>

      {/* ADMISSION OPPORTUNITIES */}
      <section id="opportunities" className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="font-bold uppercase tracking-widest text-green-700">
                Admission Opportunities
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Find your next opportunity
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                Explore current admission opportunities across universities,
                polytechnics, colleges and other programmes.
              </p>
            </div>

            <a
              href={whatsappLink(
                "Hello S.O.H CONSULTS, please send me the latest available admission opportunities."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-green-700 px-6 py-3 text-center font-bold text-white transition hover:bg-green-800"
            >
              Ask for More Opportunities
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {opportunityCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveOpportunityCategory(category)}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  activeOpportunityCategory === category
                    ? "bg-green-700 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-green-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredOpportunities.map((item) => (
              <div
                key={`${item.institution}-${item.programme}`}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="border-b border-gray-100 bg-gray-50 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                        {item.category}
                      </p>

                      <h3 className="mt-2 text-xl font-black">
                        {item.institution}
                      </h3>
                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-800">
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="font-black">{item.programme}</h4>

                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {item.description}
                  </p>

                  <div className="mt-5 rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      Deadline
                    </p>
                    <p className="mt-1 font-bold text-gray-900">
                      {item.deadline}
                    </p>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <a
                      href={whatsappLink(
                        `Hello S.O.H CONSULTS, I am interested in the ${item.institution} ${item.programme} opportunity. Please guide me on the application process.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-xl bg-green-700 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-green-800"
                    >
                      Apply Now
                    </a>

                    <a
                      href={whatsappLink(
                        `Hello S.O.H CONSULTS, I need guidance about the ${item.institution} ${item.programme} opportunity.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-green-700 px-4 py-3 text-center text-sm font-bold text-green-700 transition hover:bg-green-50"
                    >
                      Guidance
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST UPDATES */}
      <section id="updates" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="text-center">
            <p className="font-bold uppercase tracking-widest text-green-700">
              Latest Updates
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Stay updated on admissions
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-600">
              Important admission and education updates, simplified for
              students and applicants.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {updateCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  activeCategory === category
                    ? "bg-green-700 text-white"
                    : "bg-white text-gray-700 hover:bg-green-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-10 space-y-5">
            {filteredUpdates.map((item) => {
              const isOpen = openUpdate === item.id;

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <button
                    onClick={() =>
                      setOpenUpdate(isOpen ? null : item.id)
                    }
                    className="w-full p-6 text-left"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-800">
                            {item.category}
                          </span>

                          <span className="text-xs font-semibold text-gray-500">
                            {item.date}
                          </span>
                        </div>

                        <h3 className="mt-3 text-xl font-black">
                          {item.title}
                        </h3>

                        <p className="mt-2 leading-7 text-gray-600">
                          {item.summary}
                        </p>
                      </div>

                      <span className="shrink-0 text-2xl font-bold text-green-700">
                        {isOpen ? "−" : "+"}
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 px-6 pb-6 pt-5">
                      {item.jamb ? (
                        <div className="space-y-6 leading-7 text-gray-700">
                          <div>
                            <p className="font-black text-gray-900">
                              🚨 NEW JAMB ADMISSION STATUS UPDATE
                            </p>

                            <p className="mt-3">
                              JAMB has updated the admission status portal,
                              and candidates may now see{" "}
                              <strong>PROPOSED</strong>,{" "}
                              <strong>RECOMMENDED</strong> or{" "}
                              <strong>APPROVED</strong> during the admission
                              process.
                            </p>
                          </div>

                          <div className="rounded-2xl bg-yellow-50 p-5">
                            <h4 className="font-black text-gray-900">
                              🟡 PROPOSED FOR ADMISSION BY YOUR INSTITUTION
                            </h4>

                            <p className="mt-2">
                              This means your institution has proposed you for
                              admission. Your admission is being processed,
                              but it has not yet reached the final JAMB
                              approval stage.
                            </p>
                          </div>

                          <div className="rounded-2xl bg-orange-50 p-5">
                            <h4 className="font-black text-gray-900">
                              🟠 RECOMMENDED FOR ADMISSION
                            </h4>

                            <p className="mt-2">
                              This means your admission has progressed from the
                              proposal stage to the recommendation stage. Your
                              institution has put you forward for admission,
                              and the recommendation is now being processed
                              for JAMB's approval.
                            </p>
                          </div>

                          <div className="rounded-2xl bg-green-50 p-5">
                            <h4 className="font-black text-gray-900">
                              🟢 APPROVED FOR ADMISSION
                            </h4>

                            <p className="mt-2">
                              This means JAMB has approved the admission
                              recommendation. 🎉 Your admission has passed the
                              approval stage, and you can proceed to accept
                              the admission when the option becomes available
                              on your CAPS portal.
                            </p>
                          </div>

                          <div className="rounded-2xl border border-gray-200 p-5">
                            <h4 className="font-black text-gray-900">
                              In simple terms:
                            </h4>

                            <ul className="mt-3 space-y-2">
                              <li>
                                <strong>PROPOSED</strong> = Your institution
                                has proposed you for admission.
                              </li>
                              <li>
                                <strong>RECOMMENDED</strong> = Your admission
                                has progressed further and has been
                                recommended for JAMB's approval.
                              </li>
                              <li>
                                <strong>APPROVED</strong> = JAMB has approved
                                the admission. 🎉
                              </li>
                            </ul>
                          </div>

                          <div>
                            <p>
                              If you are seeing{" "}
                              <strong>PROPOSED</strong> or{" "}
                              <strong>RECOMMENDED</strong>,{" "}
                              <strong>DON'T PANIC.</strong> Your admission is
                              still progressing through the process. Keep
                              checking your CAPS portal for updates.
                            </p>

                            <p className="mt-3">
                              If you see <strong>APPROVED</strong>,
                              congratulations! 🎉
                            </p>
                          </div>

                          <a
                            href={whatsappLink(
                              "Hello S.O.H CONSULTS, I am seeing a JAMB admission status of PROPOSED/RECOMMENDED/APPROVED and I need help understanding what to do next."
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-xl bg-green-700 px-5 py-4 text-center font-black text-white transition hover:bg-green-800"
                          >
                            Need Help? Chat With S.O.H CONSULTS on WhatsApp
                          </a>
                        </div>
                      ) : (
                        <div>
                          <p className="leading-7 text-gray-700">
                            {item.details}
                          </p>

                          <a
                            href={whatsappLink(
                              `Hello S.O.H CONSULTS, I want more information about the ${item.institution} ${item.title}. Please guide me.`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 inline-block rounded-xl bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800"
                          >
                            Get Assistance on WhatsApp
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <a
              href={whatsappLink(
                "Hello S.O.H CONSULTS, please send me the latest admission updates and opportunities."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full border-2 border-green-700 px-7 py-3 font-bold text-green-700 transition hover:bg-green-700 hover:text-white"
            >
              Get More Updates
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
                className="mt-8 inline-block rounded-full bg-white px-7 py-3 font-black text-green-900 transition hover:bg-green-50"
              >
                Talk to Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-gray-50 py-20">
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
      <section id="contact" className="py-20">
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

                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-sm font-bold uppercase tracking-wide text-green-300">
                    Instagram
                  </p>
                  <p className="mt-1 font-black">S.O.H EDU-HUB</p>
                </div>
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