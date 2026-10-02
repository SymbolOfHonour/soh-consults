export type IbassEntryMode = "utme" | "direct-entry";
export type IbassComponentStatus = "qualified" | "disqualified" | "unknown";

export type IbassRawRequirement = {
  id?: string | number;
  title?: string;
  originalSubject?: string;
  subjectCount?: number;
  course?: string;
  institution?: string;
  type?: string;
  raw?: unknown;
};

export type IbassInstitutionEvidence = {
  upstreamId?: string | number;
  name: string;
  abbreviation?: string;
  category?: string;
  schoolType?: string;
};

export type IbassProgrammeEvidence = {
  upstreamId?: string | number;
  label: string;
  faculty?: string;
  institutionIds?: Array<string | number>;
  rawUtmeRequirement?: string;
  rawOlevelRequirement?: string;
};

export type IbassComponentResult = {
  status: IbassComponentStatus;
  passed: string[];
  failed: string[];
  submitted: string[];
  requiredText?: string;
};

export type IbassEligibilityEvidence = {
  provider: "jamb-ibass";
  observedAt: string;
  entryMode: IbassEntryMode;
  institution: IbassInstitutionEvidence;
  programme: IbassProgrammeEvidence;
  utme?: IbassComponentResult;
  olevel?: IbassComponentResult;
  alevel?: IbassComponentResult;
  overallStatus: IbassComponentStatus;
  requirementRecords?: IbassRawRequirement[];
  source: {
    url: string;
    sourceType: "eligibility-checker" | "brochure" | "official-document";
    locator?: string;
  };
  unresolved: string[];
};

export type IbassSnapshotRecord = {
  schemaVersion: 1;
  evidence: IbassEligibilityEvidence;
  normalized: {
    institutionId: string;
    programme: string;
    requiredUtmeSubjects: string[];
    requiredOlevelCredits: string[];
    verificationStatus: "verified" | "review";
    reviewReasons: string[];
  };
};
