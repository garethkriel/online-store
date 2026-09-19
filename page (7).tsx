"use client";
import { useEffect, useState } from "react";
import { getCart, clearCart, type CartItem } from "@/lib/cart";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [f, setF] = useState({ email: "", phone: "", name: "", line1: "", line2: "", city: "", province: "", postcode: "" });
  useEffect(() => setItems(getCart()), []);
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  async function checkout() {
    const res = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: f.email, phone: f.phone, shipTo: { ...f, country: "ZA" }, items: items.map(({ variantId, qty }) => ({ variantId, qty })) }) });
    if (!res.ok) { alert(await res.text()); return; }
    const { action, fields } = await res.json();
    clearCart();
    const form = document.createElement("form"); form.method = "POST"; form.action = action;
    for (const [k, v] of Object.entries(fields)) { const i = document.createElement("input"); i.type = "hidden"; i.name = k; i.value = String(v); form.appendChild(i); }
    document.body.appendChild(form); form.submit();
  }

  const field = (k: keyof typeof f, ph: string, type = "text") => <input key={k} className="border p-2" type={type} placeholder={ph} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />;
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Cart</h1>
      <ul className="my-4 divide-y">{items.map((i) => <li key={i.variantId} className="flex justify-between py-2 text-sm"><span>{i.qty} × {i.name ?? i.variantId}</span><span>R {(i.unitPrice * i.qty).toFixed(2)}</span></li>)}</ul>
      <div className="text-right font-semibold">Subtotal: R {subtotal.toFixed(2)}</div>
      <h2 className="mt-6 font-semibold">Delivery details</h2>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {field("email", "Email", "email")}{field("phone", "Phone")}{field("name", "Full name")}{field("line1", "Street address")}
        {field("line2", "Apartment / complex (optional)")}{field("city", "City")}{field("province", "Province")}{field("postcode", "Postal code")}
      </div>
      <button className="mt-4 w-full rounded bg-black py-3 text-white disabled:opacity-40" disabled={!items.length || !f.email || !f.name || !f.line1 || !f.city || !f.postcode} onClick={checkout}>Pay with PayFast</button>
    </main>
  );
}
