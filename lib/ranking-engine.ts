export type RankingContext = {
  institution?: string;
  category?: string;
  query?: string;
  now?: Date;
};

export type RankableContent = {
  id?: string;
  title: string;
  summary?: string;
  body?: string;
  institution?: string;
  category?: string;
  publishedAt?: string | Date;
  deadline?: string | Date | null;
  isOfficial?: boolean;
  isPinned?: boolean;
  views?: number;
  clicks?: number;
};

export type RankingBreakdown = {
  relevance: number;
  freshness: number;
  importance: number;
  urgency: number;
  authority: number;
  engagement: number;
  context: number;
  stalenessPenalty: number;
  duplicationPenalty: number;
  total: number;
};

const DAY = 86_400_000;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const normalise = (value?: string) => (value || "").trim().toLowerCase();
const words = (value?: string) => normalise(value).split(/[^a-z0-9]+/).filter(Boolean);

function dateValue(value?: string | Date | null) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function queryRelevance(item: RankableContent, context: RankingContext) {
  const q = words(context.query);
  if (!q.length) return 0;
  const title = normalise(item.title);
  const haystack = normalise(`${item.title} ${item.summary || ""} ${item.body || ""} ${item.institution || ""} ${item.category || ""}`);
  let score = 0;
  for (const token of q) {
    if (title.includes(token)) score += 4;
    else if (haystack.includes(token)) score += 2;
  }
  return clamp(score, 0, 20);
}

function freshness(item: RankableContent, now: Date) {
  const published = dateValue(item.publishedAt);
  if (!published) return 2;
  const age = Math.max(0, (now.getTime() - published.getTime()) / DAY);
  if (age <= 1) return 16;
  if (age <= 3) return 14;
  if (age <= 7) return 12;
  if (age <= 14) return 9;
  if (age <= 30) return 6;
  if (age <= 90) return 3;
  return 0;
}

function urgency(item: RankableContent, now: Date) {
  const deadline = dateValue(item.deadline);
  if (!deadline) return 0;
  const days = (deadline.getTime() - now.getTime()) / DAY;
  if (days < 0) return 0;
  if (days <= 1) return 16;
  if (days <= 3) return 14;
  if (days <= 7) return 11;
  if (days <= 14) return 7;
  if (days <= 30) return 3;
  return 0;
}

function engagement(item: RankableContent) {
  const views = Math.max(0, item.views || 0);
  const clicks = Math.max(0, item.clicks || 0);
  return clamp(Math.log10(views + 1) * 2 + Math.log10(clicks + 1) * 3, 0, 10);
}

function contextScore(item: RankableContent, context: RankingContext) {
  let score = 0;
  const institution = normalise(context.institution);
  const category = normalise(context.category);
  if (institution && normalise(item.institution) === institution) score += 10;
  if (category && normalise(item.category) === category) score += 6;
  return score;
}

function importance(item: RankableContent) {
  let score = item.isPinned ? 10 : 0;
  const text = normalise(`${item.title} ${item.category || ""}`);
  if (/admission|deadline|screening|post utme|registration|result|scholarship|nysc/.test(text)) score += 6;
  return clamp(score, 0, 14);
}

function stalenessPenalty(item: RankableContent, now: Date) {
  const published = dateValue(item.publishedAt);
  const deadline = dateValue(item.deadline);
  let penalty = 0;
  if (published) {
    const age = (now.getTime() - published.getTime()) / DAY;
    if (age > 180) penalty += 6;
    else if (age > 90) penalty += 3;
  }
  if (deadline && deadline.getTime() < now.getTime()) penalty += 12;
  return penalty;
}

export function scoreContent(item: RankableContent, context: RankingContext = {}): RankingBreakdown {
  const now = context.now || new Date();
  const relevance = queryRelevance(item, context);
  const fresh = freshness(item, now);
  const important = importance(item);
  const urgent = urgency(item, now);
  const authority = item.isOfficial ? 10 : 4;
  const engaged = engagement(item);
  const contextual = contextScore(item, context);
  const stale = stalenessPenalty(item, now);
  const duplicate = 0;
  const total = relevance + fresh + important + urgent + authority + engaged + contextual - stale - duplicate;
  return {
    relevance,
    freshness: fresh,
    importance: important,
    urgency: urgent,
    authority,
    engagement: engaged,
    context: contextual,
    stalenessPenalty: stale,
    duplicationPenalty: duplicate,
    total: Math.round(total * 100) / 100,
  };
}

export function rankContent<T extends RankableContent>(items: T[], context: RankingContext = {}) {
  const seen = new Set<string>();
  return items
    .map((item) => {
      const key = normalise(item.title).replace(/[^a-z0-9]/g, "");
      const breakdown = scoreContent(item, context);
      if (key && seen.has(key)) {
        breakdown.duplicationPenalty = 10;
        breakdown.total = Math.round((breakdown.total - 10) * 100) / 100;
      }
      if (key) seen.add(key);
      return { item, score: breakdown.total, breakdown };
    })
    .sort((a, b) => b.score - a.score);
}
