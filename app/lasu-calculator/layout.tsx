import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "LASU Aggregate Calculator & Eligibility Checker",
  description:
    "Calculate your LASU admission aggregate and check programme eligibility using your UTME and O'Level results with the S.O.H CONSULTS LASU calculator.",
  keywords: [
    "LASU aggregate calculator",
    "LASU eligibility checker",
    "LASU admission calculator",
    "LASU screening aggregate",
    "LASU course requirements",
  ],
  alternates: { canonical: "/lasu-calculator" },
  openGraph: {
    title: "LASU Aggregate Calculator & Eligibility Checker",
    description:
      "Calculate your LASU aggregate score and check programme eligibility with S.O.H CONSULTS.",
    url: "/lasu-calculator",
  },
};

export default function LasuCalculatorLayout({ children }: { children: ReactNode }) {
  return children;
}
