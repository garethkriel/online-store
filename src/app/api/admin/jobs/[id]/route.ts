import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { maybeMarkShipped } from "@/lib/fulfillment";

const Body = z.object({ supplierOrderNo: z.string().min(1), trackingNo: z.string().optional(), carrier: z.string().optional() });

/** Admin marks a manual job as placed on the supplier site and records tracking. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const denied = requireAdmin(req); if (denied) return denied;
  const b = Body.parse(await req.json());
  const job = await db.fulfillmentJob.update({ where: { id: params.id }, data: { ...b, status: "PLACED", placedAt: new Date() } });
  await maybeMarkShipped(job.orderId);
  return NextResponse.json(job);
}
