"use client";
import { useState } from "react";

export default function ImportPage() {
  const [url, setUrl] = useState("");
  const [pw, setPw] = useState("");
  const [result, setResult] = useState<any>(null);
  async function go() {
    sessionStorage.setItem("adminpw", pw);
    const res = await fetch("/api/admin/import", { method: "POST", headers: { "content-type": "application/json", "x-admin-password": pw }, body: JSON.stringify({ url }) });
    setResult(await res.json());
  }
  return (
    <main className="mx-auto max-w-2xl p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Import product by URL</h1>
      <input className="w-full border p-2" type="password" placeholder="Admin password" value={pw} onChange={(e) => setPw(e.target.value)} />
      <input className="w-full border p-2" placeholder="https://www.takealot.com/..." value={url} onChange={(e) => setUrl(e.target.value)} />
      <button className="rounded bg-black px-4 py-2 text-white" onClick={go}>Import</button>
      {result && <pre className="overflow-auto rounded bg-gray-100 p-3 text-xs">{JSON.stringify(result, null, 2)}</pre>}
      <p className="text-sm text-gray-500">Imported products are inactive until you review price, variants and description in Prisma Studio (npm run db:studio) or your own product editor.</p>
    </main>
  );
}
