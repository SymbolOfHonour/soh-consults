import { lasuChemistry2026 } from "./lasu-chemistry-2026";
import { jambLiveCatalogueRequirements } from "./jamb-live-catalogue";
import { fuoyeVerified2026Requirements } from "./fuoye-verified-2026";
import { lasustech2026Requirements } from "./lasustech-2026";
import { lasu2026Requirements } from "./lasu-2026";
import { lasuLiveCatalogue2026 } from "./lasu-live-2026";
import { lasuBatch1Requirements } from "./lasu-batch1-2026";
import { institutionExpansion2026 } from "./expansion";
// Historical Accounting entries remain in their source file for research only.
// Unconfirmed programme availability must not participate in candidate matching.

const lasuBatch1Names = new Set(lasuBatch1Requirements.map((record) => record.programme.toLowerCase()));
const remainingLasuCatalogue = lasuLiveCatalogue2026.filter((record) => !lasuBatch1Names.has(record.programme.toLowerCase()) && record.programme !== lasuChemistry2026.programme);

export const admissionMatcherRequirements = [
  ...institutionExpansion2026,
  ...jambLiveCatalogueRequirements,
  ...fuoyeVerified2026Requirements,
  ...lasustech2026Requirements,
  ...lasu2026Requirements,
  ...lasuBatch1Requirements,
  lasuChemistry2026,
  ...remainingLasuCatalogue,
];
