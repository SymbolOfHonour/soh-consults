export const BUSINESS_CONTACTS = {
 email:'support@sohconsults.com.ng',
 phone:'0818 214 1088',
 whatsapp:'https://wa.me/2348182141088',
 instagram:'https://www.instagram.com/sohconsults/',
 facebook:'https://www.facebook.com/share/19Mzqo5Ggg/',
 channel:'https://whatsapp.com/channel/0029VbD6QQp3GJP68dl9TK29',
} as const;

/** Use the published channel link when valid, otherwise retain the official default. */
export function updatesChannelUrl(value?: string | null): string {
 const url = (value || '').trim();
 return /^https:\/\/(?:www\.)?whatsapp\.com\/channel\/[a-z0-9]+\/?$/i.test(url) ? url : BUSINESS_CONTACTS.channel;
}
