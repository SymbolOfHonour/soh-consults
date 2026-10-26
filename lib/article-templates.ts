import type { ArticleBlock } from "./article-blocks";
export const articleTemplates = [
  { id: "admission", name: "Admission update", sections: ["Admission at a glance", "Who can apply", "Required documents", "Application fee", "How to apply", "Application deadline", "Official source and enquiries"] },
  { id: "scholarship", name: "Scholarship", sections: ["Scholarship at a glance", "Eligibility", "What the scholarship covers", "Documents needed", "How to apply", "Deadline and selection process", "Official source and last checked date"] },
  { id: "fees", name: "School fees", sections: ["School fees at a glance", "Fee breakdown", "How to pay", "Payment deadline", "Important notices"] },
  { id: "guide", name: "Step-by-step guide", sections: ["What this guide covers", "Before you begin", "Step 1", "Step 2", "Step 3", "Common problems", "What to do next"] },
  { id: "institution", name: "Institution profile", sections: ["Institution at a glance", "Official website and admission portal", "Programmes and admission routes", "Current admission information", "Student resources", "Official sources and last checked date"] },
  { id: "recruitment", name: "Recruitment opportunity", sections: ["Opportunity at a glance", "Who can apply", "Role and location", "Pay or unpaid status", "Required documents", "How to apply", "Deadline", "Official source and last checked date"] },
  { id: "procedure", name: "Educational procedure", sections: ["What you will complete", "Who this applies to", "What to prepare", "Official fees and payment channel", "Steps to follow", "Common problems and official support", "Official source and last checked date"] },
] as const;
export function templateBlocks(id: string): ArticleBlock[] {
  const template = articleTemplates.find(item => item.id === id);
  if (!template) return [];
  return template.sections.flatMap(text => [{ type: "heading", text, anchor: `section-${crypto.randomUUID()}` }, { type: "paragraph", text: "" }] as ArticleBlock[]);
}
export function duplicateArticleBlock(block: ArticleBlock): ArticleBlock {
  const copy = structuredClone(block);
  if (copy.type === "heading") copy.anchor = `section-${crypto.randomUUID()}`;
  return copy;
}
