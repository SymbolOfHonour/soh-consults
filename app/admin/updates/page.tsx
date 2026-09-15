import type { Metadata } from "next";
import AdminUpdatesClient from "./AdminUpdatesClient";

export const metadata: Metadata = { title: "Update Approval Queue", robots: { index: false, follow: false } };

export default function AdminUpdatesPage() {
  return <AdminUpdatesClient />;
}

