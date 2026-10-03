import {createHmac, timingSafeEqual, randomUUID} from "node:crypto";
import {articleUploadMetadataError, detectedArticleFileType, type ArticleUploadKind} from "./article-uploads";
const bucket="news-attachments";
const extensions:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","application/pdf":"pdf","video/mp4":"mp4","video/webm":"webm"};
type Receipt={path:string;kind:ArticleUploadKind;size:number;type:string;name:string;expires:number};
function configuration(){const base=process.env.SUPABASE_URL?.replace(/\/$/,"");const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!base||!key)throw Error("Supabase environment variables are not configured.");return {base,key,headers:{apikey:key,...(key.startsWith("eyJ")?{Authorization:`Bearer ${key}`}:{})}};}
function mac(payload:string,key:string){return createHmac("sha256",key).update(`soh-direct-article-upload:${payload}`).digest();}
function sign(receipt:Receipt,key:string){const payload=Buffer.from(JSON.stringify(receipt)).toString("base64url");return `${payload}.${mac(payload,key).toString("base64url")}`;}
function readReceipt(value:unknown,key:string):Receipt {
  if(typeof value!=="string"||value.length>3000)throw Error("Invalid upload receipt.");const [payload,signature,extra]=value.split(".");if(!payload||!signature||extra)throw Error("Invalid upload receipt.");const actual=Buffer.from(signature,"base64url"),expected=mac(payload,key);if(actual.length!==expected.length||!timingSafeEqual(actual,expected))throw Error("Invalid upload receipt.");const r=JSON.parse(Buffer.from(payload,"base64url").toString()) as Receipt;
  if(!/^(images|documents|videos)\/[a-f0-9-]{36}\.(jpg|png|webp|pdf|mp4|webm)$/.test(r.path)||r.expires<Date.now()||articleUploadMetadataError(r.size,r.type,r.kind))throw Error("Upload receipt expired or invalid. Select the file again.");return r;
}
async function withStorageDeadline<T>(work:(signal:AbortSignal)=>Promise<T>):Promise<T> {
  const controller=new AbortController();
  let timer:ReturnType<typeof setTimeout>;
  const timeout=new Promise<never>((_,reject)=>{timer=setTimeout(()=>{reject(Error("Storage verification timed out. Select the file and retry."));controller.abort();},20_000);});
  try{return await Promise.race([work(controller.signal),timeout]);}
  finally{clearTimeout(timer!);controller.abort();}
}
export async function prepareArticleUpload(input:{kind:ArticleUploadKind;size:number;type:string;name:string}) {
  const error=articleUploadMetadataError(input.size,input.type,input.kind);if(error)throw Error(error);
  const {base,key,headers}=configuration();
  const path=`${input.kind}s/${randomUUID()}.${extensions[input.type]}`;
  return withStorageDeadline(async signal=>{
  const response=await fetch(`${base}/storage/v1/object/upload/sign/${bucket}/${path}`,{signal,method:"POST",headers:{...headers,"Content-Type":"application/json","x-upsert":"false"},body:"{}",cache:"no-store",redirect:"error"});
  if(!response.ok)throw Error(`Could not prepare upload (${response.status}).`);
  const data=await response.json() as {url?:string};if(!data.url)throw Error("Storage did not return an upload token.");const signed=new URL(`${base}/storage/v1${data.url}`);const token=signed.searchParams.get("token");if(signed.origin!==new URL(base).origin||!token)throw Error("Storage returned an invalid upload token.");
  const storageBase=new URL(base);if(/^[a-z0-9]+\.supabase\.co$/.test(storageBase.hostname))storageBase.hostname=storageBase.hostname.replace(".supabase.co",".storage.supabase.co");
  return {endpoint:`${storageBase.origin}/storage/v1/upload/resumable`,signedUploadUrl:signed.toString(),token,bucket,path,receipt:sign({...input,name:input.name.slice(0,250),path,expires:Date.now()+2*60*60*1000},key)};
  });
}
export async function completeArticleUpload(value:unknown) {
  const {base,key,headers}=configuration();const receipt=readReceipt(value,key);const objectUrl=`${base}/storage/v1/object/${bucket}/${receipt.path}`;
  return withStorageDeadline(async signal=>{
  const head=await fetch(objectUrl,{signal,method:"HEAD",headers:{...headers,"Accept-Encoding":"identity"},cache:"no-store",redirect:"error"});
  if(!head.ok)throw Error("Upload is not complete. Select the file and retry.");
  const size=Number(head.headers.get("content-length"));const type=head.headers.get("content-type")?.split(";")[0];
  if(size!==receipt.size||type!==receipt.type)throw Error("Uploaded file size or type does not match the selected file.");
  const response=await fetch(objectUrl,{signal,headers:{...headers,Range:"bytes=0-63","Accept-Encoding":"identity"},cache:"no-store",redirect:"error"});
  if(!response.ok||!response.body)throw Error("Unable to verify uploaded file.");
  // Only inspect the signature. Even if a storage proxy ignores Range, never buffer a video in Vercel.
  const reader=response.body.getReader(),prefix=new Uint8Array(64);let length=0;
  try{while(length<64){const part=await reader.read();if(part.done)break;const bytes=part.value.subarray(0,64-length);prefix.set(bytes,length);length+=bytes.length;}}finally{void reader.cancel().catch(()=>{});}
  const actual=await detectedArticleFileType(new File([prefix.slice(0,length)],receipt.name,{type:receipt.type}));
  if(actual!==receipt.type)throw Error("The uploaded file signature is invalid. Use a genuine image, PDF, MP4 or WebM file.");
  return {url:`${base}/storage/v1/object/public/${bucket}/${receipt.path}`,name:receipt.name};
  });
}
