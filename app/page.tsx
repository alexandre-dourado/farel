'use client';

import React, { useEffect, useState } from 'react';
import { createGame, startGame, startTurn, endTurn, playCard } from '../game/engine';
import { GameState } from '../types/gameState';
import { GameStatus } from '../types/enums';
import { HeroCard } from '../components/HeroCard';
import { LaneComponent } from '../components/LaneComponent';
import { CardComponent } from '../components/CardComponent';

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Initialize Game
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' }
    ];
    let state = createGame('game_1', players);
    state = startGame(state);
    state = startTurn(state, 'p1');
    setGameState(state);
  }, []);

  if (!gameState) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">Loading...</div>;
  }

  const p1 = gameState.players['p1'];
  const p2 = gameState.players['p2'];
  const isActive = (playerId: string) => gameState.activePlayerId === playerId;

  const handleEndTurn = () => {
    try {
      setError('');
      let newState = endTurn(gameState, gameState.activePlayerId);
      newState = startTurn(newState, newState.activePlayerId);
      setGameState(newState);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handlePlayCard = (playerId: string, cardInstanceId: string) => {
    if (!isActive(playerId)) return;
    try {
      setError('');
      const newState = playCard(gameState, playerId, cardInstanceId);
      setGameState(newState);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gray-900 text-white font-sans">
      <h1 className="text-2xl font-bold mb-4">FAREL VIRTUAL MVP</h1>
      
      {error && <div className="bg-red-500 text-white p-2 rounded mb-4">{error}</div>}
      
      <div className="flex justify-between w-full max-w-6xl mb-4">
        <div className="flex flex-col gap-2">
          <HeroCard hero={p2.hero} currentEnergy={p2.currentEnergy} maxEnergyCap={p2.maxEnergyCap} />
          <div className="text-sm text-gray-400">Deck: {p2.deckCount} | Grave: {p2.graveyard.length}</div>
          <div className="text-sm font-bold text-yellow-500">{isActive('p2') ? '? ACTIVE TURN' : ''}</div>
        </div>
        
        <div className="flex items-center gap-2">
          {p2.hand.map((card, i) => (
             <div key={i} className="scale-75 origin-top">
                <CardComponent card={card} />
             </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 p-4 border-2 border-slate-700 rounded-lg bg-slate-800">
        {gameState.board.lanes.map((lane, idx) => (
          <LaneComponent key={idx} lane={lane} isP1Bottom={true} />
        ))}
      </div>

      <div className="flex justify-between w-full max-w-6xl mt-4">
        <div className="flex flex-col gap-2">
          <HeroCard hero={p1.hero} currentEnergy={p1.currentEnergy} maxEnergyCap={p1.maxEnergyCap} />
          <div className="text-sm text-gray-400">Deck: {p1.deckCount} | Grave: {p1.graveyard.length}</div>
          <div className="text-sm font-bold text-yellow-500">{isActive('p1') ? '? ACTIVE TURN' : ''}</div>
          {isActive('p1') && (
            <button 
              onClick={handleEndTurn}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
            >
              End Turn
            </button>
          )}
        </div>
        
        <div className="flex items-end gap-2 overflow-x-auto p-4">
          {p1.hand.map((card) => (
            <CardComponent 
              key={card.instanceId} 
              card={card} 
              onClick={() => handlePlayCard('p1', card.instanceId)}
            />
          ))}
        </div>
      </div>
      
      {isActive('p2') && (
         <div className="fixed top-4 right-4">
           <button 
              onClick={handleEndTurn}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg"
            >
              P2 End Turn
            </button>
         </div>
      )}
    </main>
  );
}
