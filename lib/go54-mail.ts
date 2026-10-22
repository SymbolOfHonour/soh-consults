import nodemailer from "nodemailer";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { EditorError, teamRequest } from "./editor-team";
import type { EmailEvent } from "./team-mail";
import { businessMailbox, deliveryReports, openMessage, sealMessage, writerMail } from "./go54-mail-content";

type ArchiveEvent = EmailEvent & {message_id: string; encrypted_message: string | null; archive_expires_at: string};
const table = "/rest/v1/editor_email_events";
const archiveFields = "id,recipient,kind,status,created_at,archive_status,delivery_status,message_id,encrypted_message,archive_expires_at";
export function go54MailState() {
  return { enabled: process.env.GO54_TEAM_MAIL_ENABLED === "true", configured: !!process.env.GO54_MAIL_PASSWORD && (process.env.ADMIN_SESSION_SECRET?.length || 0) >= 32 };
}
function auth() {
  if (!go54MailState().configured) throw new EditorError("The business mailbox connection needs configuration.",503);
  return {user:businessMailbox,pass:process.env.GO54_MAIL_PASSWORD!};
}
function smtp() {
  return nodemailer.createTransport({host:"smtp.go54mail.com",port:587,secure:false,requireTLS:true,auth:auth(),logger:false,debug:false,connectionTimeout:8000,greetingTimeout:8000,socketTimeout:15000,disableFileAccess:true,disableUrlAccess:true});
}
function imap() {
  const client = new ImapFlow({host:"imap.go54mail.com",port:993,secure:true,auth:auth(),logger:false,disableAutoIdle:true,connectionTimeout:8000,greetingTimeout:8000,socketTimeout:15000});
  // Do not log protocol errors: they may contain account or message details.
  client.on("error",()=>{});
  return client;
}
async function sentFolder(client: ImapFlow) {
  const folders = await client.list();
  const sent = folders.find(f=>f.specialUse === "\\Sent");
  if (!sent) throw new Error("The mailbox has no designated Sent folder");
  return sent.path;
}
async function patch(id:string, body:Record<string,unknown>, filter="") {
  return teamRequest<ArchiveEvent[]>(`${table}?id=eq.${id}${filter}`,{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify(body)});
}
export async function verifyGo54Mail() {
  const transport=smtp(), client=imap();
  try {
    // An SMTP failure must not hide whether the same saved credentials work for IMAP.
    // Neither check sends a message, reads incoming bodies or changes the mailbox.
    const [outgoing,incoming]=await Promise.allSettled([transport.verify(),client.connect()]);
    if(outgoing.status==="rejected") {
      const error=outgoing.reason;
      const rejected=error && typeof error==="object" && error.code==="EAUTH";
      const responseCode=Number(error?.responseCode);
      const response=Number.isInteger(responseCode)&&responseCode>=400&&responseCode<=599?` (SMTP ${responseCode})`:"";
      const prefix=incoming.status==="fulfilled"?"IMAP accepted the saved mailbox login. ":"IMAP could not verify the saved mailbox login. ";
      const failure=rejected ? error?.command==="API" ? "The SMTP client could not use its configured credentials; this does not prove Go54 rejected the password." : `Go54 SMTP rejected authentication${response}; this does not by itself prove the password is wrong.` : "The secure Go54 SMTP connection failed.";
      throw new EditorError(prefix+failure,503);
    }
    if(incoming.status==="rejected") {
      const error=incoming.reason;
      const rejected=error && typeof error==="object" && error.authenticationFailed;
      throw new EditorError(rejected ? "SMTP verified, but Go54 IMAP rejected the mailbox login." : "SMTP verified, but the secure Go54 IMAP connection failed.",503);
    }
    try { await sentFolder(client); }
    catch { throw new EditorError("SMTP and IMAP verified, but the mailbox’s designated Sent folder could not be found.",503); }
    return {smtp:true,imap:true};
  }
  finally { transport.close(); client.close(); }
}
async function archiveOne(event:ArchiveEvent, client:ImapFlow, folder:string) {
  if (!event.encrypted_message || event.status!=="accepted" || event.archive_status==="saved") return false;
  const now=new Date(), until=new Date(now.getTime()+120000).toISOString();
  const claimed=await patch(event.id,{archive_lease_until:until},`&archive_status=in.(pending,failed)&or=(archive_lease_until.is.null,archive_lease_until.lt.${encodeURIComponent(now.toISOString())})`);
  if (!claimed.length) return false;
  let saved=false;
  try {
    const lock=await client.getMailboxLock(folder,{readOnly:true});
    try {
      const existing=await client.search({header:{"message-id":event.message_id}},{uid:true});
      if (!existing) throw new Error("Unable to check Sent copies");
      if (!existing.length) {
        const result=await client.append(folder,openMessage(event.encrypted_message,event.id),["\\Seen"],new Date(event.created_at));
        if (!result) throw new Error("Sent copy was not saved");
      }
      saved=true;
    } finally { lock.release(); }
    await patch(event.id,{archive_status:"saved",encrypted_message:null,archive_lease_until:null});
    return true;
  } catch {
    // A DB write failure after APPEND is safe to retry: Message-ID is checked first.
    if (!saved) await patch(event.id,{archive_status:"failed",archive_lease_until:null}).catch(()=>{});
    return false;
  }
}
export async function sendGo54TeamMail(event:EmailEvent, member:{id:string;email:string}, kind:EmailEvent["kind"]) {
  let accepted=false;
  const messageId=`<soh-${event.id}@sohconsults.com.ng>`;
  try {
    auth();
    const link=await teamRequest<{hashed_token:string}>("/auth/v1/admin/generate_link",{method:"POST",body:JSON.stringify({type:kind==="recovery"?"recovery":"invite",email:member.email})});
    const content=writerMail(kind,link.hashed_token);
    const composer=nodemailer.createTransport({streamTransport:true,buffer:true,newline:"windows",disableFileAccess:true,disableUrlAccess:true});
    const composed=await composer.sendMail({from:{name:"S.O.H CONSULTS",address:businessMailbox},replyTo:businessMailbox,to:member.email,messageId,...content});
    if (!Buffer.isBuffer(composed.message)) throw new Error("Mail composition failed");
    const raw=composed.message;
    const expires=new Date(Date.now()+7*86400000).toISOString();
    const encrypted=sealMessage(raw,event.id);
    // Persist the encrypted exact MIME message before SMTP, so archiving can retry independently.
    const stored=await patch(event.id,{message_id:messageId,encrypted_message:encrypted,archive_expires_at:expires,archive_status:"pending"});
    if (!stored.length) throw new Error("The encrypted outbox was not saved");
    const transport=smtp();
    try {
      const result=await transport.sendMail({envelope:{from:businessMailbox,to:[member.email]},raw,dsn:{id:event.id,return:"headers",notify:["failure","delay","success"],recipient:member.email}});
      if (!result.accepted?.length) throw new Error("Mail not accepted");
      accepted=true;
    } finally { transport.close(); }
    const updated=await patch(event.id,{status:"accepted",completed_at:new Date().toISOString()});
    if (!updated.length) throw new Error("SMTP acceptance could not be recorded");
    const client=imap();
    try {
      await client.connect();
      await archiveOne({...event,status:"accepted",message_id:messageId,encrypted_message:encrypted,archive_expires_at:expires,archive_status:"pending"},client,await sentFolder(client));
    } catch { await patch(event.id,{archive_status:"failed"}).catch(()=>{}); }
    finally { client.close(); }
  } catch {
    if (!accepted) await patch(event.id,{status:"failed",completed_at:new Date().toISOString(),encrypted_message:null,archive_status:"unavailable"}).catch(()=>{});
    // Never automatically resend: an interrupted SMTP transaction can have succeeded.
    throw new EditorError("Email delivery could not be confirmed. Check email history and the recipient’s inbox before resending.",503);
  }
}

export async function syncGo54Mail() {
  if (!go54MailState().enabled) throw new EditorError("Business mailbox archiving is not enabled.",409);
  const client=imap();
  let copies=0,reports=0;
  try {
    await client.connect();
    const folder=await sentFolder(client), now=new Date().toISOString();
    await teamRequest(`${table}?archive_expires_at=lt.${encodeURIComponent(now)}&encrypted_message=not.is.null`,{method:"PATCH",body:JSON.stringify({encrypted_message:null,archive_status:"expired",archive_lease_until:null})});
    const pending=await teamRequest<ArchiveEvent[]>(`${table}?select=${archiveFields}&status=eq.accepted&archive_status=in.(pending,failed)&archive_expires_at=gte.${encodeURIComponent(now)}&order=created_at.asc&limit=5`);
    for (const event of pending) if(await archiveOne(event,client,folder))copies++;
    const lock=await client.getMailboxLock("INBOX",{readOnly:true});
    try {
      // Bounded, read-only RFC delivery reports; ordinary email bodies are never fetched.
      const ids=await client.search({since:new Date(Date.now()-7*86400000),header:{"content-type":"multipart/report"}},{uid:true});
      if (ids && ids.length) {
        const messages=await client.fetchAll(ids.slice(-30),{uid:true,size:true},{uid:true});
        for (const item of messages) {
          if (!item.size || item.size>262144) continue;
          const message=await client.fetchOne(String(item.uid),{source:true},{uid:true});
          if (!message || !message.source) continue;
          const parsed=await simpleParser(message.source,{skipHtmlToText:true,skipTextToHtml:true,keepDeliveryStatus:true});
          for(const part of parsed.attachments.filter(a=>a.contentType.toLowerCase()==="message/delivery-status")) {
            for (const report of deliveryReports(part.content.toString("utf8"))) {
              const rows=await teamRequest<ArchiveEvent[]>(`${table}?select=id,delivery_status&message_id=eq.${encodeURIComponent(report.messageId)}&recipient=eq.${encodeURIComponent(report.recipient)}&status=eq.accepted&limit=1`);
              const event=rows[0];
              // Do not downgrade a permanent failure or let a delayed report replace delivery.
              if (!event || event.delivery_status==="bounced" || (event.delivery_status==="delivered" && report.status==="delayed"))continue;
              await patch(event.id,{delivery_status:report.status,delivery_checked_at:now}); reports++;
            }
          }
        }
      }
    } finally { lock.release(); }
    return {copies,reports};
  } finally { client.close(); }
}
