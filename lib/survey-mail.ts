import nodemailer from 'nodemailer';
import {businessMailbox,businessLogo} from './go54-mail-content';
import type {parseSubmission} from './survey-validation';
export type SurveyAnswer=ReturnType<typeof parseSubmission>;
const escape=(v:string)=>v.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function answerCopy(data:SurveyAnswer,submittedAt:string){
 const permission={no:'Keep my testimony private.',anonymous:'May publish my testimony without my name.',named:'May publish my testimony with the name I provided.'}[data.permission as 'no'|'anonymous'|'named'];
 const answers:[string,string][]=[['About you',data.role],['How you use S.O.H CONSULTS',data.uses.join('; ')],['Your biggest challenge',data.challenge],['What we should improve',data.improvement],['Useful additions',data.features.join('; ')||'Not selected'],['Questions you need answered',data.questions||'Not provided'],['Admission testimony / experience',data.experience||'Not provided'],['Name',data.name||'Not provided'],['Testimonial permission',permission]];
 const time=new Date(submittedAt).toLocaleString('en-GB',{timeZone:'Africa/Lagos',dateStyle:'medium',timeStyle:'short'})+' WAT';
 const subject='Your S.O.H CONSULTS survey answers';
 const text=`Thank you for sharing your feedback with S.O.H CONSULTS.\nYou requested this copy of your survey answers.\nSubmitted: ${time}\nResponse reference: ${data.id}\n\n`+answers.map(([q,a])=>q+'\n'+a).join('\n\n')+'\n\nNo marketing subscription was created.\nS.O.H CONSULTS\nhttps://sohconsults.com.ng';
 const html=`<div style="background:#f3f6f0;padding:24px;font-family:Arial,sans-serif;color:#183d30"><div style="max-width:640px;margin:auto;background:white;padding:28px;border-radius:14px"><img src="${businessLogo}" alt="S.O.H CONSULTS" width="100"><h1 style="font-size:24px">Your survey answers 💚</h1><p>Thank you for sharing your feedback. You requested this copy of your answers.</p><p style="font-size:13px">Submitted: ${escape(time)}<br>Response reference: ${escape(data.id)}</p>${answers.map(([q,a])=>`<h2 style="font-size:15px;margin:24px 0 8px">${escape(q)}</h2><div style="white-space:pre-wrap;line-height:1.6">${escape(a)}</div>`).join('')}<hr style="border:0;border-top:1px solid #dde4d8;margin-top:26px"><p style="font-size:12px">No marketing subscription was created.</p><p>S.O.H CONSULTS · <a href="https://sohconsults.com.ng">sohconsults.com.ng</a></p></div></div>`;
 return {subject,text,html};
}
export async function sendSurveyCopy(data:SurveyAnswer,submittedAt:string){
 if(!data.emailRequested||!data.receiptEmail)throw Error('An email copy was not requested.');
 if(!process.env.GO54_MAIL_PASSWORD)throw Error('Business mail is unavailable.');
 const transport=nodemailer.createTransport({host:'smtp.go54mail.com',port:587,secure:false,requireTLS:true,auth:{user:businessMailbox,pass:process.env.GO54_MAIL_PASSWORD},logger:false,debug:false,connectionTimeout:8000,greetingTimeout:8000,socketTimeout:15000,disableFileAccess:true,disableUrlAccess:true});
 try{const result=await transport.sendMail({from:{name:'S.O.H CONSULTS',address:businessMailbox},replyTo:businessMailbox,to:data.receiptEmail,messageId:`<survey-${data.id}@sohconsults.com.ng>`,...answerCopy(data,submittedAt)});if(!result.accepted?.length)throw Error('Mail was not accepted.')}finally{transport.close()}
}
