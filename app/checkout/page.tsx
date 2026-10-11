import { getUser } from '../../lib/api/users';
import { charge } from '../../lib/api/payments';
import { getShipment, shipmentLabel } from '../../lib/api/shipping';

export const dynamic = 'force-dynamic';

export default async function Checkout() {
  const user = await getUser('u_1');
  const shipment = await getShipment('sh_1');
  const { total, captured } = await charge('o_1', 499);
  const customer = user.name;
  const contact = user.email;
  const delivery = shipment.status === 'partially_shipped' ? 'Partly shipped' : shipmentLabel(shipment.status);
  return (
    <main>
      <h1>Checkout</h1>
      <p className="sub">Order o_1 · Masala chai, 250 g</p>
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
    </main>
  );
}
