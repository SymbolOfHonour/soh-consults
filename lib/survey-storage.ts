import {teamRequest} from './editor-team';
export const surveyHeaders={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
export type SurveyRow={id:string;submitted_at:string;is_test:boolean;role:string;uses_json:string;challenge:string;improvement:string;features_json:string;questions:string;experience:string;name:string;permission:'no'|'anonymous'|'named';source:string;email_requested?:boolean;receipt_email?:string;receipt_status?:string};
export async function surveyRows(test:boolean,before?:string,limit=101){
 const cursor=before?`&submitted_at=lt.${encodeURIComponent(before)}`:'';
 return teamRequest<SurveyRow[]>(`/rest/v1/community_survey_responses?is_test=eq.${test}${cursor}&select=*&order=submitted_at.desc,id.desc&limit=${limit}`);
}
export async function surveyCounts(){return teamRequest<{is_test:boolean;total:number;testimonies:number;shareable:number}[]>('/rest/v1/rpc/community_survey_counts',{method:'POST',body:'{}'})}
export const csvCell=(value:unknown)=>{let s=String(value??'');if(/^[\s]*[=+@\-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'};
export function surveyCsv(rows:SurveyRow[]){const keys:(keyof SurveyRow)[]=['id','submitted_at','is_test','role','uses_json','challenge','improvement','features_json','questions','experience','name','permission','email_requested','receipt_email','receipt_status'];return '\uFEFF'+keys.map(csvCell).join(',')+'\r\n'+rows.map(r=>keys.map(k=>csvCell(k==='uses_json'||k==='features_json'?JSON.parse(r[k]).join('; '):r[k])).join(',')).join('\r\n')}
