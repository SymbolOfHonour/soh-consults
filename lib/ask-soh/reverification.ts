import type {KnowledgeFact} from "./knowledge-repository";
export function knowledgeHealth(facts:KnowledgeFact[],now=Date.now()){
 const due=facts.filter(f=>["verified","published"].includes(f.status)&&!!f.review_due_at&&+new Date(f.review_due_at)<now);
 const expiring=facts.filter(f=>["verified","published"].includes(f.status)&&!!f.valid_until&&+new Date(f.valid_until)>=now&&+new Date(f.valid_until)<=now+7*86400000);
 const expired=facts.filter(f=>["verified","published"].includes(f.status)&&!!f.valid_until&&+new Date(f.valid_until)<now);
 return{due,expiring,expired};
}
export function nextReviewStatus(fact:KnowledgeFact,now=Date.now()){if(fact.valid_until&&+new Date(fact.valid_until)<now)return"expired";if(fact.review_due_at&&+new Date(fact.review_due_at)<now)return"due_review";return fact.status;}
