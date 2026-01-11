import type { Card } from './Card';
import type { HandEvaluation } from '../utils/handEvaluator';

export enum GamePhase {
  DEALING = 'DEALING',
  DISCARDING = 'DISCARDING',
  SUBMITTING = 'SUBMITTING',
  REVEALING = 'REVEALING',
  ROUND_END = 'ROUND_END',
  GAME_END = 'GAME_END',
}

export interface RoundResult {
  playerHand: HandEvaluation;
  aiHand: HandEvaluation;
  winner: 'player' | 'ai' | 'tie';
}

export interface GameState {
  phase: GamePhase;
  currentRound: number;
  playerWins: number;
  aiWins: number;
  playerHand: Card[];
  aiHand: Card[];
  playerSelectedDiscards: Card[];
  playerSelectedSubmit: Card[];
  aiSubmittedHand: Card[] | null;
  roundResults: RoundResult[];
}
