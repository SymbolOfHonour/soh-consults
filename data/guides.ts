export type Guide = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  sections: { heading: string; body: string }[];
  sources?: { label: string; url: string }[];
};

export const guides: Guide[] = [
  {
    slug: "understanding-jamb-caps-status",
    title: "Understanding JAMB CAPS Admission Status",
    category: "JAMB CAPS",
    summary: "Understand common JAMB CAPS admission messages and what each stage means for your admission process.",
    sections: [
      { heading: "PROPOSED FOR ADMISSION", body: "Your institution has proposed you for admission. The admission is still being processed and has not reached final JAMB approval." },
      { heading: "RECOMMENDED FOR ADMISSION", body: "Your institution has put you forward for admission and the recommendation is being processed for JAMB approval." },
      { heading: "APPROVED FOR ADMISSION", body: "JAMB has approved the admission recommendation. Follow the instructions on CAPS and your institution's portal for the next required steps." },
      { heading: "ADMISSION IN PROGRESS", body: "Your admission is still being processed. Continue monitoring CAPS and avoid taking actions based on unverified messages or screenshots." },
      { heading: "NOT ADMITTED", body: "No admission has been approved for you at that time. This can change while an institution is still processing admission, so continue checking official channels." },
      { heading: "Read the message alongside your own record", body: "Write down the exact message, admission year, institution and programme shown on your own account. A screenshot from another candidate cannot establish your status. For example, an offer for a different course needs a different enquiry from a record that still shows no offer. Keep these details together so the admissions office can understand your question without guessing." },
      { heading: "Turn an unclear status into a specific enquiry", body: "Separate what you can see from what someone has told you. If the school says you have been shortlisted, ask its admissions office whether the recommendation has been sent to JAMB. If you see a transfer offer, read the programme details and the official instructions before acting. Keep the reply and check your record again; do not interpret a processing message as a promised admission date." },
    ],
    sources: [{"label": "JAMB: Central Admissions Processing System", "url": "https://jamb.gov.ng/caps"}, {"label": "JAMB official candidate support FAQs", "url": "https://support.jamb.gov.ng/faqs"}],
  },
  {
    slug: "how-to-check-jamb-caps",
    title: "How to Check Your JAMB CAPS Admission Status",
    category: "JAMB CAPS",
    summary: "A simple guide to checking your admission status through JAMB CAPS and understanding what to look for.",
    sections: [
      { heading: "BEFORE YOU START", body: "Use your correct JAMB profile details and make sure you are checking the admission year connected to your application." },
      { heading: "CHECK YOUR STATUS", body: "Sign in to the official JAMB e-Facility, open the admission status service and proceed to CAPS. Review the admission status and institution/course information carefully." },
      { heading: "VERIFY BEFORE ACTING", body: "If anything looks unusual, compare it with information from your institution and JAMB. Do not pay anyone solely because they claim they can change your CAPS status." },
      { heading: "Record what you checked", body: "After opening your own record, note the admission year, institution, programme and exact status. Save a private screenshot with the date you checked. If you later need help, this lets you explain whether a detail changed or whether the same message remains. Avoid posting a screenshot containing your registration number, email or other personal details in a public group." },
      { heading: "If the page fails to load", body: "Distinguish a login problem, an unavailable page and an actual admission message. A blank screen or failed connection does not mean you were rejected. Check the address against the official JAMB website and retry later if the service is unavailable. Use the official support channel for an account problem, explaining the page and error without including your password or one-time codes." },
    ],
    sources: [{"label": "JAMB: Central Admissions Processing System", "url": "https://jamb.gov.ng/caps"}, {"label": "JAMB official candidate support FAQs", "url": "https://support.jamb.gov.ng/faqs"}],
  },
  {
    slug: "accept-jamb-admission",
    title: "What to Do Before Accepting JAMB Admission",
    category: "Admission",
    summary: "Important checks to make before accepting an admission offer on JAMB CAPS.",
    sections: [
      { heading: "CHECK THE DETAILS", body: "Confirm the institution and programme displayed on CAPS. Make sure the offer is the admission you intend to accept." },
      { heading: "ACCEPTING THE OFFER", body: "Once the admission is approved and the details are correct, follow the official CAPS process to accept the offer. Keep evidence of the completed action where possible." },
      { heading: "AFTER ACCEPTANCE", body: "Continue with the institution's own admission instructions, including acceptance fees, clearance or registration where applicable." },
      { heading: "Compare the offer before confirming", body: "Compare the institution, programme and admission year with your application record and the offer you intend to accept. If the course differs, resolve that specific question through official channels before confirming an action. A message from a group administrator is not a substitute for the offer displayed in your own record. Read any confirmation screen carefully rather than clicking through it quickly." },
      { heading: "Keep separate records for each next step", body: "After completing the official acceptance process, retain the confirmation and check the institution’s instructions separately. Make a short checklist for its payment, clearance and registration steps, recording where each instruction came from. Completing one step does not show that every other step is complete. If a payment is required, verify the destination through the institution’s portal before paying." },
    ],
    sources: [{"label": "JAMB: Central Admissions Processing System", "url": "https://jamb.gov.ng/caps"}, {"label": "JAMB official candidate support FAQs", "url": "https://support.jamb.gov.ng/faqs"}],
  },
  {
    slug: "olevel-upload-jamb-caps",
    title: "O'Level Result Upload on JAMB CAPS",
    category: "JAMB",
    summary: "Why your O'Level result matters during admission processing and what to verify after an upload.",
    sections: [
      { heading: "WHY IT MATTERS", body: "Institutions use the O'Level results connected to your JAMB record during admission processing. Missing or incorrect results can affect eligibility checks." },
      { heading: "WHAT TO VERIFY", body: "Confirm that the correct examination type, year, subjects and grades are reflected. If you used more than one sitting, make sure the required results are properly captured." },
      { heading: "GET HELP WHEN NEEDED", body: "If your result is missing or incorrect, use an authorised JAMB service point or JAMB office and keep any transaction evidence provided to you." },
      { heading: "Compare the uploaded entry with your result", body: "Use your original result record as the comparison point. Check each subject and grade, examination type, year and candidate details instead of checking only that some result appears. If two sittings are involved, identify which result each subject belongs to. Keep your own notes of discrepancies so you can describe the correction needed clearly at an authorised service point." },
      { heading: "Confirm the outcome after receiving assistance", body: "A payment receipt shows a transaction; it does not by itself confirm that every subject and grade was captured correctly. Recheck your record after the service is completed and retain the evidence privately. If a discrepancy remains, return with the exact field that is wrong and the supporting result. Do not send your account password to a person promising to fix the record remotely." },
    ],
    sources: [{"label": "JAMB: Central Admissions Processing System", "url": "https://jamb.gov.ng/caps"}, {"label": "JAMB official candidate support FAQs", "url": "https://support.jamb.gov.ng/faqs"}],
  },
  {
    slug: "school-admission-vs-jamb-admission",
    title: "School Admission vs JAMB Admission",
    category: "Admission",
    summary: "Understand why an institution's admission information and JAMB CAPS can sometimes appear at different stages.",
    sections: [
      { heading: "INSTITUTION PROCESSING", body: "An institution may begin processing or communicating admission before the final JAMB approval is reflected on CAPS." },
      { heading: "JAMB CAPS", body: "CAPS is the central JAMB admission platform. Candidates should monitor it alongside the institution's official admission channels." },
      { heading: "WHEN THEY DO NOT MATCH", body: "Do not panic if both systems do not update at exactly the same time. Verify the information and follow official instructions before making payments or major decisions." },
      { heading: "Compare both records systematically", body: "Create two entries in your notes: what the institution’s portal says and what your JAMB record says. Include the date, programme, admission year and exact wording for each. This prevents a general statement such as “I have admission” from hiding an important mismatch. Use your own records; another applicant may be in a different batch or applying for a different programme." },
      { heading: "Ask the office responsible for the mismatch", body: "If the institution has communicated an offer but CAPS has not changed, ask the institution about the recommendation rather than paying someone to force an update. If the programme differs between the two records, state both programme names in your enquiry. Keep following official deadlines while seeking clarification; a mismatch is a reason to investigate, not evidence that a third party can guarantee the outcome." },
    ],
    sources: [{"label": "JAMB: Central Admissions Processing System", "url": "https://jamb.gov.ng/caps"}, {"label": "JAMB official candidate support FAQs", "url": "https://support.jamb.gov.ng/faqs"}],
  },
  {
    slug: "admission-in-progress-meaning",
    title: "What 'Admission in Progress' Means on JAMB CAPS",
    category: "JAMB CAPS",
    summary: "What the Admission in Progress message generally indicates and sensible next steps while you wait.",
    sections: [
      { heading: "WHAT IT MEANS", body: "Admission in Progress generally indicates that your admission record is still undergoing processing. It is not the same as a final approved admission." },
      { heading: "WHAT TO DO", body: "Keep checking CAPS and your institution's official channels. Make sure your admission requirements and uploaded records are in order." },
      { heading: "AVOID UNVERIFIED CLAIMS", body: "Do not assume a third party can guarantee the final outcome. Admission remains subject to the institution and JAMB processes." },
      { heading: "Use the waiting period to check your documents", body: "Compare your O’Level details and application records with the programme requirements and current institutional instructions. Keep receipts and screening acknowledgements together. These checks help you identify a specific missing or incorrect item; they do not guarantee that admission will be offered. If a transfer offer is present, read its details separately instead of assuming the processing message answers it." },
      { heading: "Avoid invented timelines", body: "This message alone does not provide a reliable countdown to an offer. Record when you checked and monitor official announcements, especially any deadline requiring action from you. If you need clarification, ask a precise question with your admission year and programme. Do not pay for a claimed guaranteed change of status, and do not treat an estimated date shared in a group as an official decision." },
    ],
    sources: [{"label": "JAMB: Central Admissions Processing System", "url": "https://jamb.gov.ng/caps"}, {"label": "JAMB official candidate support FAQs", "url": "https://support.jamb.gov.ng/faqs"}],
  },
  {
    slug: "nigerian-university-admission-checklist",
    title: "Nigerian University Admission Checklist: From Application to Clearance",
    category: "Admission",
    summary: "A practical checklist for keeping your JAMB, O'Level, screening, CAPS and school records consistent throughout the admission process.",
    sections: [
      { heading: "1. CONFIRM YOUR APPLICATION RECORD", body: "Keep your JAMB registration details, institution choice and programme choice together. Check names, date of birth and other key details for consistency before screening or clearance. When a correction is genuinely required, use the official process rather than relying on informal promises." },
      { heading: "2. VERIFY YOUR O'LEVEL RECORD", body: "Check the examination body, examination year, candidate number, subjects and grades you intend to use. Make sure the result available to the admission process is the correct one. Programme requirements differ, so having five credits does not automatically mean the five subjects satisfy a particular course." },
      { heading: "3. READ THE SCHOOL'S SCREENING INSTRUCTIONS", body: "Use the institution's current admission or screening notice to confirm eligibility, registration dates, required documents and any institution-specific rules. Do not assume that a rule used by one university applies to another university or to a new admission year." },
      { heading: "4. KEEP PAYMENT AND REGISTRATION EVIDENCE", body: "Save receipts, acknowledgement slips, screening printouts and confirmation pages. Use official payment channels where available. These records are useful if a transaction is delayed or a portal does not immediately reflect a completed action." },
      { heading: "5. MONITOR BOTH CAPS AND THE SCHOOL PORTAL", body: "An institution's portal and JAMB CAPS can update at different stages. Check both, verify the institution and programme shown, and follow official instructions before accepting an offer or making admission-related payments." },
      { heading: "6. PREPARE FOR CLEARANCE", body: "After admission, read the institution's clearance instructions carefully. Typical records can include admission documents, examination results and identity or academic records, but the exact list is determined by the institution. Prepare from the official checklist instead of a generic social-media list." },
      { heading: "S.O.H CONSULTS NOTE", body: "Admission decisions belong to JAMB and the relevant institution. S.O.H CONSULTS provides guidance and registration assistance but does not promise or guarantee admission. When a requirement is unclear, verify it from the current official notice before acting." },
    ],
  },
  {
    slug: "how-to-verify-admission-information-online",
    title: "How to Verify Admission Information Before You Pay or Apply",
    category: "Admission Safety",
    summary: "A simple verification method for checking admission notices, deadlines, portals and payment instructions before taking action.",
    sections: [
      { heading: "START WITH THE ORIGINAL SOURCE", body: "When you see an admission update on social media or a news site, look for the institution or examination body's original announcement. Confirm that the notice refers to the correct academic session, programme and candidate group." },
      { heading: "CHECK THE DOMAIN AND PORTAL", body: "Before entering personal details or paying, inspect the website address carefully. Prefer links published by the institution, JAMB or the relevant examination body. Similar-looking domains, forwarded payment links and screenshots should not be treated as proof by themselves." },
      { heading: "VERIFY THE DATE", body: "Old admission notices often return in search results and messaging groups. Confirm the publication date, application period and deadline. If an old page conflicts with a newer official notice, use the current instruction and seek clarification where necessary." },
      { heading: "COMPARE THE IMPORTANT DETAILS", body: "Check the programme, eligibility conditions, fee description, payment destination and required documents against the official notice. A post can be partly correct while still containing an outdated deadline or wrong payment instruction." },
      { heading: "KEEP A RECORD OF WHAT YOU USED", body: "Save the official notice or confirmation page that informed your action, together with receipts and acknowledgement slips. This makes it easier to explain a problem to the institution or service provider if something later fails to reflect." },
      { heading: "WHEN TO STOP AND ASK", body: "Do not rush a payment because somebody claims a portal will close within minutes. If the source, amount, account details or eligibility rule cannot be verified, stop and confirm through an official channel or a trusted guidance service first." },
    ],
  },
  {
    slug: "jamb-and-school-record-consistency-guide",
    title: "JAMB and School Record Consistency Guide for Admission Candidates",
    category: "JAMB",
    summary: "What to compare across your JAMB profile, O'Level records and institution portal to reduce avoidable admission and clearance problems.",
    sections: [
      { heading: "WHY CONSISTENCY MATTERS", body: "Admission processing combines information from more than one record. A candidate may interact with JAMB, an examination body and an institution's own portal. Differences in important details can require clarification or correction, especially during screening and clearance." },
      { heading: "PERSONAL DETAILS", body: "Compare the key personal details displayed on the records you are using. If you discover a genuine discrepancy, first identify which record is wrong and then follow the correction procedure provided by the organization responsible for that record." },
      { heading: "O'LEVEL DETAILS", body: "Confirm the examination type, year, candidate information, subjects and grades. Also check that the subjects meet the requirements for the intended programme. Do not edit or recreate result information yourself to make records appear consistent." },
      { heading: "INSTITUTION AND PROGRAMME", body: "Check the institution and course reflected in your current admission process. If a change of institution or course is required, follow the recognized JAMB and institution procedures and wait for the relevant systems to update where applicable." },
      { heading: "AFTER AN ADMISSION OFFER", body: "Before final acceptance or clearance, read the offer and compare the institution and programme with what appears on the relevant official systems. Keep your admission letter, acceptance evidence and school payment receipts together for future reference." },
      { heading: "USE CURRENT REQUIREMENTS", body: "Admission rules can change between sessions and institutions. Treat calculators and general guides as assistance, not as a replacement for the current official admission notice. S.O.H CONSULTS tools should be used together with official requirements." },
    ],
  }
];