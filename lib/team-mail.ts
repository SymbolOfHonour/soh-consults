import { EditorError, teamRequest } from "./editor-team";
export type EmailEvent = { id: string; member_id: string; recipient: string; kind: "invitation" | "resend" | "recovery"; status: "requested" | "accepted" | "failed"; created_at: string };
export async function sendTeamMail(member: {id:string;email:string}, kind: EmailEvent["kind"]) {
  // Record the attempt before contacting SMTP; an incomplete attempt remains unconfirmed.
  const events = await teamRequest<EmailEvent[]>("/rest/v1/editor_email_events", {method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify({member_id:member.id,recipient:member.email,kind,status:"requested"})});
  const event = events[0];
  if (!event?.id) throw new EditorError("Email history could not be saved. No email was sent.",503);
  try {
    await teamRequest(kind === "recovery" ? "/auth/v1/recover" : "/auth/v1/invite", {method:"POST",body:JSON.stringify({email:member.email})});
  } catch {
    await teamRequest(`/rest/v1/editor_email_events?id=eq.${event.id}`,{method:"PATCH",body:JSON.stringify({status:"failed",completed_at:new Date().toISOString()})}).catch(()=>{});
    throw new EditorError("Email delivery could not be confirmed. Check the inbox before using Resend invitation or retrying password reset.",503);
  }
  await teamRequest(`/rest/v1/editor_email_events?id=eq.${event.id}`,{method:"PATCH",body:JSON.stringify({status:"accepted",completed_at:new Date().toISOString()})});
}
