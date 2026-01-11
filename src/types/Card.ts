export enum Suit {
  Hearts = 'hearts',
  Diamonds = 'diamonds',
  Clubs = 'clubs',
  Spades = 'spades',
}

export enum Rank {
  Two = 2,
  Three = 3,
  Four = 4,
  Five = 5,
  Six = 6,
  Seven = 7,
  Eight = 8,
  Nine = 9,
  Ten = 10,
  Jack = 11,
  Queen = 12,
  King = 13,
  Ace = 14,
}

export interface Card {
  suit: Suit;
  rank: Rank;
}

export const getRankDisplay = (rank: Rank): string => {
  switch (rank) {
    case Rank.Jack:
      return 'J';
    case Rank.Queen:
      return 'Q';
    case Rank.King:
      return 'K';
    case Rank.Ace:
      return 'A';
    default:
      return rank.toString();
  }
};

export const getSuitSymbol = (suit: Suit): string => {
  switch (suit) {
    case Suit.Hearts:
      return '♥';
    case Suit.Diamonds:
      return '♦';
    case Suit.Clubs:
      return '♣';
    case Suit.Spades:
      return '♠';
  }
};

export const getSuitColor = (suit: Suit): string => {
  return suit === Suit.Hearts || suit === Suit.Diamonds ? 'red' : 'black';
};
