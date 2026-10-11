import type { ReactNode } from 'react';
import './globals.css';
import DemoPanel from '../components/DemoPanel';

export const metadata = { title: 'Seismo Demo Shop' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="top">
          <div className="top-in">
            <a href="/" className="brand">Chai<span>&amp;</span>Co.</a>
            <nav className="nav">
              <a href="/">Shop</a>
              <a href="/checkout">Checkout</a>
              <a href="/invoice">Invoice</a>
              <a href="/orders">Orders</a>
            </nav>
          </div>
        </header>
        <div className="wrap">{children}</div>
        {process.env.DEMO_PANEL === 'true' && <DemoPanel />}
      </body>
    </html>
  );
}
