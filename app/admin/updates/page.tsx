import type {Metadata} from"next";
import AdminUpdatesClient from"./AdminUpdatesClient";
import AdminUpdateSearch from"./AdminUpdateSearch";
import AdminBulkActions from"./AdminBulkActions";
import AdminContentControls from"./AdminContentControls";
import SourcePreview from"./SourcePreview";
export const metadata:Metadata={title:"Update Approval Queue",robots:{index:false,follow:false}};
export default function AdminUpdatesPage(){return <><AdminUpdatesClient/><div className="mx-auto max-w-[1500px] px-4 md:px-6"><SourcePreview/><AdminContentControls/></div><AdminUpdateSearch/><AdminBulkActions/></>}
