import {articlePublisherName} from "../../../lib/article-publisher";
import PublisherAvatar from "../../writers/PublisherAvatar";

type Props={name?:string;about?:string;pictureUrl?:string;profileHref?:string};
function safeProfileHref(value?:string){return value&&/^\/writers\/[a-z0-9-]+$/.test(value)?value:undefined;}
export function ArticlePublisherByline({name,pictureUrl,profileHref}:Props){
 const publisher=articlePublisherName(name),href=safeProfileHref(profileHref);
 const content=<><PublisherAvatar name={publisher} pictureUrl={pictureUrl} className="h-11 w-11 shrink-0 rounded-full bg-green-100 text-sm font-bold text-green-950"/><span className="min-w-0"><span className="block break-words text-sm">Published by <strong>{publisher}</strong></span>{href&&<span className="mt-1 block text-xs opacity-80">View publisher profile ↗</span>}</span></>;
 return href?<a href={href} aria-label={`View publisher profile: ${publisher}`} className="mt-5 inline-flex max-w-full items-center gap-3 rounded-lg py-1 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4">{content}</a>:<div className="mt-5 inline-flex max-w-full items-center gap-3 py-1">{content}</div>;
}
export default function ArticlePublisher({name,about,pictureUrl,profileHref}:Props) {
  const publisher = articlePublisherName(name);
  const href=safeProfileHref(profileHref);
  const portrait=<PublisherAvatar name={publisher} pictureUrl={pictureUrl} portrait className="h-16 w-16 shrink-0 rounded-full bg-green-100 text-xl font-bold text-green-950"/>;
  return <section aria-label="Article publisher" className="mt-8 flex min-w-0 items-start gap-4 rounded-xl border border-[#dce0d7] bg-[#f6f5f0] p-5 sm:p-7">
    {href?<a href={href} aria-label={`View ${publisher}’s profile`} className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4">{portrait}</a>:portrait}
    <div className="min-w-0">
      <p className="text-xs font-black uppercase tracking-wide text-green-700">Published by</p>
      <h2 className="mt-1 break-words text-2xl font-semibold text-green-950 [overflow-wrap:anywhere]">{href?<a href={href} className="hover:underline">{publisher}</a>:publisher}</h2>
      {about?.trim()&&<div className="mt-3"><h3 className="text-sm font-bold text-green-900">About the writer</h3><p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-gray-700">{about.trim()}</p></div>}
      <a href={href||"/about"} className="mt-3 inline-block rounded border border-[#c7d0c1] px-4 py-2 text-sm font-semibold text-green-950">{href?"View publisher profile ↗":"About S.O.H CONSULTS →"}</a>
    </div>
  </section>;
}
