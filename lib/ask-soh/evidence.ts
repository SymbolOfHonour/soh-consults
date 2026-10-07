export type Evidence={value:string;sourceUrl:string;sourceName:string;authority:number;observedAt?:string|null;official:boolean;verified:boolean};
export type EvidenceDecision={winner:Evidence|null;conflict:boolean;confidence:"high"|"medium"|"low";reason:string};
function ageScore(value?:string|null){if(!value)return 0;const age=Math.max(0,Date.now()-+new Date(value));return Math.max(0,20-Math.floor(age/86400000/30));}
function score(e:Evidence){return e.authority+(e.official?20:0)+(e.verified?15:0)+ageScore(e.observedAt);}
export function reconcileEvidence(items:Evidence[]):EvidenceDecision{
 if(!items.length)return{winner:null,conflict:false,confidence:"low",reason:"No evidence"};
 const ranked=[...items].sort((a,b)=>score(b)-score(a));const winner=ranked[0];const competing=ranked.filter(x=>x.value.trim().toLowerCase()!==winner.value.trim().toLowerCase());
 const conflict=competing.some(x=>Math.abs(score(winner)-score(x))<25);
 return{winner,conflict,confidence:conflict?"medium":winner.verified&&winner.official?"high":"medium",reason:conflict?"Authoritative evidence conflicts and requires review.":"Highest-authority applicable evidence selected."};
}
