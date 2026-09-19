import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adapterFor } from "@/lib/suppliers";
import { computeSellPrice } from "@/lib/pricing";
import { requireAdmin } from "@/lib/auth";

const Body = z.object({ url: z.string().url(), activate: z.boolean().default(false) });

export async function POST(req: Request) {
  const denied = requireAdmin(req); if (denied) return denied;
  const { url, activate } = Body.parse(await req.json());
  const adapter = adapterFor(url);
  const p = await adapter.importByUrl(url);
  const shippingEst = p.shippingEst ?? 0;

  const product = await db.product.upsert({
    where: { sourceUrl: p.sourceUrl },
    create: {
      supplier: p.supplier, sourceUrl: p.sourceUrl, sourceSku: p.sourceSku, title: p.title,
      description: p.description, images: p.images, supplierPrice: p.price, supplierCcy: p.currency,
      sellPrice: computeSellPrice(p.price, shippingEst, p.currency), shippingEst,
      leadTimeDays: p.leadTimeDays ?? 5, inStock: p.inStock, active: activate, lastSyncedAt: new Date(),
      variants: { create: p.variants.map((v) => ({ name: v.name, sourceRef: v.sourceRef, priceDelta: v.priceDelta ?? 0, inStock: v.inStock ?? true })) },
    },
    update: { supplierPrice: p.price, inStock: p.inStock, lastSyncedAt: new Date() },
    include: { variants: true },
  });
  return NextResponse.json(product);
}
