import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FAREL TCG 3.0 — Arena de Batalha Tática de Fantasia Épica',
  description: 'Arena de Batalha Farel TCG 3.0: Grid Tático 2.5D com 5 Linhas de Profundidade, Heróis Oficiais de 30 HP, 5 Cristais de Energia e Action Spotlight.',
  openGraph: {
    title: 'FAREL TCG 3.0 — Arena de Batalha Tática de Fantasia Épica',
    description: 'Arena de Batalha Farel TCG 3.0: Grid Tático 2.5D com 5 Linhas de Profundidade, Heróis Oficiais de 30 HP, 5 Cristais de Energia e Action Spotlight.',
    url: 'https://farel-tcg.local',
    siteName: 'FAREL TCG',
    images: [
      {
        url: '/thumbnail.webp',
        width: 1200,
        height: 630,
        alt: 'FAREL TCG 3.0 - Arena Tática e Cartas de Fantasia Épica',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-[#10151d] text-[#f3f5f7] antialiased selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
