import { db } from "@/lib/db";
import JobCard from "./JobCard";

export const dynamic = "force-dynamic";

export default async function FulfillmentPage() {
  const jobs = await db.fulfillmentJob.findMany({
    where: { status: { in: ["NEEDS_MANUAL", "QUEUED", "FAILED"] } },
    include: { order: true }, orderBy: { createdAt: "asc" },
  });
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Fulfillment queue ({jobs.length})</h1>
      {jobs.length === 0 && <p className="text-gray-500">Nothing to place. Nice.</p>}
      <div className="space-y-4">{jobs.map((j) => <JobCard key={j.id} job={JSON.parse(JSON.stringify(j))} />)}</div>
    </main>
  );
}
