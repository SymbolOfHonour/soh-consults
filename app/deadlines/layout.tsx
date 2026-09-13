import type { Metadata } from "next";
import type { ReactNode } from "react";
export const metadata: Metadata = { title: "Admission Deadline Tracker", description: "Track admission application deadlines and open opportunities with S.O.H CONSULTS.", alternates: { canonical: "/deadlines" } };
export default function Layout({children}:{children:ReactNode}) { return children; }
