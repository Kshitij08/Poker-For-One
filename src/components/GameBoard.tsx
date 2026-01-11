import React, { useEffect } from 'react';
import { GamePhase } from '../types/GameState';
import { useGame } from '../hooks/useGame';
import { DiscardPhase } from './DiscardPhase';
import { SubmitPhase } from './SubmitPhase';
import { RevealPhase } from './RevealPhase';
import { GameEnd } from './GameEnd';
import { PlayerHand } from './PlayerHand';
import './GameBoard.css';

export const GameBoard: React.FC = () => {
  const {
    gameState,
    startNewRound,
    selectCardForDiscard,
    confirmDiscard,
    playHand,
    selectCardForSubmit,
    confirmSubmit,
    continueAfterReveal,
    resetGame,
  } = useGame();

  useEffect(() => {
    if (gameState.phase === GamePhase.DEALING) {
      startNewRound();
    }
  }, [gameState.phase, startNewRound]);

  const renderPhase = () => {
    switch (gameState.phase) {
      case GamePhase.DEALING:
        return (
          <div className="dealing-phase">
            <h2>Dealing cards...</h2>
          </div>
        );

      case GamePhase.DISCARDING:
        return (
          <DiscardPhase
            playerHand={gameState.playerHand}
            selectedDiscards={gameState.playerSelectedDiscards}
            onCardClick={selectCardForDiscard}
            onConfirm={confirmDiscard}
            onPlayHand={playHand}
          />
        );

      case GamePhase.SUBMITTING:
        return (
          <SubmitPhase
            playerHand={gameState.playerHand}
            selectedSubmit={gameState.playerSelectedSubmit}
            onCardClick={selectCardForSubmit}
            onConfirm={confirmSubmit}
          />
        );

      case GamePhase.REVEALING:
        const lastResult = gameState.roundResults[gameState.roundResults.length - 1];
        if (!lastResult) {
          return <div>Error: No round result found</div>;
        }
        return (
          <RevealPhase
            roundResult={lastResult}
            onContinue={continueAfterReveal}
          />
        );

      case GamePhase.ROUND_END:
        return (
          <div className="round-end">
            <h2>Round {gameState.currentRound} Complete</h2>
            <button onClick={continueAfterReveal}>Next Round</button>
          </div>
        );

      case GamePhase.GAME_END:
        return (
          <GameEnd
            playerWins={gameState.playerWins}
            aiWins={gameState.aiWins}
            roundResults={gameState.roundResults}
            onReset={resetGame}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="game-board">
      <div className="game-header">
        <h1>Poker For One</h1>
        <div className="game-info">
          <div className="round-info">
            Round: {gameState.currentRound} / 3
          </div>
          <div className="score-info">
            <span>You: {gameState.playerWins}</span>
            <span>AI: {gameState.aiWins}</span>
          </div>
        </div>
      </div>
      <div className="game-content">
        {renderPhase()}
      </div>
      {gameState.phase !== GamePhase.GAME_END && gameState.phase !== GamePhase.DEALING && (
        <div className="ai-hand-display">
          <PlayerHand
            cards={gameState.aiHand}
            faceDown={gameState.phase !== GamePhase.REVEALING}
            title="AI Hand"
          />
        </div>
      )}
    </div>
  );
};
