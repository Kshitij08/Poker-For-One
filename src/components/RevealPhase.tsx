import React from 'react';
import type { RoundResult } from '../types/GameState';
import { PlayerHand } from './PlayerHand';
import './RevealPhase.css';

interface RevealPhaseProps {
  roundResult: RoundResult;
  onContinue: () => void;
}

export const RevealPhase: React.FC<RevealPhaseProps> = ({
  roundResult,
  onContinue,
}) => {
  const { playerHand, aiHand, winner } = roundResult;

  const getWinnerText = () => {
    switch (winner) {
      case 'player':
        return 'You Win!';
      case 'ai':
        return 'AI Wins!';
      case 'tie':
        return "It's a Tie!";
    }
  };

  return (
    <div className="reveal-phase">
      <div className="reveal-phase-header">
        <h2>Round Results</h2>
        <div className={`winner-announcement winner-${winner}`}>
          {getWinnerText()}
        </div>
      </div>
      <div className="reveal-phase-hands">
        <div className="reveal-hand-section">
          <h3>Your Hand</h3>
          <div className="hand-type">{playerHand.name}</div>
          <PlayerHand
            cards={playerHand.cards}
            title=""
          />
        </div>
        <div className="reveal-hand-section">
          <h3>AI Hand</h3>
          <div className="hand-type">{aiHand.name}</div>
          <PlayerHand
            cards={aiHand.cards}
            title=""
          />
        </div>
      </div>
      <button className="continue-button" onClick={onContinue}>
        Continue
      </button>
    </div>
  );
};
