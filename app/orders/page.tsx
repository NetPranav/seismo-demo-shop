import { listOrders } from '../../lib/api/orders';

export const dynamic = 'force-dynamic';

export default async function Orders() {
  const orders = await listOrders(500);
  const sum = orders.reduce((s: number, o: { total_rupees: number }) => s + o.total_rupees, 0);
  return (
    <main>
      <h1>Your orders</h1>
      <p className="sub">{orders.length} orders, total ₹{sum.toLocaleString('en-IN')} (asked the provider for up to 500)</p>
      <section className="card">
        <table>
          <thead><tr><th>Order</th><th className="num">Total</th></tr></thead>
          <tbody>
            {orders.slice(0, 20).map((o: { id: string; total_rupees: number }) => (
              <tr key={o.id}><td>{o.id}</td><td className="num">₹{o.total_rupees}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
