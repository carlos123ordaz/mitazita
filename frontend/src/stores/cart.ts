export interface CartMugItem {
  id: string;
  type: 'mug';
  modelId: string;
  modelName: string;
  photoUrl: string | null;
  text: { name: string; dedication: string };
  extras: { caja: boolean; tarjeta: boolean; magica: boolean; delivery: boolean };
  price: number;
}

export interface CartProductItem {
  id: string;
  type: 'product';
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
}

export type CartItem = CartMugItem | CartProductItem;

const KEY = 'mitazita_cart';
const EVENT = 'mitazita:cart';

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

function save(cart: CartItem[]): void {
  localStorage.setItem(KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: [...cart] }));
}

type AddableItem = Omit<CartMugItem, 'id'> | Omit<CartProductItem, 'id'>;

export function addToCart(item: AddableItem): void {
  save([...getCart(), { ...item, id: uid() } as CartItem]);
}

export function removeFromCart(id: string): void {
  save(getCart().filter(i => i.id !== id));
}

export function clearCart(): void {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: [] }));
}

export function onCartChange(cb: (items: CartItem[]) => void): () => void {
  const h = (e: Event) => cb((e as CustomEvent<CartItem[]>).detail);
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}
