'use client';

import React, { useEffect, useState } from 'react';
import { createGame, startGame, startTurn, endTurn, playCard } from '../game/engine';
import { GameState } from '../types/gameState';
import { HeroCard } from '../components/HeroCard';
import { LaneComponent } from '../components/LaneComponent';
import { CardComponent } from '../components/CardComponent';
import { pollState, submitAction, createMatch } from '../lib/api';

export default function Home() {
  const [inLobby, setInLobby] = useState(true);
  const [matchId, setMatchId] = useState('match_1');
  const [playerId, setPlayerId] = useState('p1');
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string>('');

  // Polling
  useEffect(() => {
    if (inLobby) return;

    const poll = async () => {
      try {
        const res = await pollState(matchId);
        if (res && res.success === true && res.state) {
          setGameState(res.state);
        }
      } catch (err: any) {
        console.error('Polling error:', err);
      }
    };

    poll(); // Initial poll
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [inLobby, matchId]);

  const handleStartMatch = async () => {
    try {
      if (playerId === 'p1') {
        const players = [
          { id: 'p1', name: 'Alice' },
          { id: 'p2', name: 'Bob' }
        ];
        let state = createGame(matchId, players);
        state = startGame(state);
        state = startTurn(state, 'p1');
        await createMatch(matchId, state);
      }
      setInLobby(false);
    } catch (e: any) {
      setError('Failed to create match: ' + e.message);
    }
  };

  const handleJoinMatch = () => {
    setInLobby(false);
  };

  if (inLobby) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-4">
        <h1 className="text-3xl font-bold mb-8">FAREL VIRTUAL MVP</h1>
        <div className="flex flex-col gap-4 bg-slate-800 p-8 rounded-lg shadow-lg">
          <div>
            <label className="block mb-2 text-sm font-bold">Match ID</label>
            <input 
              type="text" 
              value={matchId} 
              onChange={(e) => setMatchId(e.target.value)} 
              className="w-full p-2 rounded text-black"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-bold">Choose Player</label>
            <div className="flex gap-4">
              <label>
                <input type="radio" value="p1" checked={playerId === 'p1'} onChange={(e) => setPlayerId(e.target.value)} className="mr-2"/>
                Player 1 (Alice)
              </label>
              <label>
                <input type="radio" value="p2" checked={playerId === 'p2'} onChange={(e) => setPlayerId(e.target.value)} className="mr-2"/>
                Player 2 (Bob)
              </label>
            </div>
          </div>
          <button 
            onClick={playerId === 'p1' ? handleStartMatch : handleJoinMatch}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {playerId === 'p1' ? 'Create & Enter Match' : 'Join Match'}
          </button>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
      </div>
    );
  }

  if (!gameState) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">Loading or waiting for state...</div>;
  }

  const myPlayer = gameState.players[playerId];
  const enemyPlayerId = playerId === 'p1' ? 'p2' : 'p1';
  const enemyPlayer = gameState.players[enemyPlayerId];
  
  const isActive = (pid: string) => gameState.activePlayerId === pid;

  const handleEndTurn = async () => {
    try {
      setError('');
      let newState = endTurn(gameState, gameState.activePlayerId);
      newState = startTurn(newState, newState.activePlayerId);
      await submitAction(matchId, newState);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handlePlayCard = async (cardInstanceId: string) => {
    if (!isActive(playerId)) return;
    try {
      setError('');
      const newState = playCard(gameState, playerId, cardInstanceId);
      await submitAction(matchId, newState);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gray-900 text-white font-sans">
      <h1 className="text-2xl font-bold mb-4">Match: {matchId} | You are {myPlayer.name} ({playerId})</h1>
      
      {error && <div className="bg-red-500 text-white p-2 rounded mb-4">{error}</div>}
      
      <div className="flex justify-between w-full max-w-6xl mb-4">
        <div className="flex flex-col gap-2">
          <HeroCard hero={enemyPlayer.hero} currentEnergy={enemyPlayer.currentEnergy} maxEnergyCap={enemyPlayer.maxEnergyCap} />
          <div className="text-sm text-gray-400">Deck: {enemyPlayer.deckCount} | Grave: {enemyPlayer.graveyard.length}</div>
          <div className="text-sm font-bold text-yellow-500">{isActive(enemyPlayerId) ? '⚔ ACTIVE TURN' : ''}</div>
        </div>
        
        <div className="flex items-center gap-2">
          {enemyPlayer.hand.map((card, i) => (
             <div key={i} className="scale-75 origin-top">
                <CardComponent card={card} />
             </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 p-4 border-2 border-slate-700 rounded-lg bg-slate-800">
        {gameState.board.lanes.map((lane, idx) => (
          <LaneComponent key={idx} lane={lane} isP1Bottom={playerId === 'p1'} />
        ))}
      </div>

      <div className="flex justify-between w-full max-w-6xl mt-4">
        <div className="flex flex-col gap-2">
          <HeroCard hero={myPlayer.hero} currentEnergy={myPlayer.currentEnergy} maxEnergyCap={myPlayer.maxEnergyCap} />
          <div className="text-sm text-gray-400">Deck: {myPlayer.deckCount} | Grave: {myPlayer.graveyard.length}</div>
          <div className="text-sm font-bold text-yellow-500">{isActive(playerId) ? '⚔ YOUR TURN' : ''}</div>
          {isActive(playerId) && (
            <button 
              onClick={handleEndTurn}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
            >
              End Turn
            </button>
          )}
        </div>
        
        <div className="flex items-end gap-2 overflow-x-auto p-4">
          {myPlayer.hand.map((card) => (
            <CardComponent 
              key={card.instanceId} 
              card={card} 
              onClick={() => handlePlayCard(card.instanceId)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

