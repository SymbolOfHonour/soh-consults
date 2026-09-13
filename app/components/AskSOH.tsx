"use client";

import { FormEvent, useMemo, useState } from "react";

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
  actions?: Action[];
};

type Action = {
  label: string;
  type: "topic" | "link" | "whatsapp";
  value: string;
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
  { label: "Talk to S.O.H", type: "topic", value: "consultation" },
];

const initialMessage: Message = {
  id: 1,
  role: "assistant",
  text: "Hi 👋 I’m Ask S.O.H, your guided admission assistant. Choose a topic below or type a simple admission question. For personal or complex cases, I’ll connect you directly with S.O.H CONSULTS.",
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
      text: "What does your JAMB CAPS currently show?",
      actions: capsActions(),
    },
    "caps-proposed": {
      id: base,
      role: "assistant",
      text: "PROPOSED FOR ADMISSION means your institution has proposed you for admission. The process is still ongoing and has not yet reached final JAMB approval.",
      actions: [
        { label: "Read CAPS Guide", type: "link", value: "/guides/understanding-jamb-caps-status" },
        { label: "My case is different", type: "topic", value: "complex" },
      ],
    },
    "caps-recommended": {
      id: base,
      role: "assistant",
      text: "RECOMMENDED FOR ADMISSION means your institution has put you forward for admission and the recommendation is being processed for JAMB approval.",
      actions: [
        { label: "Read CAPS Guide", type: "link", value: "/guides/understanding-jamb-caps-status" },
        { label: "My case is different", type: "topic", value: "complex" },
      ],
    },
    "caps-approved": {
      id: base,
      role: "assistant",
      text: "APPROVED FOR ADMISSION means JAMB has approved the admission recommendation. Confirm the institution and programme shown on CAPS and follow the official next steps.",
      actions: [
        { label: "Before You Accept", type: "link", value: "/guides/accept-jamb-admission" },
        { label: "My case is different", type: "topic", value: "complex" },
      ],
    },
    "caps-aip": {
      id: base,
      role: "assistant",
      text: "Admission in Progress generally means your admission record is still being processed. Keep monitoring CAPS and your institution’s official channels. It is not yet a final admission approval.",
      actions: [
        { label: "Read Full Guide", type: "link", value: "/guides/admission-in-progress-meaning" },
        { label: "My case is different", type: "topic", value: "complex" },
      ],
    },
    "caps-not-admitted": {
      id: base,
      role: "assistant",
      text: "NOT ADMITTED means no admission has been approved for you at that time. If your institution is still processing admissions, the status may still change. Keep checking only official channels.",
      actions: [
        { label: "Understand CAPS Status", type: "link", value: "/guides/understanding-jamb-caps-status" },
        { label: "Assess my situation", type: "topic", value: "consultation" },
      ],
    },
    olevel: {
      id: base,
      role: "assistant",
      text: "Your O'Level result should be correctly reflected on your JAMB record because institutions use it during admission processing. Check the exam type, year, subjects and grades carefully after upload.",
      actions: [
        { label: "Read O'Level Guide", type: "link", value: "/guides/olevel-upload-jamb-caps" },
        { label: "I have an upload problem", type: "topic", value: "complex" },
      ],
    },
    de: {
      id: base,
      role: "assistant",
      text: "For Direct Entry, requirements depend on your institution, programme and qualification. You can check current opportunities and updates here. If you want advice about your own qualification or course, that needs personalised guidance.",
      actions: [
        { label: "View Opportunities", type: "link", value: "/opportunities" },
        { label: "Latest Updates", type: "link", value: "/updates" },
        { label: "Assess my DE case", type: "topic", value: "consultation" },
      ],
    },
    consultation: {
      id: base,
      role: "assistant",
      text: "Need guidance specific to your own admission situation? S.O.H CONSULTS offers Admission Consultation & Mentorship for ₦5,000. It includes a personalised assessment and continued admission-related guidance till admission. Admission itself is never guaranteed.",
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
      text: "This needs personalised guidance because the right answer may depend on your specific results, course, institution or admission history. I won’t guess. You can continue directly with S.O.H CONSULTS.",
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
    text: "I don’t have a verified guided answer for that yet, so I won’t guess. Please continue with S.O.H CONSULTS for personalised guidance.",
    actions: [
      {
        label: "Continue on WhatsApp",
        type: "whatsapp",
        value: "Hello S.O.H CONSULTS, I was using the Ask S.O.H assistant and I need help with an admission question.",
      },
    ],
  };
}

function classifyQuestion(question: string): { topic?: string; link?: string } {
  const q = question.toLowerCase();

  if (/(aggregate|calculator|calculate|lasu score|screening score)/.test(q)) return { link: "/lasu-calculator" };
  if (/(deadline|closing date|close|application date)/.test(q)) return { link: "/deadlines" };
  if (/(opportunit|form on sale|admission form|available form|school form)/.test(q)) return { link: "/opportunities" };
  if (/(guide|how to|explain admission)/.test(q)) return { link: "/guides" };
  if (/(o.?level|waec|neco).*(upload|jamb|caps)|upload.*(result|waec|neco)/.test(q)) return { topic: "olevel" };
  if (/(direct entry|\bde\b)/.test(q)) return { topic: "de" };
  if (/(proposed)/.test(q)) return { topic: "caps-proposed" };
  if (/(recommended)/.test(q)) return { topic: "caps-recommended" };
  if (/(approved)/.test(q)) return { topic: "caps-approved" };
  if (/(admission in progress|aip)/.test(q)) return { topic: "caps-aip" };
  if (/(not admitted|no admission)/.test(q)) return { topic: "caps-not-admitted" };
  if (/(caps|admission status)/.test(q)) return { topic: "caps" };
  if (/(consult|mentor|mentorship|personal|my score|my result|my course|my case|chance|eligible|eligibility|change of course|change of institution)/.test(q)) return { topic: "complex" };

  return {};
}

export default function AskSOH() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(true);

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

    if (action.type === "whatsapp") {
      window.open(whatsappLink(action.value), "_blank", "noopener,noreferrer");
      return;
    }

    addAssistant(getTopicReply(action.value));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;

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
          text: "I have a verified tool/page for that. Use the button below to continue.",
          actions: [{ label: "Open Relevant Page", type: "link", value: match.link }],
        });
        return;
      }

      if (match.topic) {
        addAssistant(getTopicReply(match.topic));
        return;
      }

      addAssistant({
        id: Date.now() + 1,
        role: "assistant",
        text: "I don’t have a verified guided answer for that question yet, and I don’t want to give you incorrect admission advice. Please continue with S.O.H CONSULTS for direct guidance.",
        actions: [
          {
            label: "Continue on WhatsApp",
            type: "whatsapp",
            value: `Hello S.O.H CONSULTS, I was using the Ask S.O.H assistant and I need help with: ${question}`,
          },
        ],
      });
    }, 180);
  }

  function reset() {
    setMessages([{ ...initialMessage, id: Date.now() }]);
    setInput("");
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
          className="fixed inset-x-3 bottom-3 z-[90] flex max-h-[82vh] flex-col overflow-hidden rounded-3xl border border-green-100 bg-white shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[390px]"
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
                  <p className="text-xs font-medium text-green-50">Guided Admission Assistant</p>
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
                <div className="max-w-[88%]">
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
                              : "rounded-full border border-green-200 bg-white px-3 py-2 text-xs font-bold text-green-800 shadow-sm hover:bg-green-50"
                          }
                          style={action.type === "whatsapp" ? { color: "#ffffff" } : undefined}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={submit} className="border-t border-slate-200 bg-white p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask a simple admission question..."
                className="min-w-0 flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                aria-label="Ask S.O.H question"
              />
              <button
                type="submit"
                className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-black shadow-sm hover:bg-red-700"
                style={{ color: "#ffffff" }}
              >
                Send
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 px-1">
              <p className="text-[10px] leading-4 text-slate-500">Guided answers only. No admission guarantee.</p>
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
