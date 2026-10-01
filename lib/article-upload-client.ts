"use client";
import {Upload} from "tus-js-client";
import {uploadValidationError,type ArticleUploadKind} from "./article-uploads";
async function uploadRequest(body:Record<string,unknown>) {
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),30_000);
  try {
    const response=await fetch("/api/admin/uploads",{method:"POST",credentials:"same-origin",signal:controller.signal,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    if(response.status===401)throw Error("Your admin session is no longer valid. Keep this editor open, sign in at /admin in another tab, then retry the upload here.");
    const result=await response.json();
    if(!response.ok)throw Error(result.error||"Upload request failed. Please retry.");
    return result;
  } catch(error) {
    if(controller.signal.aborted)throw Error("The upload request timed out. Check your connection and retry.");
    throw error;
  } finally {clearTimeout(timer);}
}
function tusFailure(error:Error&{originalRequest?:{getStatus?:()=>number;getResponseText?:()=>string};causingError?:Error}) {
  const request=error.originalRequest;
  const status=request?.getStatus?.();
  const body=request?.getResponseText?.()?.trim();
  const detail=[status?`HTTP ${status}`:"",body?.slice(0,300)||"",error.message||""].filter(Boolean).join(" · ");
  return Error(`Storage upload failed${detail?`: ${detail}`:"."}`);
}
export async function uploadArticleFile(file:File,kind:ArticleUploadKind,onProgress?:(percentage:number)=>void):Promise<{url:string;name:string}> {
  const error=await uploadValidationError(file,kind);if(error)throw Error(error);
  const target=await uploadRequest({action:"prepare",kind,name:file.name,size:file.size,type:file.type});
  await new Promise<void>((resolve,reject)=>{
    let timer:ReturnType<typeof setTimeout>;
    const arm=()=>{clearTimeout(timer);timer=setTimeout(()=>{void upload.abort().catch(()=>{});reject(Error("No upload progress for two minutes. Check your connection and retry."));},120_000);};
    const upload=new Upload(file,{endpoint:target.endpoint,headers:{"x-signature":target.token,"x-upsert":"false"},metadata:{bucketName:target.bucket,objectName:target.path,contentType:file.type,cacheControl:"3600"},chunkSize:6*1024*1024,retryDelays:[0,1000,3000,5000],uploadDataDuringCreation:true,storeFingerprintForResuming:false,removeFingerprintOnSuccess:true,onProgress:(sent,total)=>{arm();onProgress?.(Math.round(sent/total*100));},onSuccess:()=>{clearTimeout(timer);resolve();},onError:(uploadError)=>{clearTimeout(timer);reject(tusFailure(uploadError));}});
    arm();upload.start();
  });
  const result=await uploadRequest({action:"complete",receipt:target.receipt});
  if(typeof result.url!=="string")throw Error("Could not verify uploaded file.");return result;
}
