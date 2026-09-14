S.O.H CONSULTS UPDATE DATA STRUCTURE

PASTE THESE FILES:

1. data\updates.ts
   -> C:\Users\DELL\soh-consults\data\updates.ts

2. app\page.tsx
   -> C:\Users\DELL\soh-consults\app\page.tsx

3. app\updates\[id]\page.tsx
   -> C:\Users\DELL\soh-consults\app\updates\[id]\page.tsx

GOING FORWARD:
Add/edit news in data\updates.ts only.

For ordinary news:
{
  id: 14,
  category: "Admission",
  institution: "LASU",
  title: "Headline",
  date: "13 September 2026",
  summary: "Short summary",
  details: "Full details",
},

For news that is also an opportunity, add:
  isOpportunity: true,
  opportunityCategory: "Universities",
  opportunityProgramme: "Programme name",
  opportunityStatus: "OPEN",
  opportunityDeadline: "Deadline",

The homepage automatically reads updates from this file.
Items marked isOpportunity: true also appear under Admission Opportunities.
