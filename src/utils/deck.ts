import type { Card } from '../types/Card';
import { Suit, Rank } from '../types/Card';

export class Deck {
  private cards: Card[];

  constructor() {
    this.cards = this.createDeck();
    this.shuffle();
  }

  private createDeck(): Card[] {
    const cards: Card[] = [];
    const suits = [Suit.Hearts, Suit.Diamonds, Suit.Clubs, Suit.Spades];
    const ranks = [
      Rank.Two,
      Rank.Three,
      Rank.Four,
      Rank.Five,
      Rank.Six,
      Rank.Seven,
      Rank.Eight,
      Rank.Nine,
      Rank.Ten,
      Rank.Jack,
      Rank.Queen,
      Rank.King,
      Rank.Ace,
    ];

    for (const suit of suits) {
      for (const rank of ranks) {
        cards.push({ suit, rank });
      }
    }

    return cards;
  }

  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal(count: number): Card[] {
    if (count > this.cards.length) {
      throw new Error('Not enough cards in deck');
    }
    return this.cards.splice(0, count);
  }

  draw(): Card | null {
    return this.cards.length > 0 ? this.cards.shift() || null : null;
  }

  getRemainingCount(): number {
    return this.cards.length;
  }

  reset(): void {
    this.cards = this.createDeck();
    this.shuffle();
  }
}
