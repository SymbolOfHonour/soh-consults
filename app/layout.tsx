import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "S.O.H CONSULTS | Admission, Education & Consultation",
    template: "%s | S.O.H CONSULTS",
  },
  description:
    "S.O.H CONSULTS provides admission guidance, educational updates, JAMB support, application assistance and the LASU Aggregate & Eligibility Checker.",
  keywords: [
    "S.O.H CONSULTS",
    "LASU aggregate calculator",
    "LASU admission",
    "admission opportunities Nigeria",
    "JAMB services",
    "education updates Nigeria",
    "admission guidance",
  ],
  authors: [{ name: "S.O.H CONSULTS" }],
  creator: "S.O.H CONSULTS",
  publisher: "S.O.H CONSULTS",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    title: "S.O.H CONSULTS | Admission, Education & Consultation",
    description:
      "Admission guidance, educational opportunities, JAMB support and the LASU Aggregate & Eligibility Checker.",
    siteName: "S.O.H CONSULTS",
  },
  verification: {
    google: "BdoiW3GoHdajYLbbLSmm-UQpo3YrjBAAWT2NpoKTcBs",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
