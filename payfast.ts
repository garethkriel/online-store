import crypto from "crypto";

/** Builds a PayFast redirect form. Swap this module for Stripe/Yoco/Peach if you prefer. */
export function createPayment(o: { orderId: string; orderNumber: number; amount: number; email: string }) {
  const sandbox = process.env.PAYFAST_SANDBOX !== "false";
  const site = process.env.NEXT_PUBLIC_SITE_URL!;
  const fields: Record<string, string> = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID!,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
    return_url: site + "/order/" + o.orderId + "?paid=1",
    cancel_url: site + "/order/" + o.orderId + "?cancelled=1",
    notify_url: site + "/api/webhooks/payfast",
    email_address: o.email,
    m_payment_id: o.orderId,
    amount: o.amount.toFixed(2),
    item_name: "Order #" + o.orderNumber,
  };
  const qs = Object.entries(fields).map(([k, v]) => k + "=" + encodeURIComponent(v).replace(/%20/g, "+")).join("&");
  const pass = process.env.PAYFAST_PASSPHRASE ? "&passphrase=" + encodeURIComponent(process.env.PAYFAST_PASSPHRASE) : "";
  const signature = crypto.createHash("md5").update(qs + pass).digest("hex");
  return { action: sandbox ? "https://sandbox.payfast.co.za/eng/process" : "https://www.payfast.co.za/eng/process", fields: { ...fields, signature } };
}

export function verifyItn(body: Record<string, string>): boolean {
  const { signature, ...rest } = body;
  const qs = Object.entries(rest).map(([k, v]) => k + "=" + encodeURIComponent(v).replace(/%20/g, "+")).join("&");
  const pass = process.env.PAYFAST_PASSPHRASE ? "&passphrase=" + encodeURIComponent(process.env.PAYFAST_PASSPHRASE) : "";
  return crypto.createHash("md5").update(qs + pass).digest("hex") === signature;
  // Production: also validate source IP and POST back to PayFast /eng/query/validate.
}
