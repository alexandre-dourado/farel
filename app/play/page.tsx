import type { Metadata } from 'next';
import { DuelArena } from '../../components/forbidden-memories/DuelArena';

export const metadata: Metadata = {
  title: 'FAREL TCG 1.1 — Arena de Duelo (Estilo Forbidden Memories)',
  description: 'Duelo TCG em tela cheia (100dvh estrito) com combate d6, perspectiva 2.5D, inspecionador PS1 e modo Hotseat com rotação 180°.',
  openGraph: {
    title: 'FAREL TCG 1.1 — Arena de Duelo',
    description: 'Duelo TCG tático em tela cheia sem scroll, inspirado em Yu-Gi-Oh! Forbidden Memories.',
    images: [{ url: '/thumbnail.webp', width: 1200, height: 630, alt: 'FAREL TCG 1.1' }]
  }
};

export default function PlayPage() {
  return (
    <main className="w-screen h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#071017]">
      <DuelArena />
    </main>
  );
}
