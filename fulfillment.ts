import { db } from "./db";
import { adapterById } from "./suppliers";
import { sendOrderEmail } from "./email";

/** Split a paid order into one FulfillmentJob per supplier. */
export async function enqueueFulfillment(orderId: string) {
  const order = await db.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: { include: { variant: { include: { product: true } } } } } });
  const bySupplier = new Map<string, any[]>();
  for (const it of order.items) {
    const s = it.variant.product.supplier;
    if (!bySupplier.has(s)) bySupplier.set(s, []);
    bySupplier.get(s)!.push({ sourceUrl: it.variant.product.sourceUrl, sourceRef: it.variant.sourceRef, name: it.variant.product.title + " — " + it.variant.name, qty: it.qty });
  }
  const shipTo = { name: order.shipName, phone: order.phone, line1: order.shipLine1, line2: order.shipLine2, city: order.shipCity, province: order.shipProvince, postcode: order.shipPostcode, country: order.shipCountry };
  await db.$transaction([
    ...[...bySupplier].map(([supplier, items]) => db.fulfillmentJob.create({ data: { orderId, supplier: supplier as any, payload: { items, shipTo, reference: "RC-" + order.number } } })),
    db.order.update({ where: { id: orderId }, data: { status: "FULFILLING" } }),
  ]);
  await sendOrderEmail(order.email, "Order #" + order.number + " confirmed", "Thanks! We're processing your order and will email tracking as soon as it ships.");
}

/** Run one job. Auto-places if the adapter has an official placeOrder; otherwise hands to the manual queue. */
export async function processJob(jobId: string) {
  const job = await db.fulfillmentJob.findUniqueOrThrow({ where: { id: jobId } });
  const adapter = adapterById(job.supplier);
  if (!adapter?.placeOrder) {
    await db.fulfillmentJob.update({ where: { id: jobId }, data: { status: "NEEDS_MANUAL" } });
    return;
  }
  try {
    const r = await adapter.placeOrder(job.payload as any);
    await db.fulfillmentJob.update({ where: { id: jobId }, data: { status: "PLACED", supplierOrderNo: r.supplierOrderNo, trackingNo: r.trackingNo, carrier: r.carrier, placedAt: new Date() } });
    await maybeMarkShipped(job.orderId);
  } catch (e: any) {
    await db.fulfillmentJob.update({ where: { id: jobId }, data: { attempts: { increment: 1 }, lastError: String(e?.message ?? e), status: job.attempts >= 2 ? "NEEDS_MANUAL" : "QUEUED" } });
  }
}

/** Called after a manual or automatic placement. When every job has tracking, notify customer. */
export async function maybeMarkShipped(orderId: string) {
  const jobs = await db.fulfillmentJob.findMany({ where: { orderId } });
  if (jobs.length && jobs.every((j) => j.status === "PLACED" && j.trackingNo)) {
    const order = await db.order.update({ where: { id: orderId }, data: { status: "SHIPPED" } });
    const lines = jobs.map((j) => (j.carrier ?? "Carrier") + ": " + j.trackingNo).join("\n");
    await sendOrderEmail(order.email, "Order #" + order.number + " has shipped", "Your order is on its way.\n\n" + lines);
  }
}
