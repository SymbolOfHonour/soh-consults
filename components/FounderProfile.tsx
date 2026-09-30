const biography = `Behind **S.O.H CONSULTS** is a story built on persistence, experience, service and the belief that the right guidance can make a significant difference in a student’s academic journey.

**Oluyepe Adetayo Sunday**, popularly known as **S.O.H (Symbol Of Honour)**, is the Founder of **S.O.H CONSULTS**, an education and admission support platform providing **admission guidance, registration assistance, JAMB services, documentation support, educational updates and access to relevant opportunities** for students and prospective applicants.

### 𝗔 𝗝𝗢𝗨𝗥𝗡𝗘𝗬 𝗧𝗛𝗔𝗧 𝗦𝗛𝗔𝗣𝗘𝗗 𝗧𝗛𝗘 𝗩𝗜𝗦𝗜𝗢𝗡

Oluyepe’s passion for educational guidance is deeply connected to his personal experience.

Before gaining admission into **Lagos State University (LASU)**, he wrote the **Unified Tertiary Matriculation Examination (UTME) six times**, eventually securing university admission on his sixth attempt.

The journey exposed him firsthand to the uncertainty, frustration and complexity that can accompany the admission process. It also taught him the importance of **accurate information, patience, persistence and having the right guidance at the right time**.

After gaining admission into LASU, he studied **Marketing**, earning a **Bachelor of Science (B.Sc.) in Marketing**.

Rather than allowing his admission experience to remain simply a personal story, Oluyepe transformed the lessons from that journey into a commitment to helping others make educational decisions with greater clarity and confidence.

What could have remained a personal struggle became part of the foundation upon which **S.O.H CONSULTS** was built.

### 𝗙𝗥𝗢𝗠 𝗦𝗧𝗨𝗗𝗘𝗡𝗧 𝗧𝗢 𝗦𝗧𝗨𝗗𝗘𝗡𝗧 𝗟𝗘𝗔𝗗𝗘𝗥

His university journey was also characterised by years of **student leadership, representation and service**.

Beginning from serving as a **Head of Class**, Oluyepe progressed through representative, communication and administrative positions within different student organisations.

Among his leadership roles, he served as a **MASSA-LASU Students’ Representative Council Member**, **MASSA-LASU Public Relations Officer**, **General Secretary of NAOSS-LASU**, and ultimately emerged as the **35th General Secretary of the Lagos State University Students’ Union (LASUSU)**.

As General Secretary, he served as **Head of Administration of the Students’ Union**, supporting the administration of the Union across the University’s campuses.

These experiences strengthened his understanding of **communication, administration, mediation, responsibility, teamwork, student engagement and service delivery**, principles that continue to influence the development of S.O.H CONSULTS.

### 𝗧𝗛𝗘 𝗕𝗜𝗥𝗧𝗛 𝗢𝗙 𝗦.𝗢.𝗛 𝗖𝗢𝗡𝗦𝗨𝗟𝗧𝗦

S.O.H CONSULTS grew from a simple understanding: **many students do not miss opportunities because they lack potential. Sometimes, they simply lack timely information, clear direction and proper guidance.**

Admission processes can be complicated. Requirements vary between institutions, deadlines can easily be missed, and processes involving **JAMB CAPS, O’Level uploads, screening exercises, applications, documentation and registration** can become overwhelming, particularly for applicants navigating tertiary admission for the first time.

S.O.H CONSULTS exists to help bridge that information and guidance gap.

What began as **S.O.H EDU-HUB** has grown into **S.O.H CONSULTS**, reflecting a broader vision to support students and prospective applicants across different Nigerian tertiary institutions.

The brand is **not limited to LASU**. Its focus extends to admission processes, educational information and opportunities across universities, polytechnics, colleges and other institutions.

### 𝗪𝗛𝗔𝗧 𝗦.𝗢.𝗛 𝗖𝗢𝗡𝗦𝗨𝗟𝗧𝗦 𝗦𝗧𝗔𝗡𝗗𝗦 𝗙𝗢𝗥

The goal is straightforward: **make important educational information easier to understand and help students and applicants take the right steps at the right time.**

Through S.O.H CONSULTS, students and prospective applicants can access assistance relating to **Post-UTME, Direct Entry and screening registration, admission guidance, JAMB services, O’Level uploads, educational documentation, school applications, admission processes and other academic services.**

Beyond providing services, S.O.H CONSULTS also delivers **educational news, admission updates, opportunities and practical information** designed to help students remain informed about developments that may affect their academic journey.

### 𝗧𝗛𝗘 𝗩𝗜𝗦𝗜𝗢𝗡 𝗔𝗛𝗘𝗔𝗗

For Oluyepe, **S.O.H CONSULTS is more than a business built around registrations and admission services.**

It represents the lessons of a journey that required persistence and the decision to use those experiences to make the journey easier for someone else.

The long-term vision is to build S.O.H CONSULTS into a **trusted education-support platform** where students and prospective applicants can find credible information, useful tools, relevant opportunities and dependable guidance throughout important stages of their educational journey.

From writing UTME six times before gaining university admission, to becoming a **Marketing graduate, student leader and Founder of an education-focused platform**, Oluyepe’s journey continues to reinforce the philosophy behind the brand:

**Sometimes, the difference between uncertainty and progress is having the right guidance.**

**Oluyepe Adetayo Sunday**
**Founder, S.O.H CONSULTS · B.Sc. Marketing**

𝗦.𝗢.𝗛 𝗖𝗢𝗡𝗦𝗨𝗟𝗧𝗦
𝗬𝗼𝘂𝗿 𝗚𝘂𝗶𝗱𝗲. 𝗬𝗼𝘂𝗿 𝗦𝘂𝗰𝗰𝗲𝘀𝘀.`;

function Emphasis({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part)}</>;
}

export default function FounderProfile() {
  return <section aria-labelledby="founder-heading" className="rounded-2xl border border-[#e2e5dc] bg-white p-5 shadow-sm sm:p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <img src="/founder.jpg" alt="Oluyepe Adetayo Sunday, founder of S.O.H CONSULTS" className="h-44 w-36 shrink-0 rounded-xl object-cover object-top sm:h-48" />
      <div className="min-w-0">
        <p className="text-sm font-bold text-[#087245]">𝗠𝗘𝗘𝗧 𝗧𝗛𝗘 𝗙𝗢𝗨𝗡𝗗𝗘𝗥</p>
        <h2 id="founder-heading" className="mt-2 text-2xl font-black sm:text-3xl">Oluyepe Adetayo Sunday</h2>
        <p className="mt-2 font-bold text-[#075738]">Founder, S.O.H CONSULTS · B.Sc. Marketing</p>
        <div className="mt-5 space-y-4 text-base leading-7 text-[#52615a]">
          {biography.split("\n\n").map((part, i) => part.startsWith("### ") ? <h3 key={i} className="break-words pt-4 text-lg font-black text-[#102720]">{part.slice(4)}</h3> : <p key={i} className="whitespace-pre-line"><Emphasis text={part} /></p>)}
        </div>
      </div>
    </div>
  </section>;
}
