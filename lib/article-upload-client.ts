"use client";
import {Upload} from "tus-js-client";
import {uploadValidationError,type ArticleUploadKind} from "./article-uploads";
export async function uploadArticleFile(file:File,kind:ArticleUploadKind,onProgress?:(percentage:number)=>void):Promise<{url:string;name:string}> {
  const error=await uploadValidationError(file,kind);if(error)throw Error(error);
  const prepared=await fetch("/api/admin/uploads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"prepare",kind,name:file.name,size:file.size,type:file.type})});
  const target=await prepared.json();if(!prepared.ok)throw Error(target.error||"Could not prepare upload.");
  await new Promise<void>((resolve,reject)=>{
    const upload=new Upload(file,{endpoint:target.endpoint,headers:{"x-signature":target.token,"x-upsert":"false"},metadata:{bucketName:target.bucket,objectName:target.path,contentType:file.type,cacheControl:"3600"},chunkSize:6*1024*1024,retryDelays:[0,1000,3000,5000],uploadDataDuringCreation:true,storeFingerprintForResuming:false,removeFingerprintOnSuccess:true,onProgress:(sent,total)=>onProgress?.(Math.round(sent/total*100)),onSuccess:()=>resolve(),onError:()=>reject(Error("Upload interrupted or rejected by storage. Check the connection and the QA bucket size limit, then retry."))});
    upload.start();
  });
  const completed=await fetch("/api/admin/uploads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"complete",receipt:target.receipt})});
  const result=await completed.json();if(!completed.ok||typeof result.url!=="string")throw Error(result.error||"Could not verify uploaded file.");return result;
}
