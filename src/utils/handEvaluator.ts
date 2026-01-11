import type { Card } from '../types/Card';
import { Rank } from '../types/Card';

export enum HandRank {
  HighCard = 1,
  Pair = 2,
  TwoPair = 3,
  ThreeOfAKind = 4,
  Straight = 5,
  Flush = 6,
  FullHouse = 7,
  FourOfAKind = 8,
  StraightFlush = 9,
  RoyalFlush = 10,
}

export interface HandEvaluation {
  rank: HandRank;
  cards: Card[];
  kickers: number[]; // For tie-breaking
  name: string;
}

const getHandName = (handRank: HandRank): string => {
  switch (handRank) {
    case HandRank.RoyalFlush:
      return 'Royal Flush';
    case HandRank.StraightFlush:
      return 'Straight Flush';
    case HandRank.FourOfAKind:
      return 'Four of a Kind';
    case HandRank.FullHouse:
      return 'Full House';
    case HandRank.Flush:
      return 'Flush';
    case HandRank.Straight:
      return 'Straight';
    case HandRank.ThreeOfAKind:
      return 'Three of a Kind';
    case HandRank.TwoPair:
      return 'Two Pair';
    case HandRank.Pair:
      return 'Pair';
    case HandRank.HighCard:
      return 'High Card';
  }
};

const sortCardsByRank = (cards: Card[]): Card[] => {
  return [...cards].sort((a, b) => b.rank - a.rank);
};

const getRankCounts = (cards: Card[]): Map<Rank, number> => {
  const counts = new Map<Rank, number>();
  for (const card of cards) {
    counts.set(card.rank, (counts.get(card.rank) || 0) + 1);
  }
  return counts;
};

const isFlush = (cards: Card[]): boolean => {
  const suit = cards[0].suit;
  return cards.every((card) => card.suit === suit);
};

const isStraight = (cards: Card[]): boolean => {
  const sortedRanks = cards.map((c) => c.rank).sort((a, b) => a - b);
  
  // Check for A-2-3-4-5 straight (wheel) first
  if (
    sortedRanks[0] === Rank.Two &&
    sortedRanks[1] === Rank.Three &&
    sortedRanks[2] === Rank.Four &&
    sortedRanks[3] === Rank.Five &&
    sortedRanks[4] === Rank.Ace
  ) {
    return true;
  }
  
  // Check for regular straight
  for (let i = 1; i < sortedRanks.length; i++) {
    if (sortedRanks[i] !== sortedRanks[i - 1] + 1) {
      return false;
    }
  }
  return true;
};

const isRoyalFlush = (cards: Card[]): boolean => {
  if (!isFlush(cards)) return false;
  const ranks = cards.map((c) => c.rank).sort((a, b) => a - b);
  return (
    ranks[0] === Rank.Ten &&
    ranks[1] === Rank.Jack &&
    ranks[2] === Rank.Queen &&
    ranks[3] === Rank.King &&
    ranks[4] === Rank.Ace
  );
};

export const evaluateHand = (cards: Card[]): HandEvaluation => {
  if (cards.length !== 5) {
    throw new Error('Hand must contain exactly 5 cards');
  }

  const sortedCards = sortCardsByRank(cards);
  const rankCounts = getRankCounts(cards);
  const counts = Array.from(rankCounts.values()).sort((a, b) => b - a);
  const ranks = Array.from(rankCounts.keys()).sort((a, b) => b - a);

  // Royal Flush
  if (isRoyalFlush(cards)) {
    return {
      rank: HandRank.RoyalFlush,
      cards: sortedCards,
      kickers: [],
      name: getHandName(HandRank.RoyalFlush),
    };
  }

  // Straight Flush
  if (isFlush(cards) && isStraight(cards)) {
    // Handle A-2-3-4-5 straight (wheel) - Ace is low
    const sortedRanks = cards.map((c) => c.rank).sort((a, b) => a - b);
    const highCard = sortedRanks[4] === Rank.Ace && sortedRanks[0] === Rank.Two 
      ? Rank.Five 
      : sortedRanks[4];
    return {
      rank: HandRank.StraightFlush,
      cards: sortedCards,
      kickers: [highCard],
      name: getHandName(HandRank.StraightFlush),
    };
  }

  // Four of a Kind
  if (counts[0] === 4) {
    const fourKind = ranks.find((r) => rankCounts.get(r) === 4)!;
    const kicker = ranks.find((r) => rankCounts.get(r) === 1)!;
    return {
      rank: HandRank.FourOfAKind,
      cards: sortedCards,
      kickers: [fourKind, kicker],
      name: getHandName(HandRank.FourOfAKind),
    };
  }

  // Full House
  if (counts[0] === 3 && counts[1] === 2) {
    const threeKind = ranks.find((r) => rankCounts.get(r) === 3)!;
    const pair = ranks.find((r) => rankCounts.get(r) === 2)!;
    return {
      rank: HandRank.FullHouse,
      cards: sortedCards,
      kickers: [threeKind, pair],
      name: getHandName(HandRank.FullHouse),
    };
  }

  // Flush
  if (isFlush(cards)) {
    return {
      rank: HandRank.Flush,
      cards: sortedCards,
      kickers: sortedCards.map((c) => c.rank),
      name: getHandName(HandRank.Flush),
    };
  }

  // Straight
  if (isStraight(cards)) {
    const sortedRanks = cards.map((c) => c.rank).sort((a, b) => a - b);
    // Handle A-2-3-4-5 straight (wheel) - Ace is low
    const highCard = sortedRanks[4] === Rank.Ace && sortedRanks[0] === Rank.Two 
      ? Rank.Five 
      : sortedRanks[4];
    return {
      rank: HandRank.Straight,
      cards: sortedCards,
      kickers: [highCard],
      name: getHandName(HandRank.Straight),
    };
  }

  // Three of a Kind
  if (counts[0] === 3) {
    const threeKind = ranks.find((r) => rankCounts.get(r) === 3)!;
    const kickers = ranks.filter((r) => rankCounts.get(r) === 1).sort((a, b) => b - a);
    return {
      rank: HandRank.ThreeOfAKind,
      cards: sortedCards,
      kickers: [threeKind, ...kickers],
      name: getHandName(HandRank.ThreeOfAKind),
    };
  }

  // Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    const pairs = ranks.filter((r) => rankCounts.get(r) === 2).sort((a, b) => b - a);
    const kicker = ranks.find((r) => rankCounts.get(r) === 1)!;
    return {
      rank: HandRank.TwoPair,
      cards: sortedCards,
      kickers: [...pairs, kicker],
      name: getHandName(HandRank.TwoPair),
    };
  }

  // Pair
  if (counts[0] === 2) {
    const pair = ranks.find((r) => rankCounts.get(r) === 2)!;
    const kickers = ranks.filter((r) => rankCounts.get(r) === 1).sort((a, b) => b - a);
    return {
      rank: HandRank.Pair,
      cards: sortedCards,
      kickers: [pair, ...kickers],
      name: getHandName(HandRank.Pair),
    };
  }

  // High Card
  return {
    rank: HandRank.HighCard,
    cards: sortedCards,
    kickers: sortedCards.map((c) => c.rank),
    name: getHandName(HandRank.HighCard),
  };
};

export const compareHands = (
  hand1: HandEvaluation,
  hand2: HandEvaluation
): number => {
  // Compare by hand rank
  if (hand1.rank !== hand2.rank) {
    return hand1.rank - hand2.rank;
  }

  // Same rank, compare kickers
  for (let i = 0; i < Math.max(hand1.kickers.length, hand2.kickers.length); i++) {
    const kicker1 = hand1.kickers[i] || 0;
    const kicker2 = hand2.kickers[i] || 0;
    if (kicker1 !== kicker2) {
      return kicker1 - kicker2;
    }
  }

  return 0; // Tie
};
