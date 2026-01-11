import type { Card } from '../types/Card';
import { evaluateHand, compareHands } from './handEvaluator';
import type { HandEvaluation } from './handEvaluator';

// Generate all combinations of k elements from array
const combinations = <T>(arr: T[], k: number): T[][] => {
  if (k === 0) return [[]];
  if (k > arr.length) return [];
  if (k === arr.length) return [arr];

  const result: T[][] = [];
  
  for (let i = 0; i <= arr.length - k; i++) {
    const head = arr[i];
    const tailCombos = combinations(arr.slice(i + 1), k - 1);
    for (const combo of tailCombos) {
      result.push([head, ...combo]);
    }
  }
  
  return result;
};

// Check if a card is in a hand
const cardInHand = (card: Card, hand: Card[]): boolean => {
  return hand.some(
    (c) => c.suit === card.suit && c.rank === card.rank
  );
};

export interface AIAction {
  bestHand: Card[];
  cardsToDiscard: Card[];
  submittedHand: Card[];
}

export const getAIAction = (cards: Card[]): AIAction => {
  if (cards.length !== 7) {
    throw new Error('AI must have exactly 7 cards');
  }

  // Generate all possible 5-card combinations
  const allCombinations = combinations(cards, 5);
  
  // Evaluate each combination
  const evaluatedHands = allCombinations.map((combo) => ({
    cards: combo,
    evaluation: evaluateHand(combo),
  }));

  // Find the best hand
  let bestHand = evaluatedHands[0];
  for (const hand of evaluatedHands) {
    if (compareHands(hand.evaluation, bestHand.evaluation) > 0) {
      bestHand = hand;
    }
  }

  // Determine which cards to discard (cards not in the best hand)
  const cardsToDiscard = cards.filter(
    (card) => !cardInHand(card, bestHand.cards)
  );

  // AI can discard at most 2 cards
  const finalDiscard = cardsToDiscard.slice(0, 2);

  return {
    bestHand: bestHand.cards,
    cardsToDiscard: finalDiscard,
    submittedHand: bestHand.cards,
  };
};
