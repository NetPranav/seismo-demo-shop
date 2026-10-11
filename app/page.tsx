import { PRODUCTS } from '../lib/products';

export default function Home() {
  return (
    <main>
      <h1>Fresh chai, delivered</h1>
      <p className="sub">A demo shop that depends on four third-party APIs (users, payments, shipping, orders). Seismo watches them.</p>
      <div className="grid">
        {PRODUCTS.map((p) => (
          <div key={p.id} className="card product">
            <div className="img" aria-hidden>{p.icon}</div>
            <strong>{p.name}</strong>
            <span className="price">₹{p.price}</span>
            <a className="btn" href={`/checkout?product=${p.id}`}>Buy now</a>
          </div>
        ))}
      </div>
      <p className="note">
        Every order calls the users, shipping and payments APIs live. Open the Seismo dashboard (Overview → Live activity) to watch
        the calls arrive.
      </p>
    </main>
  );
}
