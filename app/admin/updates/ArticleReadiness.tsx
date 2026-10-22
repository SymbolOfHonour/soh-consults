import {editorReadiness} from '../../../lib/editor-readiness';
import type {ArticleBlock} from '../../../lib/article-blocks';
export default function ArticleReadiness({article,blocks}:{article:Parameters<typeof editorReadiness>[0];blocks:ArticleBlock[]}){
 const checks=editorReadiness(article,blocks);
 return <section aria-label="Publication checklist" className="rounded-2xl border bg-white p-4"><h2 className="font-bold text-green-950">Before you publish</h2><ul className="mt-3 grid gap-2 sm:grid-cols-2">{checks.map(c=><li key={c.label} className={c.ready?'text-green-800':c.required?'text-amber-900':'text-gray-600'}>{c.ready?'✓':'○'} {c.label}{!c.required&&!c.ready?' (optional)':''}</li>)}</ul><p className="mt-3 text-sm text-gray-600">Confirm facts, dates and links against your source. Publishing still runs the server checks.</p></section>;
}
