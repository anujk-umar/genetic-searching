import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HelixRx • Pharmacogenomics Clinical Decision Support',
  description: 'AI-assisted, deterministic CPIC pharmacogenomics clinical decision support system for variant interpretation and adverse drug event prevention.',
  keywords: ['Pharmacogenomics', 'PGx', 'CPIC Guidelines', 'VCF', 'Precision Medicine', 'Clinical Decision Support'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </body>
    </html>
  );
}
