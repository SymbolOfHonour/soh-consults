export const enquiryServices = ["Admission guidance", "Post-UTME / Direct Entry registration", "O’Level upload", "Admission letter / UTME result", "WAEC certificate", "Result scratch cards", "Other enquiry"];
export function serviceEnquiryUrl(service: string, school = "", context = "") {
  const selected = enquiryServices.includes(service) ? service : enquiryServices[0];
  const message = [`Hello S.O.H CONSULTS, I need help with ${selected}.`, school.trim() && `School / programme: ${school.trim().slice(0, 180)}.`, context && `Page: ${context}`].filter(Boolean).join("\n");
  return `https://wa.me/2348182141088?text=${encodeURIComponent(message)}`;
}
