import type { Metadata } from "next";
import FounderProfile from "../../components/FounderProfile";
export const metadata: Metadata = { title: "About S.O.H CONSULTS", description: "Learn about S.O.H CONSULTS and its founder, Oluyepe Adetayo Sunday." };
export default function AboutPage() {
  return <main className="min-h-screen bg-[#faf8f2] px-4 py-8 text-[#102720] sm:px-5 sm:py-12"><div className="mx-auto max-w-5xl"><a href="/" className="font-bold text-[#075738] hover:underline">← Back to Home</a><div className="mt-6"><FounderProfile /></div></div></main>;
}
