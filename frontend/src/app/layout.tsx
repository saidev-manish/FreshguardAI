import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../context/AppContext';
import { AppLayout } from '../components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'FreshGuard AI — Perishable Demand & Risk Support',
  description: 'Agentic decision support for grocery store perishable demand forecasting and shelf-life risk management.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-800">
        <AppProvider>
          <AppLayout>{children}</AppLayout>
        </AppProvider>
      </body>
    </html>
  );
}
