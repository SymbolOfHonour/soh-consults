import type {Metadata} from "next";
import AdminUpdatesClient from "./AdminUpdatesClient";
import AdminUpdateSearch from "./AdminUpdateSearch";
import AdminUpdatesEnhancements from "./AdminUpdatesEnhancements";
import AdminContentControls from "./AdminContentControls";
import SourcePreview from "./SourcePreview";
export const metadata:Metadata={title:"Update Approval Queue",robots:{index:false,follow:false}};
export default function AdminUpdatesPage(){return <><div className="mx-auto max-w-[1500px] px-4 pt-4 md:px-6"><a href="/admin/updates/new" className="inline-flex w-full items-center justify-center rounded-xl bg-green-800 px-5 py-4 text-center text-base font-black text-white shadow-sm sm:w-auto">+ Create update with visual article editor →</a><p className="mt-2 text-sm text-gray-600">Use this editor for new articles with text, pictures and headings in any order. Existing updates remain available below.</p></div><AdminUpdatesClient/><div className="mx-auto max-w-[1500px] px-4 md:px-6"><AdminUpdatesEnhancements section="gallery"/><SourcePreview/><AdminContentControls/></div><AdminUpdateSearch/><AdminUpdatesEnhancements section="bulk"/></>}
