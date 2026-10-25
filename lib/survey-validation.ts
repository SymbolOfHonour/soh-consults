export const roles=['Admission seeker / aspirant','Current student','Graduate / NYSC member','Parent / guardian','Other'];
export const uses=['Read WhatsApp updates','Used registration or application assistance','Contacted S.O.H CONSULTS for guidance','I’m new / haven’t used it yet'];
export const features=['Quick answers to common admission and student questions','School-specific admission and deadline alerts','Scholarship, internship and job opportunities','Clear application guides and checklists','Student stories and personal development articles','A place to ask questions and share experiences','Other — describe it in question 4'];
export function parseSubmission(d:Record<string,unknown>){
 function str(k:string,max:number,required=false){const v=d[k];if(typeof v!=='string'||v.length>max||(required&&!v.trim()))throw Error('Please check '+k.replaceAll('_',' ')+'.');return v.trim()}
 function list(k:string,allowed:string[],min:number,max:number){const v=d[k];if(!Array.isArray(v)||v.length<min||v.length>max||v.some(x=>typeof x!=='string'||!allowed.includes(x))||new Set(v).size!==v.length)throw Error('Please check your '+k+' selections.');return v as string[]}
 const id=str('id',36,true);if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))throw Error('Please refresh the page and try again.');
 const role=str('roles',100,true);if(!roles.includes(role))throw Error('Please choose your audience group.');
 const permission=str('permission',20,true);if(!['no','anonymous','named'].includes(permission))throw Error('Please check testimonial permission.');
 const name=str('name',120);if(permission==='named'&&!name)throw Error('Please add a name or select anonymous permission.');
 return {id,role,uses:list('uses',uses,1,4),challenge:str('challenge',1500,true),improvement:str('improvement',1500,true),features:list('features',features,0,3),questions:str('student_questions',2000),experience:str('experience',3000),name,permission};
}
