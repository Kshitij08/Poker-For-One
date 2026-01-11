import React from 'react';
import type { Card as CardType } from '../types/Card';
import { PlayerHand } from './PlayerHand';
import './SubmitPhase.css';

interface SubmitPhaseProps {
  playerHand: CardType[];
  selectedSubmit: CardType[];
  onCardClick: (card: CardType) => void;
  onConfirm: () => void;
}

export const SubmitPhase: React.FC<SubmitPhaseProps> = ({
  playerHand,
  selectedSubmit,
  onCardClick,
  onConfirm,
}) => {
  const canConfirm = selectedSubmit.length === 5;

  return (
    <div className="submit-phase">
      <div className="submit-phase-instructions">
        <h2>Submit Phase</h2>
        <p>Select exactly 5 cards to submit for this round.</p>
        <p className="submit-count">
          Selected: {selectedSubmit.length} / 5
        </p>
      </div>
      <PlayerHand
        cards={playerHand}
        selectedCards={selectedSubmit}
        onCardClick={onCardClick}
        isClickable={true}
        title="Your Hand"
      />
      <button
        className="confirm-button"
        onClick={onConfirm}
        disabled={!canConfirm}
      >
        Submit Hand
      </button>
    </div>
  );
};
