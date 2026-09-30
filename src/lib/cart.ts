export type CartItem = { variantId: string; qty: number; name?: string; unitPrice: number };
const KEY = "cart";
export function getCart(): CartItem[] { if (typeof window === "undefined") return []; return JSON.parse(localStorage.getItem(KEY) ?? "[]"); }
export function setCart(items: CartItem[]) { localStorage.setItem(KEY, JSON.stringify(items)); }
export function addToCart(item: CartItem) {
  const c = getCart(); const ex = c.find((x) => x.variantId === item.variantId);
  if (ex) ex.qty += item.qty; else c.push(item);
  setCart(c);
}
export function clearCart() { setCart([]); }
