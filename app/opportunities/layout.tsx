import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Admission Opportunities in Nigeria",
  description:
    "Browse current university, polytechnic, college and other admission opportunities, application information and deadlines from S.O.H CONSULTS.",
  alternates: { canonical: "/opportunities" },
  openGraph: {
    title: "Admission Opportunities in Nigeria",
    description: "Browse current admission opportunities and application information from S.O.H CONSULTS.",
    url: "/opportunities",
  },
};

export default function OpportunitiesLayout({ children }: { children: ReactNode }) {
  return children;
}
