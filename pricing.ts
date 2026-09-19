const MARKUP = Number(process.env.DEFAULT_MARKUP_PCT ?? 35) / 100;
const MIN_MARGIN = Number(process.env.MIN_MARGIN_ZAR ?? 40);
const FX: Record<string, number> = { ZAR: 1, USD: Number(process.env.FX_USD_ZAR ?? 18.5) };

export function toStoreCcy(amount: number, ccy: string): number {
  const rate = FX[ccy.toUpperCase()];
  if (!rate) throw new Error("No FX rate configured for " + ccy);
  return amount * rate;
}

/** Landed cost = supplier price + supplier shipping, converted. Sell = max(cost*(1+markup), cost+minMargin), rounded to .99 */
export function computeSellPrice(supplierPrice: number, shippingEst: number, ccy: string): number {
  const cost = toStoreCcy(supplierPrice + shippingEst, ccy);
  const target = Math.max(cost * (1 + MARKUP), cost + MIN_MARGIN);
  return Math.floor(target) + 0.99;
}

/** Guardrail: refuse to activate a listing whose margin has evaporated after a price sync. */
export function marginOk(sellPrice: number, supplierPrice: number, shippingEst: number, ccy: string): boolean {
  return sellPrice - toStoreCcy(supplierPrice + shippingEst, ccy) >= MIN_MARGIN;
}
