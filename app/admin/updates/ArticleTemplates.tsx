"use client";
import { useState } from "react";
import { articleTemplates, templateBlocks } from "../../../lib/article-templates";
import type { ArticleBlock } from "../../../lib/article-blocks";
export default function ArticleTemplates({ blocks, onChange, disabled = false }: { blocks: ArticleBlock[]; onChange: (blocks: ArticleBlock[]) => void; disabled?: boolean }) {
  const [selected, setSelected] = useState("admission");
  const empty = blocks.length === 0 || blocks.length === 1 && blocks[0].type === "paragraph" && !blocks[0].text.trim();
  const added = articleTemplates.find(t => t.id === selected)!.sections.length * 2;
  return <details className="rounded-xl border bg-white p-4"><summary className="cursor-pointer font-bold text-green-900">Article templates</summary><div className="mt-3 flex flex-wrap items-center gap-3"><label className="font-bold">Choose a starting layout<select disabled={disabled} className="ml-2 rounded-lg border p-2" value={selected} onChange={e => setSelected(e.target.value)}>{articleTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label><button type="button" disabled={disabled || (!empty && blocks.length + added > 100)} onClick={() => onChange([...(empty ? [] : blocks), ...templateBlocks(selected)])} className="rounded-lg border border-green-700 px-4 py-2 font-bold text-green-800 disabled:opacity-50">{empty ? "Use template" : "Append template sections"}</button></div><p className="mt-2 text-sm text-gray-600">Adds headings and blank paragraphs. Existing content is kept. Fill in verified information before submitting or publishing.</p></details>;
}
