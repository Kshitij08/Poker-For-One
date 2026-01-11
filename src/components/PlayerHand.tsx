import React from 'react';
import type { Card as CardType } from '../types/Card';
import { Card } from './Card';
import './PlayerHand.css';

interface PlayerHandProps {
  cards: CardType[];
  selectedCards?: CardType[];
  onCardClick?: (card: CardType) => void;
  isClickable?: boolean;
  faceDown?: boolean;
  title?: string;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  selectedCards = [],
  onCardClick,
  isClickable = false,
  faceDown = false,
  title,
}) => {
  const isCardSelected = (card: CardType): boolean => {
    return selectedCards.some(
      (c) => c.suit === card.suit && c.rank === card.rank
    );
  };

  return (
    <div className="player-hand">
      {title && <h3 className="player-hand-title">{title}</h3>}
      <div className="player-hand-cards">
        {cards.map((card, index) => (
          <Card
            key={`${card.suit}-${card.rank}-${index}`}
            card={card}
            isSelected={isCardSelected(card)}
            isClickable={isClickable}
            onClick={() => onCardClick?.(card)}
            faceDown={faceDown}
          />
        ))}
      </div>
    </div>
  );
};
