import { relatedContent, type DiscoveryItem } from "../../lib/algorithm-phase2";
import { calculatorContent, guideContent } from "../../lib/content-catalogue";
export default function NextSteps({current,candidates=[]}:{current:DiscoveryItem;candidates?:DiscoveryItem[]}){
  let calculators=0;
  const recommendations=relatedContent(current,[...guideContent,...calculatorContent,...candidates],12).filter(({item})=>item.kind!=="calculator"||calculators++===0).slice(0,3);
  if(!recommendations.length)return null;
  return <section aria-label="Useful next steps" className="mt-7 rounded-2xl border border-green-200 bg-green-50 p-5"><h2 className="text-xl font-black text-green-950">Useful next steps</h2><p className="mt-1 text-sm text-gray-600">Guidance, tools and applications related to this topic.</p><div className="mt-3 grid gap-2">{recommendations.map(({item})=><a key={item.id} href={item.href} className="rounded-xl bg-white p-4 hover:outline hover:outline-green-700"><span className="text-xs font-bold uppercase text-green-700">{item.kind}</span><h3 className="mt-1 font-black">{item.title} →</h3><p className="mt-1 text-sm leading-6 text-gray-600">{item.summary}</p></a>)}</div></section>;
}
