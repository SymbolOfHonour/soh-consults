import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";

export const businessMailbox = "support@sohconsults.com.ng";
export const businessLogo = "https://rajbswknmdscrilrcwoj.supabase.co/storage/v1/object/public/news-attachments/soh-email-logo-20261021.jpg";

function key() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("Mail archive encryption is unavailable");
  return Buffer.from(hkdfSync("sha256", secret, "soh-mail-archive-v1", "encrypted-outbox", 32));
}
// Authentication links are never stored in plaintext. Bind each payload to its audit row.
export function sealMessage(raw: Buffer, eventId: string) {
  const iv = randomBytes(12), cipher = createCipheriv("aes-256-gcm", key(), iv);
  cipher.setAAD(Buffer.from(eventId));
  const data = Buffer.concat([cipher.update(raw), cipher.final()]);
  return ["v1", iv.toString("base64"), cipher.getAuthTag().toString("base64"), data.toString("base64")].join(".");
}
export function openMessage(value: string, eventId: string) {
  const [version, iv, tag, data] = value.split(".");
  if (version !== "v1" || !iv || !tag || !data) throw new Error("Invalid archive payload");
  const cipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
  cipher.setAAD(Buffer.from(eventId)); cipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([cipher.update(Buffer.from(data, "base64")), cipher.final()]);
}
const escape = (value: string) => value.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
export function writerMail(kind: "invitation" | "resend" | "recovery", token: string) {
  if (!/^[a-f0-9]{32,128}$/i.test(token)) throw new Error("Invalid account link");
  const recovery = kind === "recovery";
  const link = `https://sohconsults.com.ng/admin/writer#${recovery ? "recovery" : "invite"}=${token}`;
  const subject = recovery ? "Reset your S.O.H CONSULTS password" : "Your invitation to the S.O.H CONSULTS writing team";
  const action = recovery ? "Reset password" : "Activate your writer account";
  const intro = recovery ? "We received a request to reset your writer workspace password." : "You have been invited to the private S.O.H CONSULTS writer workspace. Create your password to start writing and publishing with the team.";
  const text = `${subject}\n\n${intro}\n\n${action}: ${link}\n\nChoose a password of 8–128 characters. This personal link can only be used once. Do not forward it. If you did not expect this email, ignore it.\n\nS.O.H CONSULTS\nEducation. Guidance. Opportunity.\nContact support: ${businessMailbox}\nhttps://sohconsults.com.ng/`;
  const html = `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${subject}</title></head><body style="margin:0;background:#f1f4f0;font-family:Arial,Helvetica,sans-serif;color:#172c23"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border:1px solid #dce5dc;border-top:5px solid #15803d;border-radius:16px;overflow:hidden"><tr><td style="padding:26px 32px"><a href="https://sohconsults.com.ng/"><img src="${businessLogo}" alt="S.O.H CONSULTS" width="184" style="display:block;border:0;max-width:100%;height:auto"></a></td></tr><tr><td bgcolor="#103f2d" style="padding:32px;background:#103f2d;color:#fff"><p style="font-size:11px;letter-spacing:2px;color:#b5d9ad">${recovery ? "ACCOUNT RECOVERY" : "EDITORIAL TEAM"}</p><h1 style="font-family:Georgia,serif;font-size:38px;line-height:1.15;font-weight:normal;margin:14px 0">Your next story<br>starts here.</h1><p style="color:#d9e9de;line-height:1.6">Secure access to your S.O.H CONSULTS writer workspace.</p></td></tr><tr><td style="padding:32px"><h2 style="font-size:23px;color:#153d2b">${recovery ? "Let’s get you back to writing." : "Welcome to the writing team."}</h2><p style="font-size:15px;line-height:1.7;color:#4e6057">${escape(intro)}</p><p style="padding:18px;background:#f3f7f1;border-left:3px solid #78a85a;font-size:14px;line-height:1.7">Choose a password of <strong>8–128 characters</strong>. Your personal link can only be used once.</p><p style="padding:12px 0"><a href="${link}" style="display:inline-block;background:#15703d;color:#fff;padding:17px 24px;border-radius:9px;font-size:15px;font-weight:bold;text-decoration:none">${action} →</a></p><p style="font-size:12px;line-height:1.7;color:#66766c">Button not opening? <a href="${link}" style="color:#15703d">Open your secure account link.</a></p><p style="border-top:1px solid #e3eae3;padding-top:20px;font-size:12px;line-height:1.7;color:#718075">Keep this link private. Please do not forward it. If you weren’t expecting this email, you can safely ignore it.</p></td></tr></table><p style="font-size:12px;line-height:1.8;color:#50604f"><strong>S.O.H CONSULTS</strong><br>Education. Guidance. Opportunity.<br><a href="https://sohconsults.com.ng/" style="color:#3b6350">Visit our website</a> · <a href="mailto:${businessMailbox}" style="color:#3b6350">${businessMailbox}</a></p></td></tr></table></body></html>`;
  return {subject,text,html};
}

export type DeliveryReport = { messageId: string; recipient: string; status: "bounced" | "delayed" | "delivered" };
// Only structured RFC 3464 recipient reports count; subject lines are not evidence.
export function deliveryReports(content: string): DeliveryReport[] {
  const unfolded = content.replace(/\r\n/g, "\n").replace(/\n[ \t]+/g, " ");
  const blocks = unfolded.split(/\n\s*\n/), output: DeliveryReport[] = [];
  const field = (block: string, name: string) => block.match(new RegExp(`^${name}:[ \\t]*(.+)$`, "im"))?.[1]?.trim();
  const envelopeId = blocks.map(b => field(b,"Original-Envelope-ID")).find(Boolean);
  const messageId = blocks.map(b => field(b, "Original-Message-ID")).find(Boolean) || (envelopeId && /^[a-f0-9-]{36}$/i.test(envelopeId) ? `<soh-${envelopeId}@sohconsults.com.ng>` : undefined);
  if (!messageId || !/^<soh-[a-f0-9-]{36}@sohconsults\.com\.ng>$/i.test(messageId)) return output;
  for (const block of blocks) {
    const recipient = field(block,"Final-Recipient")?.match(/^rfc822;\s*([^\s<>]+@[^\s<>]+)$/i)?.[1]?.toLowerCase();
    const action = field(block,"Action")?.toLowerCase(), status = field(block,"Status");
    if (!recipient || !status) continue;
    if (action === "failed" && /^5\.\d{1,3}\.\d{1,3}$/.test(status)) output.push({messageId,recipient,status:"bounced"});
    if (action === "delayed" && /^4\.\d{1,3}\.\d{1,3}$/.test(status)) output.push({messageId,recipient,status:"delayed"});
    if (action === "delivered" && /^2\.\d{1,3}\.\d{1,3}$/.test(status)) output.push({messageId,recipient,status:"delivered"});
  }
  return output;
}
