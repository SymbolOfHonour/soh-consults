import type { Metadata } from "next";
/** Give each canonical public page its own share URL instead of the homepage's. */
export function withPublicSocial(metadata:Metadata):Metadata {
 const canonical=metadata.alternates?.canonical;
 if(typeof canonical!=="string")return metadata;
 const title=typeof metadata.title==="string"?metadata.title:metadata.title&&"absolute" in metadata.title?metadata.title.absolute:metadata.title&&"default" in metadata.title?metadata.title.default:"S.O.H CONSULTS";
 const description=metadata.description||"Admission guidance, educational updates and student tools from S.O.H CONSULTS.";
 return {...metadata,title:typeof metadata.title==="string"&&metadata.title.endsWith(" | S.O.H CONSULTS")?{absolute:metadata.title}:metadata.title,openGraph:{type:"website",siteName:"S.O.H CONSULTS",images:[{url:"/soh-logo.jpg",alt:"S.O.H CONSULTS"}],...metadata.openGraph,title,description,url:canonical},twitter:{card:"summary_large_image",images:["/soh-logo.jpg"],...metadata.twitter,title,description}};
}
