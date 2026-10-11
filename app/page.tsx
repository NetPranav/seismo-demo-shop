const PRODUCTS = [
  { name: 'Masala chai, 250 g', price: 499, icon: '🍵' },
  { name: 'Assam gold, 500 g', price: 899, icon: '🫖' },
  { name: 'Clay kulhad set', price: 349, icon: '🏺' },
];

export default function Home() {
  return (
    <main>
      <h1>Fresh chai, delivered</h1>
      <p className="sub">A demo shop that depends on four third-party APIs (users, payments, shipping, orders). Seismo watches them.</p>
      <div className="grid">
        {PRODUCTS.map((p) => (
          <div key={p.name} className="card product">
            <div className="img" aria-hidden>{p.icon}</div>
            <strong>{p.name}</strong>
            <span className="price">₹{p.price}</span>
            <a className="btn" href="/checkout">Buy now</a>
          </div>
        ))}
      </div>
      <p className="note">Checkout reads the customer, the payment and the shipment; the invoice reads the customer name and amount; orders lists your last orders.</p>
    </main>
  );
}
