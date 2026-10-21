import { redirect } from "next/navigation";
import { isAdmin } from "../../../lib/admin-auth";
import TeamManager from "./TeamManager";
export default async function TeamPage() {
  if (!(await isAdmin())) redirect("/admin/updates");
  return <TeamManager />;
}
