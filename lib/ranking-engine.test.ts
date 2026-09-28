import { describe, expect, it } from "vitest";
import { rankContent, scoreContent } from "./ranking-engine";

const now = new Date("2026-09-28T12:00:00+01:00");

describe("S.O.H ranking engine", () => {
  it("boosts institution-matched current content", () => {
    const matched = scoreContent({ title: "LASU admission update", institution: "LASU", publishedAt: "2026-09-28", isOfficial: true }, { institution: "LASU", now });
    const generic = scoreContent({ title: "Admission update", publishedAt: "2026-09-28", isOfficial: true }, { institution: "LASU", now });
    expect(matched.total).toBeGreaterThan(generic.total);
  });

  it("boosts deadlines that are close but not expired", () => {
    const urgent = scoreContent({ title: "Scholarship registration", deadline: "2026-09-29", publishedAt: "2026-09-27" }, { now });
    const later = scoreContent({ title: "Scholarship registration", deadline: "2026-10-25", publishedAt: "2026-09-27" }, { now });
    expect(urgent.total).toBeGreaterThan(later.total);
  });

  it("penalises expired opportunities", () => {
    const expired = scoreContent({ title: "Old scholarship", deadline: "2026-09-20", publishedAt: "2026-09-01" }, { now });
    const active = scoreContent({ title: "Current scholarship", deadline: "2026-09-30", publishedAt: "2026-09-01" }, { now });
    expect(active.total).toBeGreaterThan(expired.total);
  });

  it("penalises duplicate titles while preserving stable ranked output", () => {
    const ranked = rankContent([
      { id: "1", title: "JAMB admission update", publishedAt: "2026-09-28" },
      { id: "2", title: "JAMB admission update", publishedAt: "2026-09-28" },
    ], { now });
    expect(ranked[0].breakdown.duplicationPenalty).toBe(0);
    expect(ranked[1].breakdown.duplicationPenalty).toBe(10);
  });
});
