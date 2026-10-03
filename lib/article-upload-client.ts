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
function tusFailure(error:unknown) {
  const candidate=error as {message?:string;originalRequest?:unknown};
  const request=candidate.originalRequest as {getStatus?:()=>number;getResponseText?:()=>string}|undefined;
  const status=typeof request?.getStatus==="function"?request.getStatus():undefined;
  const body=typeof request?.getResponseText==="function"?request.getResponseText()?.trim():undefined;
  const detail=[status?`HTTP ${status}`:"",body?.slice(0,300)||"",candidate.message||""].filter(Boolean).join(" · ");
  return Error(`Storage upload failed${detail?`: ${detail}`:"."}`);
}
export async function uploadArticleFile(file:File,kind:ArticleUploadKind,onProgress?:(percentage:number)=>void):Promise<{url:string;name:string}> {
  const error=await uploadValidationError(file,kind);if(error)throw Error(error);
  const target=await uploadRequest({action:"prepare",kind,name:file.name,size:file.size,type:file.type});
  try { await new Promise<void>((resolve,reject)=>{
    let timer:ReturnType<typeof setTimeout>;
    let awaitingAcknowledgement=false;
    const arm=()=>{clearTimeout(timer);timer=setTimeout(()=>{void upload.abort().catch(()=>{});reject(Error("No upload progress for two minutes. Check your connection and retry."));},120_000);};
    const upload=new Upload(file,{endpoint:target.endpoint,headers:{"x-signature":target.token,"x-upsert":"false"},metadata:{bucketName:target.bucket,objectName:target.path,contentType:file.type,cacheControl:"3600"},chunkSize:6*1024*1024,retryDelays:[0,1000,3000,5000],uploadDataDuringCreation:true,storeFingerprintForResuming:false,removeFingerprintOnSuccess:true,onProgress:(sent,total)=>{if(sent>=total&&total>0){if(!awaitingAcknowledgement){awaitingAcknowledgement=true;clearTimeout(timer);timer=setTimeout(()=>{void upload.abort().catch(()=>{});reject(Error("Storage did not confirm the completed upload. Select the file and retry."));},30_000);}}else if(!awaitingAcknowledgement)arm();onProgress?.(Math.min(99,Math.round(sent/total*100)));},onSuccess:()=>{clearTimeout(timer);resolve();},onError:(uploadError)=>{clearTimeout(timer);reject(tusFailure(uploadError));}});
    arm();upload.start();
  }); } catch(error) {
    // Some Storage TUS deployments reject their own signed token before creating
    // an upload session. The same path-scoped signed URL supports standard PUT.
    if(!(error instanceof Error)||!error.message.includes("Invalid Compact JWS")||typeof target.signedUploadUrl!=="string")throw error;
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),120_000);
    try {
      onProgress?.(0);
      const response=await fetch(target.signedUploadUrl,{method:"PUT",credentials:"omit",redirect:"error",signal:controller.signal,headers:{"Content-Type":file.type,"x-upsert":"false"},body:file});
      if(!response.ok)throw Error(`Signed storage upload failed (HTTP ${response.status}). Please retry.`);
      onProgress?.(99);
    } catch(fallbackError) {
      if(controller.signal.aborted)throw Error("The signed storage upload timed out. Check your connection and retry.");
      throw fallbackError;
    } finally {clearTimeout(timer);}
  }
  onProgress?.(100);
  const result=await uploadRequest({action:"complete",receipt:target.receipt});
  if(typeof result.url!=="string")throw Error("Could not verify uploaded file.");return result;
}
