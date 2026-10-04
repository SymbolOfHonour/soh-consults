import {withPublicSocial} from "../../lib/public-metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = withPublicSocial({
  title: "Latest Admission & Education Updates",
  description:
    "Read current admission, JAMB and education updates from S.O.H CONSULTS, including application notices, admission status information and important deadlines.",
  alternates: { canonical: "/updates" },
  openGraph: {
    title: "Latest Admission & Education Updates",
    description: "Current admission, JAMB and education updates from S.O.H CONSULTS.",
    url: "/updates",
  },
});

export default function UpdatesLayout({ children }: { children: ReactNode }) {
  return children;
}
