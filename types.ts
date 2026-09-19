import type { Supplier } from "@prisma/client";

export interface ImportedVariant { name: string; sourceRef?: string; priceDelta?: number; inStock?: boolean }

export interface ImportedProduct {
  supplier: Supplier;
  sourceUrl: string;
  sourceSku?: string;
  title: string;
  description?: string;
  images: string[];
  price: number;          // supplier price in supplierCcy
  currency: string;
  shippingEst?: number;   // estimated supplier→customer shipping in supplierCcy
  leadTimeDays?: number;
  inStock: boolean;
  variants: ImportedVariant[];
}

export interface ShipTo {
  name: string; phone?: string; line1: string; line2?: string;
  city: string; province: string; postcode: string; country: string;
}

export interface PlaceOrderInput {
  items: { sourceUrl: string; sourceRef?: string; name: string; qty: number }[];
  shipTo: ShipTo;
  reference: string; // your order number
}

export interface PlaceOrderResult { supplierOrderNo: string; trackingNo?: string; carrier?: string }

/**
 * A supplier adapter. importByUrl is required. placeOrder is OPTIONAL and should only be
 * implemented against an official supplier API / dropship programme. When absent, orders
 * for this supplier are routed to the manual fulfillment queue.
 */
export interface SupplierAdapter {
  id: Supplier;
  matches(url: string): boolean;
  importByUrl(url: string): Promise<ImportedProduct>;
  refreshPrice?(sourceUrl: string): Promise<{ price: number; inStock: boolean }>;
  placeOrder?(input: PlaceOrderInput): Promise<PlaceOrderResult>;
}
