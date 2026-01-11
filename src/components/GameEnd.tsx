import React from 'react';
import type { RoundResult } from '../types/GameState';
import './GameEnd.css';

interface GameEndProps {
  playerWins: number;
  aiWins: number;
  roundResults: RoundResult[];
  onReset: () => void;
}

export const GameEnd: React.FC<GameEndProps> = ({
  playerWins,
  aiWins,
  roundResults,
  onReset,
}) => {
  const overallWinner = playerWins > aiWins ? 'player' : aiWins > playerWins ? 'ai' : 'tie';

  const getWinnerText = () => {
    switch (overallWinner) {
      case 'player':
        return 'Congratulations! You Won!';
      case 'ai':
        return 'AI Wins the Game!';
      case 'tie':
        return "It's a Tie!";
    }
  };

  return (
    <div className="game-end">
      <div className="game-end-header">
        <h1>Game Over</h1>
        <div className={`final-winner winner-${overallWinner}`}>
          {getWinnerText()}
        </div>
      </div>
      <div className="game-end-score">
        <div className="score-section">
          <h2>Final Score</h2>
          <div className="score-display">
            <div className="score-item">
              <span className="score-label">You:</span>
              <span className="score-value">{playerWins}</span>
            </div>
            <div className="score-item">
              <span className="score-label">AI:</span>
              <span className="score-value">{aiWins}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="round-results-summary">
        <h3>Round Results</h3>
        {roundResults.map((result, index) => (
          <div key={index} className="round-result-item">
            <span className="round-number">Round {index + 1}:</span>
            <span className={`round-winner winner-${result.winner}`}>
              {result.winner === 'player' ? 'You' : result.winner === 'ai' ? 'AI' : 'Tie'}
            </span>
            <span className="round-details">
              ({result.playerHand.name} vs {result.aiHand.name})
            </span>
          </div>
        ))}
      </div>
      <button className="reset-button" onClick={onReset}>
        Play Again
      </button>
    </div>
  );
};
