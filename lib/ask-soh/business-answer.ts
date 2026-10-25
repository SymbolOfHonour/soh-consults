import { BUSINESS_CONTACTS } from '../business-contacts';
export function businessOverviewAnswer(question: string) {
  const brand = /s\.?\s*o\.?\s*h\.?\s+consults|your (?:services|contact)|contact (?:you|us)/i.test(question);
  if (!brand) return null;
  if (/contact|reach|whatsapp|email|phone/i.test(question)) return `Contact S.O.H CONSULTS on WhatsApp: ${BUSINESS_CONTACTS.whatsapp}, phone: ${BUSINESS_CONTACTS.phone}, or email: ${BUSINESS_CONTACTS.email}.`;
  if (/services|what.{0,20}(?:offer|do|help)/i.test(question)) return `S.O.H CONSULTS assists with admission guidance, Post-UTME and Direct Entry registrations, O'Level uploads on JAMB, JAMB document printing, examination result-checking cards and tokens, and WAEC certificate guidance. Contact us on WhatsApp for requirements and current fees: ${BUSINESS_CONTACTS.whatsapp}.`;
  return null;
}
