import { db } from "@/lib/db";
import BuyBox from "./BuyBox";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const p = await db.product.findUniqueOrThrow({ where: { id: params.id }, include: { variants: { where: { inStock: true } } } });
  return (
    <main className="mx-auto grid max-w-5xl gap-8 p-6 md:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">{p.images[0] && <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />}</div>
      <div>
        <h1 className="text-2xl font-semibold">{p.title}</h1>
        <div className="mt-2 text-xl font-bold">R {Number(p.sellPrice).toFixed(2)}</div>
        <p className="mt-1 text-sm text-gray-500">Estimated delivery: {p.leadTimeDays} days</p>
        <BuyBox variants={JSON.parse(JSON.stringify(p.variants))} basePrice={Number(p.sellPrice)} />
        {p.description && <p className="mt-6 whitespace-pre-line text-sm text-gray-700">{p.description}</p>}
      </div>
    </main>
  );
}
