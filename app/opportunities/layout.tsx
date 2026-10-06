import type { Viewport } from "next";
export const viewport:Viewport={width:"device-width",initialScale:1,userScalable:true};
import {withPublicSocial} from "../../lib/public-metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = withPublicSocial({
  title: "Admission Opportunities in Nigeria",
  description:
    "Browse current university, polytechnic, college and other admission opportunities, application information and deadlines from S.O.H CONSULTS.",
  alternates: { canonical: "/opportunities" },
  openGraph: {
    title: "Admission Opportunities in Nigeria",
    description: "Browse current admission opportunities and application information from S.O.H CONSULTS.",
    url: "/opportunities",
  },
});

export default function OpportunitiesLayout({ children }: { children: ReactNode }) {
  return children;
}
