import React from 'react';
import type { Card as CardType } from '../types/Card';
import { PlayerHand } from './PlayerHand';
import './DiscardPhase.css';

interface DiscardPhaseProps {
  playerHand: CardType[];
  selectedDiscards: CardType[];
  onCardClick: (card: CardType) => void;
  onConfirm: () => void;
  onPlayHand: () => void;
}

export const DiscardPhase: React.FC<DiscardPhaseProps> = ({
  playerHand,
  selectedDiscards,
  onCardClick,
  onConfirm,
  onPlayHand,
}) => {
  const canConfirm = selectedDiscards.length >= 0 && selectedDiscards.length <= 2;

  return (
    <div className="discard-phase">
      <div className="discard-phase-instructions">
        <h2>Discard Phase</h2>
        <p>Select up to 2 cards to discard (optional). Selected cards will be replaced with new ones.</p>
        <p className="discard-count">
          Selected: {selectedDiscards.length} / 2
        </p>
      </div>
      <PlayerHand
        cards={playerHand}
        selectedCards={selectedDiscards}
        onCardClick={onCardClick}
        isClickable={true}
        title="Your Hand"
      />
      <div className="discard-phase-buttons">
        {selectedDiscards.length > 0 && (
          <button
            className="confirm-button"
            onClick={onConfirm}
            disabled={!canConfirm}
          >
            Discard & Continue
          </button>
        )}
        <button
          className="play-hand-button"
          onClick={onPlayHand}
        >
          Play Hand
        </button>
      </div>
    </div>
  );
};
