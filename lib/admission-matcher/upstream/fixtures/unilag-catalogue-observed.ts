import type { IbassCatalogueResponse } from "../catalogue";

/**
 * Sanitized subset of the public IBASS catalogue response observed after
 * selecting University of Lagos in the Eligibility Checker on 2026-10-02.
 * The browser request was named `1345`, matching the observed institution id.
 * Only visible public programme id/title pairs are retained here.
 */
export const unilagCatalogueObserved: IbassCatalogueResponse = {
  status: true,
  message: "Success.",
  data: [
    { id: 1537, title: "ACCOUNTANCY/ACCOUNTING" },
    { id: 1542, title: "ACTUARIAL SCIENCE" },
    { id: 2303, title: "ADULT EDUCATION:" },
    { id: 2191, title: "ARCHITECTURE" },
    { id: 1540, title: "BANKING AND FINANCE" },
    { id: 1678, title: "BIOCHEMISTRY" },
    { id: 2120, title: "BIOLOGY" },
  ],
};

export const unilagIbassInstitutionId = 1345;
