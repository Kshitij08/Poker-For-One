import { useState, useCallback } from 'react';
import type { Card } from '../types/Card';
import { GamePhase } from '../types/GameState';
import type { GameState, RoundResult } from '../types/GameState';
import { Deck } from '../utils/deck';
import { evaluateHand, compareHands } from '../utils/handEvaluator';
import { getAIAction } from '../utils/aiStrategy';

const TOTAL_ROUNDS = 3;
const CARDS_PER_PLAYER = 7;
const MAX_DISCARDS = 2;
const SUBMIT_CARD_COUNT = 5;

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    phase: GamePhase.DEALING,
    currentRound: 1,
    playerWins: 0,
    aiWins: 0,
    playerHand: [],
    aiHand: [],
    playerSelectedDiscards: [],
    playerSelectedSubmit: [],
    aiSubmittedHand: null,
    roundResults: [],
  });

  const [deck, setDeck] = useState<Deck | null>(null);

  const startNewRound = useCallback(() => {
    const newDeck = new Deck();
    const playerCards = newDeck.deal(CARDS_PER_PLAYER);
    const aiCards = newDeck.deal(CARDS_PER_PLAYER);

    setDeck(newDeck);
    setGameState((prev) => ({
      ...prev,
      phase: GamePhase.DISCARDING,
      playerHand: playerCards,
      aiHand: aiCards,
      playerSelectedDiscards: [],
      playerSelectedSubmit: [],
      aiSubmittedHand: null,
    }));
  }, []);

  const selectCardForDiscard = useCallback((card: Card) => {
    setGameState((prev) => {
      if (prev.phase !== GamePhase.DISCARDING) return prev;
      
      const isSelected = prev.playerSelectedDiscards.some(
        (c) => c.suit === card.suit && c.rank === card.rank
      );

      if (isSelected) {
        // Deselect
        return {
          ...prev,
          playerSelectedDiscards: prev.playerSelectedDiscards.filter(
            (c) => !(c.suit === card.suit && c.rank === card.rank)
          ),
        };
      } else {
        // Select (max 2)
        if (prev.playerSelectedDiscards.length >= MAX_DISCARDS) {
          return prev;
        }
        return {
          ...prev,
          playerSelectedDiscards: [...prev.playerSelectedDiscards, card],
        };
      }
    });
  }, []);

  const confirmDiscard = useCallback(() => {
    setGameState((prev) => {
      if (prev.phase !== GamePhase.DISCARDING || !deck) return prev;

      // Discard player cards and draw replacements
      const newPlayerHand = [...prev.playerHand];
      const cardsToDiscard = prev.playerSelectedDiscards;
      
      for (const card of cardsToDiscard) {
        const index = newPlayerHand.findIndex(
          (c) => c.suit === card.suit && c.rank === card.rank
        );
        if (index !== -1) {
          newPlayerHand.splice(index, 1);
          const newCard = deck.draw();
          if (newCard) {
            newPlayerHand.push(newCard);
          }
        }
      }

      // AI discards
      const aiAction = getAIAction(prev.aiHand);
      const newAiHand = [...prev.aiHand];
      
      for (const card of aiAction.cardsToDiscard) {
        const index = newAiHand.findIndex(
          (c) => c.suit === card.suit && c.rank === card.rank
        );
        if (index !== -1) {
          newAiHand.splice(index, 1);
          const newCard = deck.draw();
          if (newCard) {
            newAiHand.push(newCard);
          }
        }
      }

      // Store AI's intended submission
      const finalAiAction = getAIAction(newAiHand);

      return {
        ...prev,
        phase: GamePhase.SUBMITTING,
        playerHand: newPlayerHand,
        aiHand: newAiHand,
        playerSelectedDiscards: [],
        aiSubmittedHand: finalAiAction.submittedHand,
      };
    });
  }, [deck]);

  const playHand = useCallback(() => {
    setGameState((prev) => {
      if (prev.phase !== GamePhase.DISCARDING || !deck) return prev;

      // Player doesn't discard, keep original hand
      const newPlayerHand = [...prev.playerHand];

      // AI still discards
      const aiAction = getAIAction(prev.aiHand);
      const newAiHand = [...prev.aiHand];
      
      for (const card of aiAction.cardsToDiscard) {
        const index = newAiHand.findIndex(
          (c) => c.suit === card.suit && c.rank === card.rank
        );
        if (index !== -1) {
          newAiHand.splice(index, 1);
          const newCard = deck.draw();
          if (newCard) {
            newAiHand.push(newCard);
          }
        }
      }

      // Store AI's intended submission
      const finalAiAction = getAIAction(newAiHand);

      return {
        ...prev,
        phase: GamePhase.SUBMITTING,
        playerHand: newPlayerHand,
        aiHand: newAiHand,
        playerSelectedDiscards: [],
        aiSubmittedHand: finalAiAction.submittedHand,
      };
    });
  }, [deck]);

  const selectCardForSubmit = useCallback((card: Card) => {
    setGameState((prev) => {
      if (prev.phase !== GamePhase.SUBMITTING) return prev;

      const isSelected = prev.playerSelectedSubmit.some(
        (c) => c.suit === card.suit && c.rank === card.rank
      );

      if (isSelected) {
        // Deselect
        return {
          ...prev,
          playerSelectedSubmit: prev.playerSelectedSubmit.filter(
            (c) => !(c.suit === card.suit && c.rank === card.rank)
          ),
        };
      } else {
        // Select (exactly 5)
        if (prev.playerSelectedSubmit.length >= SUBMIT_CARD_COUNT) {
          return prev;
        }
        return {
          ...prev,
          playerSelectedSubmit: [...prev.playerSelectedSubmit, card],
        };
      }
    });
  }, []);

  const confirmSubmit = useCallback(() => {
    setGameState((prev) => {
      if (
        prev.phase !== GamePhase.SUBMITTING ||
        prev.playerSelectedSubmit.length !== SUBMIT_CARD_COUNT ||
        !prev.aiSubmittedHand
      ) {
        return prev;
      }

      // Evaluate hands
      const playerEvaluation = evaluateHand(prev.playerSelectedSubmit);
      const aiEvaluation = evaluateHand(prev.aiSubmittedHand);

      // Determine winner
      const comparison = compareHands(playerEvaluation, aiEvaluation);
      let winner: 'player' | 'ai' | 'tie';
      if (comparison > 0) {
        winner = 'player';
      } else if (comparison < 0) {
        winner = 'ai';
      } else {
        winner = 'tie';
      }

      const roundResult: RoundResult = {
        playerHand: playerEvaluation,
        aiHand: aiEvaluation,
        winner,
      };

      const newPlayerWins = winner === 'player' ? prev.playerWins + 1 : prev.playerWins;
      const newAiWins = winner === 'ai' ? prev.aiWins + 1 : prev.aiWins;

      // Always go to revealing phase first
      return {
        ...prev,
        phase: GamePhase.REVEALING,
        roundResults: [...prev.roundResults, roundResult],
        playerWins: newPlayerWins,
        aiWins: newAiWins,
      };
    });
  }, []);

  const continueAfterReveal = useCallback(() => {
    setGameState((prev) => {
      // Check if we've completed all rounds
      if (prev.currentRound >= TOTAL_ROUNDS) {
        return {
          ...prev,
          phase: GamePhase.GAME_END,
        };
      }
      // Start next round
      return {
        ...prev,
        phase: GamePhase.DEALING,
        currentRound: prev.currentRound + 1,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      phase: GamePhase.DEALING,
      currentRound: 1,
      playerWins: 0,
      aiWins: 0,
      playerHand: [],
      aiHand: [],
      playerSelectedDiscards: [],
      playerSelectedSubmit: [],
      aiSubmittedHand: null,
      roundResults: [],
    });
    setDeck(null);
  }, []);

  return {
    gameState,
    startNewRound,
    selectCardForDiscard,
    confirmDiscard,
    playHand,
    selectCardForSubmit,
    confirmSubmit,
    continueAfterReveal,
    resetGame,
  };
};
