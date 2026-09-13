import type { Metadata } from "next";
import type { ReactNode } from "react";

const siteUrl = "https://soh-consults.vercel.app";
const pageUrl = `${siteUrl}/lasu-calculator`;

export const metadata: Metadata = {
  title: "LASU Aggregate Calculator & Eligibility Checker 2026/2027",

  description:
    "Calculate your LASU aggregate score, check UTME and O'Level requirements, and estimate programme eligibility with the S.O.H CONSULTS LASU Aggregate Calculator.",

  keywords: [
    "LASU aggregate calculator",
    "LASU aggregate score calculator",
    "LASU eligibility checker",
    "LASU admission calculator",
    "LASU screening calculator",
    "LASU screening aggregate",
    "LASU aggregate score 2026",
    "LASU aggregate score 2026/2027",
    "how to calculate LASU aggregate score",
    "LASU course requirements",
    "LASU O Level requirements",
    "LASU JAMB requirements",
    "Lagos State University aggregate calculator",
  ],

  alternates: {
    canonical: pageUrl,
  },

  openGraph: {
    type: "website",
    url: pageUrl,
    siteName: "S.O.H CONSULTS",
    title: "LASU Aggregate Calculator & Eligibility Checker 2026/2027",
    description:
      "Calculate your LASU aggregate score and check programme eligibility using your UTME and O'Level results.",
  },

  twitter: {
    card: "summary",
    title: "LASU Aggregate Calculator & Eligibility Checker",
    description:
      "Calculate your LASU aggregate score and check UTME and O'Level eligibility with S.O.H CONSULTS.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How is the LASU aggregate score calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "The S.O.H CONSULTS checker calculates the UTME component as JAMB score multiplied by 0.15, giving a maximum of 60 points, then adds points from the best five relevant O'Level grades for a maximum of 40 points. The estimated aggregate is scored out of 100.",
      },
    },
    {
      "@type": "Question",
      name: "What UTME score does the LASU checker use as the minimum?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "The checker currently uses 195 as the minimum UTME score for its eligibility validation.",
      },
    },
    {
      "@type": "Question",
      name: "Does the LASU calculator check course requirements?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Yes. When a programme is selected, the checker loads its available UTME and O'Level requirements and compares them with the subjects and grades entered by the candidate.",
      },
    },
    {
      "@type": "Question",
      name: "Does a high LASU aggregate score guarantee admission?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "No. The calculator is for guidance only. Admission still depends on the official LASU and JAMB admission process, programme requirements, available spaces and other applicable conditions.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use the checker for any LASU undergraduate programme?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "The calculator loads the available LASU programme list. Candidates can select their intended course, view the available requirements and run the eligibility check using their own results.",
      },
    },
  ],
};

const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "LASU Aggregate Calculator & Eligibility Checker",
  url: pageUrl,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any",
  isAccessibleForFree: true,
  provider: {
    "@type": "Organization",
    name: "S.O.H CONSULTS",
    url: siteUrl,
  },
  description:
    "An educational calculator for estimating LASU admission aggregate scores and checking entered UTME and O'Level subjects against available programme requirements.",
};

export default function LasuCalculatorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationSchema).replace(/</g, "\\u003c"),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
        }}
      />

      {children}
    </>
  );
}
