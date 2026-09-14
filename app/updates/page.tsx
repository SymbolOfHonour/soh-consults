import SiteContact from "../components/SiteContact";
import UpdatesExplorer from "../components/UpdatesExplorer";

const WHATSAPP_NUMBER = "2348182141088";

const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export default function UpdatesPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <img src="/soh-logo.jpg" alt="S.O.H CONSULTS" className="h-16 w-auto object-contain" />
          </a>

          <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
            <a href="/" className="transition hover:text-green-700">Home</a>
            <a href="/updates" className="text-green-700">Latest Updates</a>
            <a href="/opportunities" className="transition hover:text-green-700">Opportunities</a>
            <a href="/deadlines" className="transition hover:text-green-700">Deadlines</a>
            <a href="/guides" className="transition hover:text-green-700">Guides</a>
            <a href="/lasu-calculator" className="transition hover:text-green-700">LASU Calculator</a>
          </nav>

          <a
            href={whatsappLink("Hello S.O.H CONSULTS, I need assistance with an admission or educational service.")}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800"
          >
            WhatsApp Us
          </a>
        </div>
      </header>

      <section className="bg-gradient-to-br from-green-950 via-green-900 to-green-700 py-16 text-white">
        <div className="mx-auto max-w-5xl px-5 text-center lg:px-8">
          <p className="font-bold uppercase tracking-widest text-green-300">S.O.H CONSULTS</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">Latest Updates</h1>
          <p className="mx-auto mt-5 max-w-2xl leading-8 text-green-50">
            Important admission, JAMB and education updates simplified for students and applicants.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <UpdatesExplorer />
        </div>
      </section>
    <SiteContact />

    </main>
  );
}
