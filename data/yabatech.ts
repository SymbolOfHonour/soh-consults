export const yabatechMeritCutoffs={
  "ND Accountancy": 63.1,
  "ND Agricultural & Bio-Environmental Engineering": 52.5,
  "ND Agricultural Technology": 52.15,
  "ND Architectural": 57,
  "ND Banking & Finance": 58.3,
  "ND Building Technology": 55.95,
  "ND Business Administration & Management": 62.95,
  "ND Chemical Engineering": 54.5,
  "ND Civil Engineering": 59.6,
  "ND Computer Engineering": 61.1,
  "ND Computer Science": 63.25,
  "ND Electrical & Electronics Engineering": 62.1,
  "ND Estate Management": 51.4,
  "ND Fashion Design": 58.2,
  "ND Food Science & Technology": 55.25,
  "ND General Art": 51.85,
  "ND Hospitality Management": 52.65,
  "ND Industrial Maintenance Engineering": 52.8,
  "ND Tourism Management Technology": 51,
  "ND Library & Information Science": 61.35,
  "ND Marine Engineering": 51.05,
  "ND Marketing": 60.45,
  "ND Mass Communication": 66.2,
  "ND Mechanical Engineering": 59.9,
  "ND Mechatronics Engineering": 57.3,
  "ND Metallurgical Engineering": 52.3,
  "ND Mineral and Petroleum Engineering": 52.8,
  "ND Nutrition & Dietetics": 59.55,
  "ND Office Technology & Management": 59.1,
  "ND Photography": 59.6,
  "ND Polymer Technology": 53.65,
  "ND Printing Technology": 55.65,
  "ND Public Administration": 61.1,
  "ND Quantity Surveying": 51.8,
  "ND Railway Engineering": 56.8,
  "ND Science Laboratory Technology": 62.3,
  "ND Statistics": 51.3,
  "ND Taxation": 56.9,
  "ND Transport Planning & Mgt.": 52.35,
  "ND Surveying & Geo-Informatics": 50.8,
  "ND Textile Technology": 53.6,
  "ND Urban & Regional Planning": 50.4,
  "ND Welding & Fabrication": 51.85
} as const;
export const yabatechCatchmentCutoffs={
  "ND Accountancy": {
    "Ekiti": 52,
    "Lagos": 61.75,
    "Ogun": 61.75,
    "Ondo": 59.85,
    "Osun": 61,
    "Oyo": 60.75
  },
  "ND Business Administration & Management": {
    "Ekiti": 57.8,
    "Lagos": 61.35,
    "Ogun": 62.35,
    "Ondo": 60.1,
    "Osun": 60.2,
    "Oyo": 61.85
  },
  "ND Computer Engineering": {
    "Ekiti": 55.65,
    "Lagos": 59.2,
    "Ogun": 59.95,
    "Ondo": 59.1,
    "Osun": 58.95,
    "Oyo": 59.3
  },
  "ND Computer Science": {
    "Ekiti": 59.85,
    "Lagos": 61.9,
    "Ogun": 61.85,
    "Ondo": 61.2,
    "Osun": 61.45,
    "Oyo": 61.65
  },
  "ND Electrical & Electronics Engineering": {
    "Ekiti": 57.75,
    "Lagos": 60.55,
    "Ogun": 61.5,
    "Ondo": 58.05,
    "Osun": 59.9,
    "Oyo": 59.95
  },
  "ND Mass Communication": {
    "Ekiti": 61.35,
    "Lagos": 64.1,
    "Ogun": 64.35,
    "Ondo": 62.2,
    "Osun": 64.05,
    "Oyo": 64.65
  },
  "ND Marketing": {
    "Ekiti": 55.3,
    "Lagos": 59.2,
    "Ogun": 58.9,
    "Ondo": 55.4,
    "Osun": 51.85,
    "Oyo": 56.95
  },
  "ND Photography": {
    "Ekiti": 56.55,
    "Lagos": 57.95,
    "Ogun": 57.7,
    "Ondo": 51.55,
    "Osun": 57.15,
    "Oyo": 56.45
  },
  "ND Public Administration": {
    "Ekiti": 58.9,
    "Lagos": 54.25,
    "Ogun": 54.5,
    "Ondo": 56.95,
    "Osun": 59.95,
    "Oyo": 59.1
  },
  "ND Science Laboratory Technology": {
    "Ekiti": 59.4,
    "Lagos": 60.85,
    "Ogun": 61.45,
    "Ondo": 60.5,
    "Osun": 60.55,
    "Oyo": 60.95
  },
  "ND Banking & Finance": {
    "Ekiti": 54.1,
    "Lagos": 50.55,
    "Ogun": 53.05,
    "Ondo": 54.85,
    "Osun": 52.9,
    "Oyo": 55.1
  },
  "ND Civil Engineering": {
    "Ekiti": 54.15,
    "Lagos": 58.05,
    "Ogun": 57.95,
    "Ondo": 54.3,
    "Osun": 55.45,
    "Oyo": 55.95
  },
  "ND Mechanical Engineering": {
    "Ekiti": 55.85,
    "Lagos": 58.75,
    "Ogun": 58.55,
    "Ondo": 54.2,
    "Osun": 56.65,
    "Oyo": 56.35
  },
  "ND Library & Information Science": {
    "Ekiti": 57.55,
    "Lagos": 59.7,
    "Ogun": 60.1,
    "Ondo": 58,
    "Osun": 59.9,
    "Oyo": 60.7
  },
  "ND Nutrition & Dietetics": {
    "Ekiti": 54.6,
    "Lagos": 56.95,
    "Ogun": 58.3,
    "Ondo": 54.4,
    "Osun": 56.65,
    "Oyo": 56.9
  }
} as const;
export const yabatechProgrammes=Object.keys(yabatechMeritCutoffs);
export const yabatechCatchmentStates=["Ekiti","Lagos","Ogun","Ondo","Osun","Oyo"] as const;
