import {withPublicSocial} from "../../lib/public-metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";
export const metadata: Metadata = withPublicSocial({ title: "JAMB CAPS & Admission Guides", description: "Understand JAMB CAPS, admission status, O'Level uploads and other admission processes with S.O.H CONSULTS.", alternates: { canonical: "/guides" } });
export default function Layout({children}:{children:ReactNode}) { return children; }
