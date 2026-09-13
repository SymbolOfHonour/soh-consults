import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "./site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "S.O.H CONSULTS | Admission, Education & Consultation",
    template: "%s | S.O.H CONSULTS",
  },
  description:
    "S.O.H CONSULTS provides admission guidance, education updates, JAMB support, application assistance and a LASU aggregate and eligibility calculator.",
  applicationName: "S.O.H CONSULTS",
  keywords: [
    "S.O.H CONSULTS",
    "LASU admission",
    "LASU aggregate calculator",
    "LASU eligibility checker",
    "JAMB admission",
    "JAMB CAPS",
    "admission opportunities Nigeria",
    "education consultation Nigeria",
  ],
  authors: [{ name: "S.O.H CONSULTS" }],
  creator: "S.O.H CONSULTS",
  publisher: "S.O.H CONSULTS",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "/",
    siteName: "S.O.H CONSULTS",
    title: "S.O.H CONSULTS | Your Guide. Your Success.",
    description:
      "Admission guidance, education updates, application support and useful tools for students and prospective applicants.",
  },
  twitter: {
    card: "summary",
    title: "S.O.H CONSULTS | Your Guide. Your Success.",
    description:
      "Admission guidance, education updates, application support and useful tools for students and prospective applicants.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "S.O.H CONSULTS",
    url: siteUrl,
    slogan: "Your Guide. Your Success.",
    description:
      "Education and admission support platform providing admission guidance, application assistance, JAMB services, documentation support and educational information.",
    sameAs: ["https://www.instagram.com/oluyepeadetayo/"],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+2348182141088",
      contactType: "customer service",
      availableLanguage: "English",
    },
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
    </html>
  );
}
