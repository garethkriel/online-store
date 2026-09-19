"use client";
import { useState } from "react";
import { addToCart } from "@/lib/cart";

export default function BuyBox({ variants, basePrice }: { variants: any[]; basePrice: number }) {
  const [variantId, setVariantId] = useState(variants[0]?.id);
  const [qty, setQty] = useState(1);
  const v = variants.find((x) => x.id === variantId);
  return (
    <div className="mt-4 space-y-3">
      {variants.length > 1 && (
        <select className="w-full border p-2" value={variantId} onChange={(e) => setVariantId(e.target.value)}>
          {variants.map((x) => <option key={x.id} value={x.id}>{x.name}{Number(x.priceDelta) ? " (+R" + Number(x.priceDelta).toFixed(2) + ")" : ""}</option>)}
        </select>
      )}
      <input className="w-24 border p-2" type="number" min={1} max={20} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
      <button className="w-full rounded bg-black py-3 text-white" onClick={() => { addToCart({ variantId, qty, name: v?.name, unitPrice: basePrice + Number(v?.priceDelta ?? 0) }); location.href = "/cart"; }}>
        Add to cart — R {(basePrice + Number(v?.priceDelta ?? 0)).toFixed(2)}
      </button>
    </div>
  );
}
