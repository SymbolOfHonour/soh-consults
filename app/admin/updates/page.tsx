import type { Metadata } from "next";
import AdminUpdatesClient from "./AdminUpdatesClient";
import AdminUpdateSearch from "./AdminUpdateSearch";

export const metadata: Metadata = { title: "Update Approval Queue", robots: { index: false, follow: false } };

export default function AdminUpdatesPage() {
  return <><AdminUpdatesClient /><AdminUpdateSearch /></>;
}
