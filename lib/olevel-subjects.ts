/** Shared O’Level input catalogue for every current and future calculator.
 * Display options only: schools retain their own acceptance rules and scoring.
 * Sources: WAEC e-learning subject list and WAEC/NECO 2026 timetables.
 * https://www.waeconline.org.ng/e-learning/
 * https://waecnigeria.org/sites/default/files/2026-03/FINAL%20TIMETABLE%20WASSCE%20%28SC%29%202026%20-%20NIGERIA.pdf
 * https://neco.gov.ng/2026%20SSCE%20INTERNAL%20TIMETABLE-2.pdf
 */
export const OLEVEL_SUBJECTS: string[] = [
  "Accounting",
  "Agriculture",
  "Air Conditioning and Refrigeration",
  "Animal Husbandry",
  "Arabic",
  "Auto Body Repair and Spray Painting",
  "Auto Electrical Work",
  "Auto Mechanical Work",
  "Auto Mechanics",
  "Automobile Parts Merchandising",
  "Basic Electricity",
  "Basic Electronics",
  "Beauty and Cosmetology",
  "Biology",
  "Block Laying, Brick Laying and Concrete Works",
  "Book Keeping",
  "Building Construction",
  "Carpentry and Joinery",
  "Catering Craft",
  "Catering Craft Practice",
  "Chemistry",
  "Christian Religious Studies",
  "Civic Education",
  "Clothing and Textiles",
  "Commerce",
  "Computer Hardware and GSM Repairs",
  "Computer Studies",
  "Cosmetology",
  "Crop Husbandry and Horticulture",
  "Data Processing",
  "Digital Technologies",
  "Dyeing and Bleaching",
  "Economics",
  "Edo",
  "Efik",
  "Electrical Installation and Maintenance Work",
  "English Language",
  "Fashion Design and Garment Making",
  "Financial Accounting",
  "Fisheries",
  "Foods & Nutrition",
  "French",
  "Furniture Making",
  "Further Mathematics",
  "GSM Phone Maintenance and Repair",
  "Garment Making",
  "Geography",
  "Government",
  "Hausa Language",
  "Health Education",
  "History",
  "Home Management",
  "Horticulture and Crop Production",
  "Ibibio",
  "Igbo Language",
  "Insurance",
  "Islamic Studies",
  "Leather Goods Manufacturing and Repairs",
  "Literature-in-English",
  "Livestock Farming",
  "Machine Woodworking",
  "Marketing",
  "Mathematics",
  "Metal Work",
  "Mining",
  "Music",
  "Nigerian History",
  "Office Practice",
  "Painting and Decorating",
  "Photography",
  "Physical Education",
  "Physics",
  "Plumbing and Pipe Fitting",
  "Printing Craft Practice",
  "Radio, Television and Electronics Work",
  "Salesmanship",
  "Shorthand",
  "Solar Photovoltaic Installation and Maintenance",
  "Store Keeping",
  "Store Management",
  "Technical Drawing",
  "Tourism",
  "Typewriting",
  "Upholstery",
  "Visual Art",
  "Welding and Fabrication Engineering Craft Practice",
  "Woodwork",
  "Yoruba Language"
].sort((a, b) => a.localeCompare(b));

// Match spelling variants for dropdown deduplication, not admissions equivalence.
const spellingGroups = [
  ["Accounting", "Financial Accounting", "Principles of Accounting"],
  ["Agriculture", "Agricultural Science"],
  ["Arabic", "Arabic Studies"],
  ["Christian Religious Studies", "Christian Religious Knowledge", "CRS", "CRK"],
  ["Islamic Studies", "Islamic Religious Studies", "Islamic Religious Knowledge", "IRS", "IRK"],
  ["Literature-in-English", "Literature in English"],
  ["Foods & Nutrition", "Food and Nutrition", "Foods and Nutrition"],
  ["Hausa Language", "Hausa"], ["Igbo Language", "Igbo"], ["Yoruba Language", "Yoruba"],
  ["French", "French Language"],
  ["Visual Art", "Visual Arts", "Fine Art", "Fine Arts", "Art"],
  ["Book Keeping", "Bookkeeping"],
  ["Fisheries", "Fishery"],
  ["Electrical Installation and Maintenance Work", "Electrical Installation and Maintenance Works"],
];
const spellingKey = (subject: string) => subject.toLowerCase().replace(/[^a-z0-9]/g, "");
export function oLevelSubjectKey(subject: string): string {
  const key = spellingKey(subject);
  const group = spellingGroups.find(values => values.some(value => spellingKey(value) === key));
  return spellingKey(group?.[0] ?? subject);
}

/** Preserve existing school labels because eligibility engines use these values. */
export function getOLevelSubjectOptions(existing: readonly string[] = []): string[] {
  const options = new Map<string, string>();
  for (const subject of [...existing, ...OLEVEL_SUBJECTS]) {
    const key = oLevelSubjectKey(subject);
    if (!options.has(key)) options.set(key, subject);
  }
  return [...options.values()].sort((a, b) => a.localeCompare(b));
}
