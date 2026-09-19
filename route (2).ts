import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyItn } from "@/lib/payments/payfast";
import { enqueueFulfillment } from "@/lib/fulfillment";

export async function POST(req: Request) {
  const body = Object.fromEntries(new URLSearchParams(await req.text()));
  if (!verifyItn(body)) return new NextResponse("bad signature", { status: 400 });
  if (body.payment_status !== "COMPLETE") return new NextResponse("ok");

  const order = await db.order.findUnique({ where: { id: body.m_payment_id } });
  if (!order || order.status !== "PENDING_PAYMENT") return new NextResponse("ok");
  if (Number(body.amount_gross).toFixed(2) !== Number(order.total).toFixed(2)) return new NextResponse("amount mismatch", { status: 400 });

  await db.order.update({ where: { id: order.id }, data: { status: "PAID", paymentRef: body.pf_payment_id } });
  await enqueueFulfillment(order.id);
  return new NextResponse("ok");
}
