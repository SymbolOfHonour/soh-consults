import {articlePublisherName} from "../../../lib/article-publisher";

export default function ArticlePublisher({name,about,pictureUrl}: {name?: string;about?:string;pictureUrl?:string}) {
  const publisher = articlePublisherName(name);
  const initials = publisher.split(" ").slice(0, 2).map(part => Array.from(part)[0]).join("").toUpperCase();
  return <section aria-label="Article publisher" className="mt-8 flex min-w-0 items-start gap-4 rounded-2xl border border-green-200 bg-green-50 p-4 sm:p-6">
    {pictureUrl&&/^https:\/\//i.test(pictureUrl)?<img src={pictureUrl} alt={`${publisher} — writer`} width={56} height={56} className="h-14 w-14 shrink-0 rounded-full object-cover"/>:<span aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-green-800 text-lg font-black text-white">{initials}</span>}
    <div className="min-w-0">
      <p className="text-xs font-black uppercase tracking-wide text-green-700">Published by</p>
      <h2 className="mt-1 break-words text-xl font-black text-green-950 [overflow-wrap:anywhere]">{publisher}</h2>
      {about?.trim()&&<div className="mt-3"><h3 className="text-sm font-bold text-green-900">About the writer</h3><p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-gray-700">{about.trim()}</p></div>}
      <a href="/about" className="mt-2 inline-block py-2 text-sm font-semibold text-green-800 underline underline-offset-4">About S.O.H CONSULTS →</a>
    </div>
  </section>;
}
