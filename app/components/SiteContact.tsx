import BusinessContacts from "./BusinessContacts";
import ServiceEnquiry from "./ServiceEnquiry";
export default function SiteContact() {
  return (
    <section id="contact" className="scroll-mt-24 py-12">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="rounded-3xl bg-green-900 p-8 text-white sm:p-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="font-bold uppercase tracking-widest text-green-300">Contact Us</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Need help with admission?</h2>
              <p className="mt-5 max-w-xl leading-8 text-green-50">Send us a message on WhatsApp and tell us what you need help with. We&apos;ll guide you on the next step.</p>
            </div>

            <div><ServiceEnquiry/><BusinessContacts/>
          </div></div>
        </div>
      </div>
    </section>
  );
}
