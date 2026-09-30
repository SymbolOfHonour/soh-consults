import type { Metadata } from "next";
import HomepageServer from "./homepage-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default HomepageServer;
