"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
export default function AdminLogoutButton(){const[busy,setBusy]=useState(false);const router=useRouter();async function logout(){setBusy(true);try{await fetch("/api/admin/login",{method:"DELETE"});router.replace("/admin/updates");router.refresh();}finally{setBusy(false)}}return <button type="button" onClick={logout} disabled={busy} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700 hover:bg-red-100 disabled:opacity-60">{busy?"Logging out...":"Log Out"}</button>}
