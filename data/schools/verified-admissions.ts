// Institution identities and links checked against the universities' own pages.
// A listed portal does not establish that applications are currently open.
export const verifiedAdmissions: Record<string, {name:string; url:string; source:string; checked:string}> = {
  "4-503": {name:"LAGOS STATE UNIVERSITY, OJO, LAGOS STATE",url:"https://services.lidc.lasu.edu.ng/admissionscreening/",source:"https://screening.lasu.edu.ng/sn/instructions_sw.php",checked:"2026-10-27"},
  "4-494": {name:"UNIVERSITY OF LAGOS, LAGOS STATE",url:"https://unilag.edu.ng/admission/",source:"https://unilag.edu.ng/admission/",checked:"2026-10-27"},
  "4-392": {name:"UNIVERSITY OF IBADAN, IBADAN, OYO STATE",url:"https://admissions.ui.edu.ng/",source:"https://ui.edu.ng/news/20262027-admission-exercise-direct-entry-registration",checked:"2026-10-27"},
  "4-620": {name:"OBAFEMI AWOLOWO UNIVERSITY, ILE-IFE, OSUN STATE",url:"https://eportal2.oauife.edu.ng/ug/admissions",source:"https://oauife.edu.ng/2026-admission-screening-exercise-for-utme-and-direct-entry-candidates/",checked:"2026-10-27"},
};
