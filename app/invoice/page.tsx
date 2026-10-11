import { getUser } from '../../lib/api/users';
import { getPayment } from '../../lib/api/payments';
import { invoiceLines } from '../../lib/invoice';

export const dynamic = 'force-dynamic';

export default async function Invoice() {
  const user = await getUser('u_1');
  const payment = await getPayment('pay_1');
  const lines = invoiceLines(user, payment);
  return (
    <main>
      <h1>Invoice</h1>
      <p className="sub">Invoice for payment pay_1</p>
      <section className="card">
        <div className="row"><span className="k">Customer</span><span>{lines.billedTo}</span></div>
        <div className="row"><span className="k">Item</span><span>Masala chai, 250 g</span></div>
        <div className="row"><span className="k">Amount</span><span className="big">{lines.amount}</span></div>
      </section>
    </main>
  );
}
