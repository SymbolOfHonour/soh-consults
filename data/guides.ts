export type Guide = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  sections: { heading: string; body: string }[];
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
    ],
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
    ],
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
    ],
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
    ],
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
    ],
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
    ],
  },
];
