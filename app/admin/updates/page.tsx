import type { Metadata } from "next";
import AdminUpdatesClient from "./AdminUpdatesClient";
import AdminUpdateSearch from "./AdminUpdateSearch";
import AdminBulkActions from "./AdminBulkActions";
import AdminContentControls from "./AdminContentControls";
export const metadata:Metadata={title:"Update Approval Queue",robots:{index:false,follow:false}};
export default function AdminUpdatesPage(){return <><AdminUpdatesClient/><div className="mx-auto max-w-[1500px] px-4 md:px-6"><AdminContentControls/></div><AdminUpdateSearch/><AdminBulkActions/></>}
