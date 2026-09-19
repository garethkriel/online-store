import { Resend } from "resend";
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
export async function sendOrderEmail(to: string, subject: string, text: string) {
  if (!resend) { console.log("[email]", to, subject, text); return; }
  await resend.emails.send({ from: process.env.FROM_EMAIL!, to, subject, text });
}
