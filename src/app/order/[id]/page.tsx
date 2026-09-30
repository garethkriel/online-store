import { db } from "@/lib/db";
export default async function OrderPage({ params }: { params: { id: string } }) {
  const o = await db.order.findUniqueOrThrow({ where: { id: params.id }, include: { jobs: true } });
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold">Order #{o.number}</h1>
      <p className="mt-2">Status: <b>{o.status.replace("_", " ")}</b></p>
      <p className="text-sm text-gray-500">Total R {Number(o.total).toFixed(2)} · we'll email {o.email} with tracking.</p>
      {o.jobs.filter((j) => j.trackingNo).map((j) => <p key={j.id} className="mt-2 text-sm">{j.carrier ?? "Tracking"}: {j.trackingNo}</p>)}
    </main>
  );
}
