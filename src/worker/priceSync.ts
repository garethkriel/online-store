import { db } from "../lib/db";
import { adapterById } from "../lib/suppliers";
import { marginOk } from "../lib/pricing";

/** Re-check supplier price/stock for active products; deactivate anything out of stock or below margin floor. */
(async () => {
  const products = await db.product.findMany({ where: { active: true } });
  for (const p of products) {
    const a = adapterById(p.supplier);
    if (!a?.refreshPrice) continue;
    try {
      const r = await a.refreshPrice(p.sourceUrl);
      const ok = r.inStock && marginOk(Number(p.sellPrice), r.price, Number(p.shippingEst), p.supplierCcy);
      await db.product.update({ where: { id: p.id }, data: { supplierPrice: r.price, inStock: r.inStock, active: ok, lastSyncedAt: new Date() } });
      if (!ok) console.log("Deactivated:", p.title, r);
    } catch (e: any) { console.error("Sync failed:", p.sourceUrl, e?.message); }
    await new Promise((r) => setTimeout(r, 1500)); // be polite to supplier sites
  }
  process.exit(0);
})();
