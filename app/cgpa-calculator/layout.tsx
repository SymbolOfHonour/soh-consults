import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "CGPA Calculator & Simulator",
  description: "Calculate your semester GPA, current CGPA and simulate the GPA required to reach your target CGPA using LASU or a general Nigerian 5.0 grading system.",
  alternates: { canonical: "/cgpa-calculator" },
};

export default function CgpaCalculatorLayout({ children }: { children: ReactNode }) {
  return children;
}
