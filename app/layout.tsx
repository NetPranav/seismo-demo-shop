import type { ReactNode } from 'react';
import './globals.css';

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
      </body>
    </html>
  );
}
