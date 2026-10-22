import {revalidatePath} from 'next/cache';
import {teamRequest} from './editor-team';
export type SchedulerResult={published:number;expired:number;blocked?:{id:string;title:string;reason:string}[];processed_at:string};
export async function processSmartOperations(){
 const result=await teamRequest<SchedulerResult>('/rest/v1/rpc/process_editor_schedule',{method:'POST',body:'{}'});
 for(const path of ['/','/updates','/admin','/admin/updates','/admin/modules','/admin/forms','/admin/opportunities','/admin/calendar'])revalidatePath(path);
 revalidatePath('/updates/[id]','page');return result;
}
