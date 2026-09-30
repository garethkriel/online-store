import * as cheerio from "cheerio";
import type { SupplierAdapter, ImportedProduct } from "./types";

/**
 * Generic importer for any store that publishes Open Graph / schema.org Product metadata
 * (Takealot, Makro and most retailers do). Pulls title, image, price. Variants must be
 * added by hand in the admin unless the supplier adapter overrides this.
 *
 * Respect each site's robots.txt and terms; importing a handful of products you intend to
 * resell is a different thing from crawling a catalogue. Prefer official affiliate/product
 * feeds where the retailer offers one.
 */
export async function importGeneric(url: string, supplier: ImportedProduct["supplier"]): Promise<ImportedProduct> {
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; RelayCommerce/1.0)" } });
  if (!res.ok) throw new Error("Fetch failed: " + res.status);
  const html = await res.text();
  const $ = cheerio.load(html);

  // 1) schema.org Product JSON-LD
  let ld: any = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const j = JSON.parse($(el).text());
      const arr = Array.isArray(j) ? j : [j];
      const p = arr.find((x) => x["@type"] === "Product" || (Array.isArray(x["@type"]) && x["@type"].includes("Product")));
      if (p && !ld) ld = p;
    } catch {}
  });

  const offer = ld?.offers ? (Array.isArray(ld.offers) ? ld.offers[0] : ld.offers) : null;
  const title = ld?.name || $('meta[property="og:title"]').attr("content") || $("title").text().trim();
  const image = ld?.image ? (Array.isArray(ld.image) ? ld.image : [ld.image]) : [$('meta[property="og:image"]').attr("content")].filter(Boolean);
  const priceRaw = offer?.price ?? $('meta[property="product:price:amount"]').attr("content");
  const currency = offer?.priceCurrency ?? $('meta[property="product:price:currency"]').attr("content") ?? "ZAR";
  const availability = String(offer?.availability ?? "").toLowerCase();

  if (!title || priceRaw == null) throw new Error("Could not read product title/price from page — add it manually in admin.");

  return {
    supplier,
    sourceUrl: url,
    sourceSku: ld?.sku,
    title: String(title).slice(0, 200),
    description: ld?.description || $('meta[property="og:description"]').attr("content") || undefined,
    images: (image as string[]).map(String),
    price: Number(priceRaw),
    currency,
    inStock: availability ? availability.includes("instock") : true,
    variants: [{ name: "Default" }],
  };
}

export function genericAdapter(id: ImportedProduct["supplier"], hosts: string[]): SupplierAdapter {
  return {
    id,
    matches: (url) => hosts.some((h) => new URL(url).hostname.endsWith(h)),
    importByUrl: (url) => importGeneric(url, id),
    async refreshPrice(url) {
      const p = await importGeneric(url, id);
      return { price: p.price, inStock: p.inStock };
    },
    // placeOrder intentionally NOT implemented → manual fulfillment queue.
  };
}
