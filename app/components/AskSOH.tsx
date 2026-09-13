"use client";

import { FormEvent, useMemo, useState } from "react";

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
  actions?: Action[];
  sources?: SearchSource[];
};

type Action = {
  label: string;
  type: "topic" | "link" | "whatsapp" | "external";
  value: string;
};

type SearchSource = {
  title: string;
  url: string;
  snippet: string;
  official?: boolean;
};

type SearchPayload = {
  query: string;
  googleUrl: string;
  results: SearchSource[];
  error?: string;
};

const WHATSAPP = "2348182141088";

function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
}

const mainActions: Action[] = [
  { label: "JAMB CAPS", type: "topic", value: "caps" },
  { label: "LASU Calculator", type: "link", value: "/lasu-calculator" },
  { label: "Admission Opportunities", type: "link", value: "/opportunities" },
  { label: "Application Deadlines", type: "link", value: "/deadlines" },
  { label: "O'Level Upload", type: "topic", value: "olevel" },
  { label: "Direct Entry", type: "topic", value: "de" },
  { label: "Admission Guides", type: "link", value: "/guides" },
  { label: "Consultation & Mentorship", type: "topic", value: "consultation" },
];

const initialMessage: Message = {
  id: 1,
  role: "assistant",
  text: "Hi 👋 I’m Ask S.O.H. Ask me a basic admission question and I’ll try to answer it first. For fresh information, I can check Google and prioritise official sources. Personal or complex cases are referred to S.O.H CONSULTS.",
  actions: mainActions,
};

function capsActions(): Action[] {
  return [
    { label: "Proposed", type: "topic", value: "caps-proposed" },
    { label: "Recommended", type: "topic", value: "caps-recommended" },
    { label: "Approved", type: "topic", value: "caps-approved" },
    { label: "Admission in Progress", type: "topic", value: "caps-aip" },
    { label: "Not Admitted", type: "topic", value: "caps-not-admitted" },
  ];
}

function getTopicReply(topic: string): Message {
  const base = Date.now();

  const map: Record<string, Message> = {
    caps: {
      id: base,
      role: "assistant",
      text: "JAMB CAPS is the Central Admissions Processing System where candidates monitor admission processing and take actions such as accepting an approved offer. What does your CAPS currently show?",
      actions: capsActions(),
    },
    "caps-proposed": {
      id: base,
      role: "assistant",
      text: "PROPOSED FOR ADMISSION means your institution has proposed you for admission. The process is still ongoing and has not yet reached final JAMB approval. Keep monitoring CAPS and your institution’s official channel.",
      actions: [
        { label: "Read CAPS Guide", type: "link", value: "/guides/understanding-jamb-caps-status" },
        { label: "My case is different", type: "topic", value: "complex" },
      ],
    },
    "caps-recommended": {
      id: base,
      role: "assistant",
      text: "RECOMMENDED FOR ADMISSION means your institution has put you forward for admission and the recommendation is being processed for JAMB approval. It is progress, but it is not the final approval stage yet.",
      actions: [
        { label: "Read CAPS Guide", type: "link", value: "/guides/understanding-jamb-caps-status" },
        { label: "My case is different", type: "topic", value: "complex" },
      ],
    },
    "caps-approved": {
      id: base,
      role: "assistant",
      text: "APPROVED FOR ADMISSION means JAMB has approved the admission recommendation. Confirm the institution and programme shown on CAPS before taking the next admission action.",
      actions: [
        { label: "Before You Accept", type: "link", value: "/guides/accept-jamb-admission" },
        { label: "My case is different", type: "topic", value: "complex" },
      ],
    },
    "caps-aip": {
      id: base,
      role: "assistant",
      text: "Admission in Progress means your admission record is still being processed. Keep monitoring CAPS and your institution’s official channels. It is not yet a final admission approval.",
      actions: [
        { label: "Read Full Guide", type: "link", value: "/guides/admission-in-progress-meaning" },
        { label: "My case is different", type: "topic", value: "complex" },
      ],
    },
    "caps-not-admitted": {
      id: base,
      role: "assistant",
      text: "NOT ADMITTED means no admission has been approved for you at that time. If the institution is still processing admissions, the status can still change. Do not assume the admission cycle is over until the institution says so.",
      actions: [
        { label: "Understand CAPS Status", type: "link", value: "/guides/understanding-jamb-caps-status" },
        { label: "Assess my situation", type: "topic", value: "consultation" },
      ],
    },
    olevel: {
      id: base,
      role: "assistant",
      text: "Your O'Level result should be correctly uploaded to your JAMB record for admission processing. After upload, confirm the exam type, year, subjects and grades. If the result is not reflecting or contains an error, visit an accredited JAMB CBT centre or JAMB office for proper correction.",
      actions: [
        { label: "Read O'Level Guide", type: "link", value: "/guides/olevel-upload-jamb-caps" },
        { label: "I have an upload problem", type: "topic", value: "complex" },
      ],
    },
    de: {
      id: base,
      role: "assistant",
      text: "Direct Entry is for candidates seeking admission into a higher level using an accepted qualification such as ND, NCE, HND, A-Level or another qualification recognised by the institution. Exact requirements depend on the school and programme.",
      actions: [
        { label: "View Opportunities", type: "link", value: "/opportunities" },
        { label: "Latest Updates", type: "link", value: "/updates" },
        { label: "Assess my DE case", type: "topic", value: "consultation" },
      ],
    },
    "accept-admission": {
      id: base,
      role: "assistant",
      text: "Before accepting admission on JAMB CAPS, confirm that the institution and programme displayed are correct. Once you are satisfied, follow the acceptance option on CAPS and keep evidence of the completed action.",
      actions: [{ label: "Read Acceptance Guide", type: "link", value: "/guides/accept-jamb-admission" }],
    },
    "change-course": {
      id: base,
      role: "assistant",
      text: "Change of Course or Institution is used when you need to update a JAMB choice. Before changing anything, confirm that the new institution is still accepting changes and that you meet the programme requirements. A change does not guarantee admission.",
      actions: [
        { label: "Check Opportunities", type: "link", value: "/opportunities" },
        { label: "My own case", type: "topic", value: "consultation" },
      ],
    },
    "school-vs-jamb": {
      id: base,
      role: "assistant",
      text: "An institution may first process or announce admission, but JAMB admission is important because the offer should ultimately reflect on JAMB CAPS. If your school portal and JAMB CAPS show different information, monitor both and follow official instructions.",
      actions: [{ label: "Read Full Guide", type: "link", value: "/guides/school-admission-vs-jamb-admission" }],
    },
    "lasu-aggregate": {
      id: base,
      role: "assistant",
      text: "For LASU, you can use the S.O.H CONSULTS Aggregate & Eligibility Checker to calculate your screening aggregate and compare your entered subjects with the programme requirements returned by the LASU source.",
      actions: [{ label: "Open LASU Calculator", type: "link", value: "/lasu-calculator" }],
    },
    consultation: {
      id: base,
      role: "assistant",
      text: "For a candidate-specific assessment, S.O.H CONSULTS offers Admission Consultation & Mentorship for ₦5,000. It includes a personalised assessment and continued admission-related guidance till admission. Admission itself is never guaranteed.",
      actions: [
        {
          label: "Continue on WhatsApp",
          type: "whatsapp",
          value: "Hello S.O.H CONSULTS, I want to get started with the ₦5,000 Admission Consultation & Mentorship programme.",
        },
      ],
    },
    complex: {
      id: base,
      role: "assistant",
      text: "This question depends on your personal admission details, so a generic answer may mislead you. S.O.H CONSULTS can assess your exact results, course, institution and admission situation under the ₦5,000 Consultation & Mentorship programme.",
      actions: [
        {
          label: "Chat with S.O.H CONSULTS",
          type: "whatsapp",
          value: "Hello S.O.H CONSULTS, I was using the Ask S.O.H assistant and I need personalised admission guidance.",
        },
      ],
    },
  };

  return map[topic] ?? {
    id: base,
    role: "assistant",
    text: "I don’t have a saved answer for that yet. I can check Google for a current answer and prioritise official sources.",
  };
}

function classifyQuestion(question: string): { topic?: string; link?: string; shouldSearch?: boolean } {
  const q = question.toLowerCase();

  if (/(my score|my result|my grade|my course|my case|my chances?|will i gain|can i gain|am i eligible|should i change|what course should|which course should|recommend.*course|admission chance)/.test(q)) {
    return { topic: "complex" };
  }

  if (/(aggregate|calculator|calculate.*lasu|lasu.*aggregate|screening score)/.test(q)) return { topic: "lasu-aggregate" };
  if (/(accept.*admission|how.*accept.*caps)/.test(q)) return { topic: "accept-admission" };
  if (/(change of course|change course|change of institution|change institution)/.test(q)) return { topic: "change-course" };
  if (/(school admission.*jamb|jamb admission.*school|school portal.*caps|caps.*school portal)/.test(q)) return { topic: "school-vs-jamb" };
  if (/(o.?level|waec|neco).*(upload|jamb|caps)|upload.*(result|waec|neco)/.test(q)) return { topic: "olevel" };
  if (/(direct entry|\bde\b)/.test(q) && !/(deadline|closing|form|screening|when|date|latest|current|2026)/.test(q)) return { topic: "de" };
  if (/(proposed)/.test(q)) return { topic: "caps-proposed" };
  if (/(recommended)/.test(q)) return { topic: "caps-recommended" };
  if (/(approved)/.test(q) && /(caps|admission)/.test(q)) return { topic: "caps-approved" };
  if (/(admission in progress|\baip\b)/.test(q)) return { topic: "caps-aip" };
  if (/(not admitted|no admission)/.test(q)) return { topic: "caps-not-admitted" };
  if (/(caps|admission status)/.test(q)) return { topic: "caps" };
  if (/(consult|mentor|mentorship)/.test(q)) return { topic: "consultation" };

  if (/(deadline|closing date|when.*close|form on sale|admission form|screening form|post utme|cut.?off|latest|current|today|this year|2026|2027|school fees|acceptance fee|date|registration open|registration close)/.test(q)) {
    return { shouldSearch: true };
  }

  if (/(opportunit|available form)/.test(q)) return { link: "/opportunities" };
  if (/(guide|how to check caps)/.test(q)) return { link: "/guides" };

  return { shouldSearch: true };
}

function buildSearchAnswer(payload: SearchPayload): Message {
  const official = payload.results.find((item) => item.official);
  const best = official ?? payload.results[0];

  if (!best) {
    return {
      id: Date.now() + 1,
      role: "assistant",
      text: "I couldn’t retrieve a reliable live result just now. You can open the Google search directly, or send the question to S.O.H CONSULTS if it is urgent.",
      actions: [
        { label: "Search Google", type: "external", value: payload.googleUrl },
        {
          label: "Ask S.O.H CONSULTS",
          type: "whatsapp",
          value: `Hello S.O.H CONSULTS, I need help confirming this information: ${payload.query}`,
        },
      ],
    };
  }

  const sourceLabel = best.official ? "an official source" : "the most relevant result";
  return {
    id: Date.now() + 1,
    role: "assistant",
    text: `I checked Google and prioritised official admission sources. From ${sourceLabel}: ${best.snippet} Please open the source before making a payment or taking an irreversible admission action.`,
    sources: payload.results.slice(0, 3),
    actions: [
      { label: "Open Best Source", type: "external", value: best.url },
      { label: "View Google Results", type: "external", value: payload.googleUrl },
    ],
  };
}

export default function AskSOH() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(true);
  const [searching, setSearching] = useState(false);

  const contextualQuestion = useMemo(() => {
    const lastUser = [...messages].reverse().find((message) => message.role === "user");
    return lastUser?.text ?? "an admission question";
  }, [messages]);

  function addAssistant(message: Message) {
    setMessages((current) => [...current, message]);
  }

  function choose(action: Action) {
    if (action.type === "link") {
      window.location.href = action.value;
      return;
    }

    if (action.type === "external") {
      window.open(action.value, "_blank", "noopener,noreferrer");
      return;
    }

    if (action.type === "whatsapp") {
      window.open(whatsappLink(action.value), "_blank", "noopener,noreferrer");
      return;
    }

    addAssistant(getTopicReply(action.value));
  }

  async function searchWeb(question: string) {
    setSearching(true);
    try {
      const response = await fetch(`/api/ask-soh/search?q=${encodeURIComponent(question)}`);
      const payload = (await response.json()) as SearchPayload;
      addAssistant(buildSearchAnswer(payload));
    } catch {
      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(`${question} Nigeria admission JAMB LASU`)}`;
      addAssistant({
        id: Date.now() + 1,
        role: "assistant",
        text: "Live search is temporarily unavailable. You can open the prepared Google search below instead.",
        actions: [
          { label: "Search Google", type: "external", value: googleUrl },
          {
            label: "Ask S.O.H CONSULTS",
            type: "whatsapp",
            value: `Hello S.O.H CONSULTS, I need help confirming this information: ${question}`,
          },
        ],
      });
    } finally {
      setSearching(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const question = input.trim();
    if (!question || searching) return;

    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", text: question },
    ]);
    setInput("");

    const match = classifyQuestion(question);

    window.setTimeout(() => {
      if (match.link) {
        addAssistant({
          id: Date.now() + 1,
          role: "assistant",
          text: "I have a dedicated S.O.H CONSULTS page for that. You can open it below.",
          actions: [{ label: "Open Relevant Page", type: "link", value: match.link }],
        });
        return;
      }

      if (match.topic) {
        addAssistant(getTopicReply(match.topic));
        return;
      }

      if (match.shouldSearch) {
        void searchWeb(question);
      }
    }, 120);
  }

  function reset() {
    setMessages([{ ...initialMessage, id: Date.now() }]);
    setInput("");
    setSearching(false);
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setUnread(false);
          }}
          className="fixed bottom-20 right-4 z-[80] flex items-center gap-2 rounded-full bg-green-700 px-4 py-3 text-sm font-black shadow-2xl ring-4 ring-white/90 transition hover:bg-green-800 sm:bottom-6 sm:right-6"
          style={{ color: "#ffffff" }}
          aria-label="Open Ask S.O.H admission assistant"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-lg" style={{ color: "#15803d" }}>
            S
          </span>
          Ask S.O.H
          {unread && <span className="h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />}
        </button>
      )}

      {open && (
        <section
          className="fixed inset-x-3 bottom-3 z-[90] flex max-h-[82vh] flex-col overflow-hidden rounded-3xl border border-green-100 bg-white shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[410px]"
          aria-label="Ask S.O.H admission assistant"
        >
          <header className="bg-gradient-to-r from-green-800 to-green-700 px-4 py-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="/soh-logo.jpg"
                  alt="S.O.H CONSULTS"
                  className="h-11 w-11 rounded-xl bg-white object-contain p-1"
                />
                <div>
                  <h2 className="text-base font-black">Ask S.O.H</h2>
                  <p className="text-xs font-medium text-green-50">Admission Assistant • Web Search</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full px-3 py-2 text-xs font-bold hover:bg-white/10"
                  style={{ color: "#ffffff" }}
                  aria-label="Restart Ask S.O.H"
                >
                  Restart
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-xl font-bold hover:bg-white/20"
                  style={{ color: "#ffffff" }}
                  aria-label="Close Ask S.O.H"
                >
                  ×
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-4 py-4">
            {messages.map((message) => (
              <div key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className="max-w-[90%]">
                  <div
                    className={
                      message.role === "user"
                        ? "rounded-2xl rounded-br-md bg-green-700 px-4 py-3 text-sm leading-6 shadow-sm"
                        : "rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm ring-1 ring-slate-200"
                    }
                    style={message.role === "user" ? { color: "#ffffff" } : undefined}
                  >
                    {message.text}
                  </div>

                  {!!message.sources?.length && (
                    <div className="mt-2 space-y-2">
                      {message.sources.map((source) => (
                        <a
                          key={source.url}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-green-300 hover:bg-green-50"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-black text-slate-900">{source.title}</p>
                            {source.official && (
                              <span className="shrink-0 rounded-full bg-green-100 px-2 py-1 text-[9px] font-black uppercase text-green-800">
                                Official
                              </span>
                            )}
                          </div>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500">{source.snippet}</p>
                        </a>
                      ))}
                    </div>
                  )}

                  {!!message.actions?.length && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.actions.map((action) => (
                        <button
                          type="button"
                          key={`${message.id}-${action.label}`}
                          onClick={() => choose(action)}
                          className={
                            action.type === "whatsapp"
                              ? "rounded-full bg-green-700 px-3 py-2 text-xs font-black shadow-sm hover:bg-green-800"
                              : action.type === "external"
                                ? "rounded-full bg-red-600 px-3 py-2 text-xs font-black shadow-sm hover:bg-red-700"
                                : "rounded-full border border-green-200 bg-white px-3 py-2 text-xs font-bold text-green-800 shadow-sm hover:bg-green-50"
                          }
                          style={action.type === "whatsapp" || action.type === "external" ? { color: "#ffffff" } : undefined}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {searching && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
                  Checking Google and official sources...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={submit} className="border-t border-slate-200 bg-white p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask an admission question..."
                disabled={searching}
                className="min-w-0 flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-slate-100"
                aria-label="Ask S.O.H question"
              />
              <button
                type="submit"
                disabled={searching}
                className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-black shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ color: "#ffffff" }}
              >
                {searching ? "..." : "Send"}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 px-1">
              <p className="text-[10px] leading-4 text-slate-500">S.O.H guidance + live web search. Verify important decisions.</p>
              <a
                href={whatsappLink(`Hello S.O.H CONSULTS, I was using the Ask S.O.H assistant and I need help with: ${contextualQuestion}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-[10px] font-black text-green-700 hover:text-green-800"
              >
                Talk to S.O.H →
              </a>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
