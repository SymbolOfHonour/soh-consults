import EmailObfuscationBoundary from "../components/EmailObfuscationBoundary";
import {withPublicSocial} from "../../lib/public-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = withPublicSocial({
  title: "Privacy Policy",
  description: "How S.O.H CONSULTS handles information shared through its website and contact channels.",
  alternates: { canonical: "/privacy-policy" },
});

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#faf8f2] px-5 py-12 text-[#102720]">
      <article className="mx-auto max-w-3xl space-y-6 leading-7">
        <a href="/" className="font-bold text-[#075738] hover:underline">← Back to Home</a>
        <h1 className="text-4xl font-black">Privacy Policy</h1>
        <p>S.O.H CONSULTS provides admission guidance, educational information and online tools. This page explains how information may be handled when you use our website or contact us.</p>
        <section><h2 className="text-2xl font-bold">Information you provide</h2><p>When you contact us through WhatsApp or email, you may choose to share your name, contact details and information relevant to your enquiry. Please do not send passwords, payment card details or other unnecessary sensitive information.</p></section>
        <section><h2 className="text-2xl font-bold">Website usage</h2><p>Our website uses technical services for hosting, website operation and usage analytics. These services may process technical information such as page visits, device information and IP addresses to operate, protect and understand website performance. Some services may use cookies or similar technologies.</p></section>
        <section><h2 className="text-2xl font-bold">Why information is used</h2><p>Information you share is used to respond to enquiries and provide the assistance you request. Technical information supports website operation, security and performance measurement.</p></section>
        <section><h2 className="text-2xl font-bold">External services</h2><p>Links to WhatsApp, email, official educational websites and other third-party services take you to platforms with their own privacy practices. Please review their policies when using them.</p></section>
        <section><h2 className="text-2xl font-bold">Advertising</h2><p>This website integrates Google AdSense. Google and its partners may use cookies or similar technologies to serve and measure advertisements based on visits to this and other websites when ads are available. You can review Google’s privacy practices and manage advertising preferences through Google’s privacy and advertising controls. Editorial ad units remain disabled until enabled by the site owner. <a className="font-bold underline" href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Google advertising privacy information</a> and <a className="font-bold underline" href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer">ad preferences</a>.</p></section>
        <section><h2 className="text-2xl font-bold">Questions</h2><p>For privacy questions or requests concerning information you have shared with us, contact <EmailObfuscationBoundary/><a className="font-bold text-[#075738] underline" href="mailto:oluyepeadetayo@gmail.com">oluyepeadetayo@gmail.com</a><EmailObfuscationBoundary end/> or <a className="font-bold text-[#075738] underline" href="https://wa.me/2348182141088">WhatsApp S.O.H CONSULTS</a>.</p></section>
      </article>
    </main>
  );
}
