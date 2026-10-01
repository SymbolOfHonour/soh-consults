import { jambLiveCatalogueRequirements } from "./jamb-live-catalogue";
import { fuoye2026Requirements } from "./fuoye-2026";
import { lasustech2026Requirements } from "./lasustech-2026";
import { lasu2026Requirements } from "./lasu-2026";
import { lasuLiveCatalogue2026 } from "./lasu-live-2026";
// Historical Accounting entries remain in their source file for research only.
// Unconfirmed programme availability must not participate in candidate matching.

export const admissionMatcherRequirements = [
  ...jambLiveCatalogueRequirements,
  ...fuoye2026Requirements,
  ...lasustech2026Requirements,
  ...lasu2026Requirements,
  ...lasuLiveCatalogue2026,
];
