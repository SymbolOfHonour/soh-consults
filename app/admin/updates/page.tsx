import type {Metadata} from "next";
import AdminUpdatesClient from "./AdminUpdatesClient";
import AdminUpdateSearch from "./AdminUpdateSearch";
import AdminUpdatesEnhancements from "./AdminUpdatesEnhancements";
import AdminContentControls from "./AdminContentControls";
import SourcePreview from "./SourcePreview";
export const metadata:Metadata={title:"Update Approval Queue",robots:{index:false,follow:false}};
export default function AdminUpdatesPage(){return <><div className="mx-auto flex max-w-[1500px] flex-wrap gap-3 px-4 pt-4 md:px-6"><a href="/admin/updates/new" className="inline-flex w-full items-center justify-center rounded-xl bg-green-800 px-5 py-4 text-center text-base font-black text-white shadow-sm sm:w-auto">+ Create update with visual editor →</a><a href="/admin/updates/edit" className="inline-flex w-full items-center justify-center rounded-xl border border-green-700 bg-white px-5 py-4 text-center text-base font-black text-green-800 sm:w-auto">Edit existing update with visual editor →</a><a href="/admin/insights" className="inline-flex items-center rounded-xl border bg-white px-5 py-4 text-sm font-black text-green-800">Publishing insights</a><a href="/admin/backups" className="inline-flex items-center rounded-xl border bg-white px-5 py-4 text-sm font-black text-green-800">Backups & recovery</a></div><AdminUpdatesClient/><div className="mx-auto max-w-[1500px] px-4 md:px-6"><AdminUpdatesEnhancements section="gallery"/><SourcePreview/><AdminContentControls/></div><AdminUpdateSearch/><AdminUpdatesEnhancements section="bulk"/></>}
