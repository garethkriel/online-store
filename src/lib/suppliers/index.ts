import type { SupplierAdapter } from "./types";
import { genericAdapter } from "./generic";

/**
 * Register adapters here. Start with the generic importer; replace an entry with a
 * dedicated adapter when you join that supplier's official programme, e.g.
 *   - Temu Affiliate / Temu dropship partner API
 *   - Shein affiliate / dropship partner
 *   - Takealot affiliate product feed
 * A dedicated adapter can implement placeOrder to automate that supplier end-to-end.
 */
export const adapters: SupplierAdapter[] = [
  genericAdapter("TAKEALOT", ["takealot.com"]),
  genericAdapter("MAKRO", ["makro.co.za"]),
  genericAdapter("TEMU", ["temu.com"]),
  genericAdapter("SHEIN", ["shein.com", "shein.co.za"]),
];

export function adapterFor(url: string): SupplierAdapter {
  return adapters.find((a) => a.matches(url)) ?? genericAdapter("OTHER", [new URL(url).hostname]);
}

export function adapterById(id: SupplierAdapter["id"]): SupplierAdapter | undefined {
  return adapters.find((a) => a.id === id);
}
