import React from 'react';
import type { Card as CardType } from '../types/Card';
import { getRankDisplay, getSuitSymbol, getSuitColor } from '../types/Card';
import './Card.css';

interface CardProps {
  card: CardType;
  isSelected?: boolean;
  isClickable?: boolean;
  onClick?: () => void;
  faceDown?: boolean;
}

export const Card: React.FC<CardProps> = ({
  card,
  isSelected = false,
  isClickable = false,
  onClick,
  faceDown = false,
}) => {
  if (faceDown) {
    return (
      <div className="card card-face-down" onClick={isClickable ? onClick : undefined}>
        <div className="card-back">🂠</div>
      </div>
    );
  }

  const suitColor = getSuitColor(card.suit);
  const suitSymbol = getSuitSymbol(card.suit);
  const rankDisplay = getRankDisplay(card.rank);

  return (
    <div
      className={`card ${isSelected ? 'card-selected' : ''} ${isClickable ? 'card-clickable' : ''}`}
      onClick={isClickable ? onClick : undefined}
      style={{ color: suitColor }}
    >
      <div className="card-rank-top">{rankDisplay}</div>
      <div className="card-suit">{suitSymbol}</div>
      <div className="card-rank-bottom">{rankDisplay}</div>
    </div>
  );
};
