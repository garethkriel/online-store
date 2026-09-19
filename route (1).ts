import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { toStoreCcy } from "@/lib/pricing";
import { createPayment } from "@/lib/payments/payfast";

const Body = z.object({
  email: z.string().email(), phone: z.string().optional(),
  shipTo: z.object({ name: z.string(), line1: z.string(), line2: z.string().optional(), city: z.string(), province: z.string(), postcode: z.string(), country: z.string().default("ZA") }),
  items: z.array(z.object({ variantId: z.string(), qty: z.number().int().min(1).max(20) })).min(1),
});

export async function POST(req: Request) {
  const b = Body.parse(await req.json());
  const variants = await db.variant.findMany({ where: { id: { in: b.items.map((i) => i.variantId) } }, include: { product: true } });

  let subtotal = 0;
  const items = b.items.map((i) => {
    const v = variants.find((x) => x.id === i.variantId);
    if (!v || !v.product.active || !v.inStock || !v.product.inStock) throw new Error("Item unavailable: " + i.variantId);
    const unitPrice = Number(v.product.sellPrice) + Number(v.priceDelta);
    const unitCost = toStoreCcy(Number(v.product.supplierPrice) + Number(v.product.shippingEst), v.product.supplierCcy);
    subtotal += unitPrice * i.qty;
    return { variantId: v.id, qty: i.qty, unitPrice, unitCost };
  });
  const shipping = subtotal >= 500 ? 0 : 60; // your own policy
  const total = subtotal + shipping;

  const order = await db.order.create({
    data: {
      email: b.email, phone: b.phone, shipName: b.shipTo.name, shipLine1: b.shipTo.line1, shipLine2: b.shipTo.line2,
      shipCity: b.shipTo.city, shipProvince: b.shipTo.province, shipPostcode: b.shipTo.postcode, shipCountry: b.shipTo.country,
      subtotal, shipping, total, items: { create: items },
    },
  });

  const payment = createPayment({ orderId: order.id, orderNumber: order.number, amount: total, email: b.email });
  return NextResponse.json({ orderId: order.id, ...payment });
}
