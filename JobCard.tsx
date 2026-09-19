"use client";
import { useState } from "react";

export default function JobCard({ job }: { job: any }) {
  const [supplierOrderNo, setNo] = useState("");
  const [trackingNo, setTrack] = useState("");
  const [carrier, setCarrier] = useState("");
  const [done, setDone] = useState(false);
  const p = job.payload;
  const addr = [p.shipTo.name, p.shipTo.line1, p.shipTo.line2, p.shipTo.city, p.shipTo.province, p.shipTo.postcode, p.shipTo.country].filter(Boolean).join(", ");

  async function submit() {
    const res = await fetch("/api/admin/jobs/" + job.id, {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-admin-password": sessionStorage.getItem("adminpw") ?? "" },
      body: JSON.stringify({ supplierOrderNo, trackingNo: trackingNo || undefined, carrier: carrier || undefined }),
    });
    if (res.ok) setDone(true); else alert("Failed: " + (await res.text()));
  }

  if (done) return null;
  return (
    <div className="rounded-lg border p-4">
      <div className="flex justify-between">
        <div><span className="font-mono text-sm">{p.reference}</span> · <b>{job.supplier}</b> · {job.status}</div>
        <div className="text-sm text-gray-500">{new Date(job.createdAt).toLocaleString()}</div>
      </div>
      <ul className="mt-2 list-disc pl-5 text-sm">
        {p.items.map((it: any, i: number) => (
          <li key={i}>{it.qty} × <a className="underline" href={it.sourceUrl} target="_blank" rel="noreferrer">{it.name}</a>{it.sourceRef ? " (" + it.sourceRef + ")" : ""}</li>
        ))}
      </ul>
      <div className="mt-2 text-sm">
        <b>Ship to:</b> {addr} {p.shipTo.phone ? " · " + p.shipTo.phone : ""}
        <button className="ml-2 text-xs underline" onClick={() => navigator.clipboard.writeText(addr)}>copy</button>
      </div>
      {job.lastError && <p className="mt-2 text-xs text-red-600">Last error: {job.lastError}</p>}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <input className="border p-2 text-sm" placeholder="Supplier order #" value={supplierOrderNo} onChange={(e) => setNo(e.target.value)} />
        <input className="border p-2 text-sm" placeholder="Tracking #" value={trackingNo} onChange={(e) => setTrack(e.target.value)} />
        <input className="border p-2 text-sm" placeholder="Carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
      </div>
      <button className="mt-2 rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-40" disabled={!supplierOrderNo} onClick={submit}>Mark placed</button>
    </div>
  );
}
