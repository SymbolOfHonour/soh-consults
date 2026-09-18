export default function SiteContact() {
  return (
    <section id="contact" className="scroll-mt-24 py-12">
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
                help with. We&apos;ll guide you on the next step.
              </p>
            </div>

            <div className="space-y-4">
              <a
                href="https://wa.me/2348182141088?text=Hello%20S.O.H%20CONSULTS%2C%20I%20would%20like%20to%20make%20an%20enquiry."
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl bg-white p-5 text-green-900 transition hover:bg-green-50"
              >
                <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                  WhatsApp
                </p>
                <p className="mt-1 text-xl font-black">0818 214 1088</p>
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

              <a
                href="https://www.instagram.com/oluyepeadetayo/"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl bg-white p-5 text-green-900 transition hover:bg-green-50"
              >
                <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                  Instagram
                </p>
                <p className="mt-1 font-black">@oluyepeadetayo</p>
              </a>

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
  );
}
