import { getUser } from '../../lib/api/users';
import { charge } from '../../lib/api/payments';
import { getShipment, shipmentLabel } from '../../lib/api/shipping';
import { CUSTOMERS, SHIPMENTS, productById } from '../../lib/products';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ product?: string }> };

// Placing an order: one call each to the users, shipping and payments APIs (all watched by Seismo).
export default async function Checkout({ searchParams }: Props) {
  const product = productById((await searchParams).product);
  const orderNo = 1 + Math.floor(Math.random() * 600);
  const user = await getUser(CUSTOMERS[orderNo % CUSTOMERS.length]!);
  const shipment = await getShipment(SHIPMENTS[orderNo % SHIPMENTS.length]!);
  const { total, captured } = await charge(`o_${orderNo}`, product.price);
  const customer = user.name;
  const contact = user.email;
  const delivery = shipment.status === 'partially_shipped' ? 'Partly shipped' : shipmentLabel(shipment.status);
  return (
    <main>
      <h1>{captured ? 'Order placed ✓' : 'Order received'}</h1>
      <p className="sub">Order o_{orderNo} · {product.name}</p>
      <div className="grid">
        <section className="card">
          <h2>Customer</h2>
          <div className="big">{customer || <span className="missing">name missing</span>}</div>
          <div>{contact}</div>
        </section>
        <section className="card">
          <h2>Payment</h2>
          <div className="row"><span className="k">Total incl. GST</span><span className="big">₹{total.toFixed(2)}</span></div>
          <div className="row"><span className="k">Status</span><span className={captured ? 'pill ok' : 'pill warn'}>{captured ? 'Paid' : 'Pending'}</span></div>
        </section>
        <section className="card">
          <h2>Delivery</h2>
          <span className="pill">{delivery}</span>
        </section>
      </div>
      <p className="note">
        <a className="btn" href={`/checkout?product=${product.id}`}>Place another order</a>{' '}
        <a href="/">Back to the shop</a>
      </p>
    </main>
  );
}
