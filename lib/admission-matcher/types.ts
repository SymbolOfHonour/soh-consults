export type MatchStatus = "match" | "review" | "not_match";

export type SourceRecord = {
  label: string;
  url: string;
  session: string;
  lastVerified: string;
};

export type ProgrammeRequirement = {
  institutionId: string;
  institutionName: string;
  programme: string;
  aliases?: string[];
  minimumUtmeScore?: number;
  requiredUtmeSubjects: string[];
  utmeAlternatives?: string[][];
  requiredOlevelCredits: string[];
  olevelAlternatives?: string[][];
  minimumOlevelCreditCount?: number;
  maximumSittings?: 1 | 2;
  screeningMethod?: "online" | "post-utme" | "other";
  calculatorPath?: string;
  notes?: string[];
  sources: SourceRecord[];
};

export type CandidateProfile = {
  programme: string;
  utmeScore: number;
  utmeSubjects: string[];
  olevelCredits: string[];
  olevelSittings: 1 | 2;
};

export type MatchResult = {
  requirement: ProgrammeRequirement;
  status: MatchStatus;
  passed: string[];
  failed: string[];
  needsReview: string[];
};
