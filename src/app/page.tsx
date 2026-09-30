import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await db.product.findMany({ where: { active: true, inStock: true }, orderBy: { createdAt: "desc" }, take: 48 });
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Shop</h1>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {products.map((p) => (
          <Link key={p.id} href={"/p/" + p.id} className="group">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">{p.images[0] && <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition" />}</div>
            <div className="mt-2 text-sm">{p.title}</div>
            <div className="font-semibold">R {Number(p.sellPrice).toFixed(2)}</div>
            <div className="text-xs text-gray-500">Delivery ~{p.leadTimeDays} days</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
