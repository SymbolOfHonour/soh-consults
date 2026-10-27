/** Suggest existing assistance only when the article's headline names a relevant topic. */
export function articleServiceLink(title: string): {href:string; label:string} | null {
 const text = title.normalize('NFKC').toLowerCase();
 if (/\b(post[ -]?utme|direct entry)\b/.test(text)) return {href:'/services/registration-assistance',label:'Post-UTME & Direct Entry assistance'};
 if (/\b(jamb|caps|utme|o[’' -]?level)\b/.test(text)) return {href:'/services/jamb-support',label:'JAMB & O’Level support'};
 if (/\b(waec|wassce)\b.*\b(certificate|certificates)\b/.test(text)) return {href:'/services/waec-certificate',label:'WAEC certificate assistance'};
 if (/\badmission(?:s)?\b/.test(text)) return {href:'/services/admission-guidance',label:'Admission guidance'};
 return null;
}
