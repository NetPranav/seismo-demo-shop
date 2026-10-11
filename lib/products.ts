/** The shop's catalogue (local data, not from an API). */
export const PRODUCTS = [
  { id: 'chai', name: 'Masala chai, 250 g', price: 499, icon: '🍵' },
  { id: 'assam', name: 'Assam gold, 500 g', price: 899, icon: '🫖' },
  { id: 'kulhad', name: 'Clay kulhad set', price: 349, icon: '🏺' },
];
export const productById = (id?: string) => PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0]!;
/** Each order goes to one of the four demo customers, so the users API sees varied traffic. */
export const CUSTOMERS = ['u_1', 'u_2', 'u_3', 'u_4'];
export const SHIPMENTS = ['sh_1', 'sh_2'];
