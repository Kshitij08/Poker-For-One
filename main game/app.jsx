import React, { useState, useEffect, useMemo } from 'react';
import { Heart, Diamond, Club, Spade, Trophy, RotateCcw, Play, Check, X, Sparkles, Gamepad2 } from 'lucide-react';

// --- CONSTANTS & TYPES ---

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUES = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

const HAND_RANKS = {
  ROYAL_FLUSH: 9,
  STRAIGHT_FLUSH: 8,
  FOUR_OF_A_KIND: 7,
  FULL_HOUSE: 6,
  FLUSH: 5,
  STRAIGHT: 4,
  THREE_OF_A_KIND: 3,
  TWO_PAIR: 2,
  ONE_PAIR: 1,
  HIGH_CARD: 0
};

// --- POKER LOGIC ENGINE ---

const createDeck = () => {
  let deck = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      deck.push({ suit, rank, value: RANK_VALUES[rank], id: `${rank}-${suit}` });
    });
  });
  return deck;
};

const shuffleDeck = (deck) => {
  let newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

// Returns { score, rankName, rankValue }
const evaluateHand = (hand) => {
  if (hand.length !== 5) return { score: 0, rankName: 'Invalid', rankValue: -1 };

  const cards = [...hand].sort((a, b) => a.value - b.value);
  const values = cards.map(c => c.value);
  const suits = cards.map(c => c.suit);
  
  const isFlush = suits.every(s => s === suits[0]);
  
  // Check Straight
  let isStraight = true;
  for (let i = 0; i < 4; i++) {
    if (values[i+1] !== values[i] + 1) {
      isStraight = false; 
      break;
    }
  }
  // Ace low straight check (A, 2, 3, 4, 5) -> values are 2,3,4,5,14
  if (!isStraight && values[4] === 14 && values[0] === 2 && values[1] === 3 && values[2] === 4 && values[3] === 5) {
    isStraight = true;
  }

  const counts = {};
  values.forEach(v => counts[v] = (counts[v] || 0) + 1);
  const countValues = Object.values(counts);
  
  const isFourOfAKind = countValues.includes(4);
  const isFullHouse = countValues.includes(3) && countValues.includes(2);
  const isThreeOfAKind = countValues.includes(3);
  const isTwoPair = countValues.filter(c => c === 2).length === 2;
  const isPair = countValues.includes(2);

  let rankValue = HAND_RANKS.HIGH_CARD;
  let rankName = "High Card";
  let tieBreaker = 0;

  if (isFlush && isStraight) {
    if (values[4] === 14 && values[0] === 10) {
      rankValue = HAND_RANKS.ROYAL_FLUSH;
      rankName = "Royal Flush";
    } else {
      rankValue = HAND_RANKS.STRAIGHT_FLUSH;
      rankName = "Straight Flush";
    }
  } else if (isFourOfAKind) {
    rankValue = HAND_RANKS.FOUR_OF_A_KIND;
    rankName = "Four of a Kind";
  } else if (isFullHouse) {
    rankValue = HAND_RANKS.FULL_HOUSE;
    rankName = "Full House";
  } else if (isFlush) {
    rankValue = HAND_RANKS.FLUSH;
    rankName = "Flush";
  } else if (isStraight) {
    rankValue = HAND_RANKS.STRAIGHT;
    rankName = "Straight";
  } else if (isThreeOfAKind) {
    rankValue = HAND_RANKS.THREE_OF_A_KIND;
    rankName = "Three of a Kind";
  } else if (isTwoPair) {
    rankValue = HAND_RANKS.TWO_PAIR;
    rankName = "Two Pair";
  } else if (isPair) {
    rankValue = HAND_RANKS.ONE_PAIR;
    rankName = "Pair";
  }

  const sumValues = values.reduce((a, b) => a + b, 0);
  
  if (rankValue === HAND_RANKS.FOUR_OF_A_KIND) {
     const quadVal = parseInt(Object.keys(counts).find(k => counts[k] === 4));
     tieBreaker = quadVal * 100; 
  } else if (rankValue === HAND_RANKS.FULL_HOUSE) {
     const tripVal = parseInt(Object.keys(counts).find(k => counts[k] === 3));
     tieBreaker = tripVal * 100;
  } else {
     const sorted = [...values].sort((a,b) => b-a);
     tieBreaker = sorted.reduce((acc, val, idx) => acc + (val * Math.pow(15, 4-idx)), 0);
  }

  return {
    score: (rankValue * 10000000) + tieBreaker,
    rankName,
    rankValue
  };
};

function getCombinations(chars, k) {
  let result = [];
  function backtrack(start, combo) {
    if (combo.length === k) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < chars.length; i++) {
      combo.push(chars[i]);
      backtrack(i + 1, combo);
      combo.pop();
    }
  }
  backtrack(0, []);
  return result;
}

const getBestHand = (sevenCards) => {
  const combos = getCombinations(sevenCards, 5);
  let bestScore = -1;
  let bestHand = [];
  let bestDetails = {};

  combos.forEach(combo => {
    const details = evaluateHand(combo);
    if (details.score > bestScore) {
      bestScore = details.score;
      bestHand = combo;
      bestDetails = details;
    }
  });

  return { hand: bestHand, details: bestDetails };
};

// AI discard strategy: Find best 5-card hand, discard cards not in it (up to 2)
const getAiDiscardIndices = (aiHand) => {
  const { hand: bestHand } = getBestHand(aiHand);
  const bestHandIds = new Set(bestHand.map(c => c.id));
  
  // Find cards not in the best hand
  const discardIndices = [];
  for (let i = 0; i < aiHand.length && discardIndices.length < 2; i++) {
    if (!bestHandIds.has(aiHand[i].id)) {
      discardIndices.push(i);
    }
  }
  
  return discardIndices;
};

// --- COMPONENTS ---

const Card = ({ card, isSelected, onClick, hidden = false, isSmall = false, index = 0 }) => {
  // --- RESPONSIVE CARD SIZING ---
  // Mobile: Smaller, compact
  // Desktop (md:): Larger, clearer
  const cardSizeClasses = hidden
    ? isSmall 
        ? 'w-12 h-20 md:w-16 md:h-24' // Small Hidden (AI)
        : 'w-16 h-24 md:w-24 md:h-36' // Regular Hidden
    : isSmall 
        ? 'w-12 h-20 md:w-16 md:h-24' // Small Revealed (AI)
        : 'w-16 h-24 md:w-24 md:h-36'; // Player Card

  if (hidden) {
    return (
      <div 
        className={`
          relative rounded-xl border-2 border-blue-500/30 bg-blue-900 
          shadow-lg flex items-center justify-center 
          transition-all duration-300 transform
          ${cardSizeClasses}
        `}
      >
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-950/50 flex items-center justify-center">
           <Trophy size={16} className="text-cyan-400/70" />
        </div>
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400/20"></div>
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-cyan-400/20"></div>
      </div>
    );
  }

  // 4-Color Deck Logic
  const getSuitStyle = (suit) => {
    switch(suit) {
      case 'hearts': return 'text-rose-600';     
      case 'diamonds': return 'text-blue-600';   
      case 'clubs': return 'text-emerald-600';   
      case 'spades': return 'text-slate-900';    
      default: return 'text-slate-900';
    }
  };

  const suitColorClass = getSuitStyle(card.suit);
  
  const CornerSuit = () => {
    const sizeClass = isSmall ? "w-3 h-3 md:w-4 md:h-4" : "w-3 h-3 md:w-5 md:h-5";
    switch(card.suit) {
      case 'hearts': return <Heart fill="currentColor" className={sizeClass} />;
      case 'diamonds': return <Diamond fill="currentColor" className={sizeClass} />;
      case 'clubs': return <Club fill="currentColor" className={sizeClass} />;
      case 'spades': return <Spade fill="currentColor" className={sizeClass} />;
      default: return null;
    }
  };

  const CenterSuit = () => {
    const sizeClass = isSmall ? "w-8 h-8 md:w-10 md:h-10" : "w-10 h-10 md:w-16 md:h-16";
    switch(card.suit) {
      case 'hearts': return <Heart fill="currentColor" className={sizeClass} />;
      case 'diamonds': return <Diamond fill="currentColor" className={sizeClass} />;
      case 'clubs': return <Club fill="currentColor" className={sizeClass} />;
      case 'spades': return <Spade fill="currentColor" className={sizeClass} />;
      default: return null;
    }
  };

  const fontSizeClass = isSmall ? 'text-xs md:text-sm' : 'text-sm md:text-xl';

  return (
    <div 
      onClick={onClick}
      style={{ zIndex: isSelected ? 50 : index }} 
      className={`
        relative bg-slate-50 rounded-xl shadow-[0_4px_0_rgb(0,0,0,0.1)] cursor-pointer 
        transition-transform duration-200 ease-out
        select-none border
        ${cardSizeClasses}
        ${isSelected 
            ? '-translate-y-4 md:-translate-y-6 ring-4 ring-cyan-400/50 ring-offset-2 ring-offset-blue-900 border-cyan-400 shadow-xl' 
            : 'hover:-translate-y-2 border-slate-300 hover:border-cyan-300 active:translate-y-0 active:shadow-none hover:z-40'}
        ${suitColorClass}
      `}
    >
      {/* Top Left Corner */}
      <div className="absolute top-1 left-1 md:top-1.5 md:left-1.5 flex flex-col items-center leading-none">
        <span className={`font-black tracking-tighter ${fontSizeClass}`}>{card.rank}</span>
        <CornerSuit />
      </div>

      {/* Center Watermark/Icon */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <CenterSuit />
      </div>

      {/* Bottom Right Corner (Rotated) */}
      <div className="absolute bottom-1 right-1 md:bottom-1.5 md:right-1.5 flex flex-col items-center leading-none rotate-180">
        <span className={`font-black tracking-tighter ${fontSizeClass}`}>{card.rank}</span>
        <CornerSuit />
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function Poker7Game() {
  const [gameState, setGameState] = useState('START');
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [aiHand, setAiHand] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState({ player: 0, ai: 0 });
  const [handResult, setHandResult] = useState({ winner: null, message: '' });
  const [playedHands, setPlayedHands] = useState({ player: [], ai: [], playerDetails: null, aiDetails: null });
  const [usedCards, setUsedCards] = useState(new Set()); // Track all cards that have been discarded or played

  // Add resize listener for card icon responsiveness
  useEffect(() => {
    const handleResize = () => {}; // Triggers re-render for icon size calc
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startGame = () => {
    setScores({ player: 0, ai: 0 });
    setRound(1);
    setUsedCards(new Set()); // Reset used cards at game start
    startRound();
  };

  const startRound = () => {
    const newDeck = shuffleDeck(createDeck());
    const pHand = newDeck.slice(0, 7);
    const aHand = newDeck.slice(7, 14);
    const remainingDeck = newDeck.slice(14);
    
    // Don't mark dealt cards as used yet - they'll be marked when discarded or played
    setDeck(remainingDeck);
    setPlayerHand(pHand);
    setAiHand(aHand);
    setSelectedIndices([]);
    setHandResult({ winner: null, message: '' });
    setPlayedHands({ player: [], ai: [], playerDetails: null, aiDetails: null });
    setGameState('DISCARD');
  };

  const toggleCardSelection = (index) => {
    if (gameState === 'DISCARD') {
      if (selectedIndices.includes(index)) {
        setSelectedIndices(selectedIndices.filter(i => i !== index));
      } else {
        if (selectedIndices.length < 2) {
          setSelectedIndices([...selectedIndices, index]);
        }
      }
    } else if (gameState === 'PLAY') {
       if (selectedIndices.includes(index)) {
        setSelectedIndices(selectedIndices.filter(i => i !== index));
      } else {
        if (selectedIndices.length < 5) {
          setSelectedIndices([...selectedIndices, index]);
        }
      }
    }
  };

  const confirmDiscard = () => {
    // Filter deck to only include cards that haven't been used (discarded or played)
    let currentDeck = deck.filter(card => !usedCards.has(card.id));
    const newUsedCards = new Set(usedCards);
    
    // Handle player discard
    if (selectedIndices.length > 0) {
      const discarded = selectedIndices.map(i => playerHand[i]);
      
      // Mark discarded cards as used - they can never be drawn again
      discarded.forEach(card => newUsedCards.add(card.id));
      
      const keptCards = playerHand.filter((_, i) => !selectedIndices.includes(i));
      const numToDraw = selectedIndices.length;
      const newCards = currentDeck.slice(0, numToDraw);
      
      // Remove drawn cards from deck
      currentDeck = [...currentDeck.slice(numToDraw)]; // Ensure new array reference
      setPlayerHand([...keptCards, ...newCards]);
    }
    
    // Handle AI discard
    const aiDiscardIndices = getAiDiscardIndices(aiHand);
    if (aiDiscardIndices.length > 0) {
      const discarded = aiDiscardIndices.map(i => aiHand[i]);
      
      // Mark discarded cards as used - they can never be drawn again
      discarded.forEach(card => newUsedCards.add(card.id));
      
      const keptAiCards = aiHand.filter((_, i) => !aiDiscardIndices.includes(i));
      const numAiToDraw = aiDiscardIndices.length;
      const newAiCards = currentDeck.slice(0, numAiToDraw);
      
      // Remove drawn cards from deck
      currentDeck = [...currentDeck.slice(numAiToDraw)]; // Ensure new array reference
      setAiHand([...keptAiCards, ...newAiCards]);
    }
    
    setUsedCards(newUsedCards);
    setDeck([...currentDeck]); // Ensure new array reference for React state update
    setSelectedIndices([]);
    setGameState('PLAY');
  };

  const submitHand = () => {
    if (selectedIndices.length !== 5) return;
    const finalPlayerHand = selectedIndices.map(i => playerHand[i]);
    const playerEval = evaluateHand(finalPlayerHand);
    const { hand: finalAiHand, details: aiEval } = getBestHand(aiHand);

    // Mark played cards as used
    const newUsedCards = new Set(usedCards);
    finalPlayerHand.forEach(card => newUsedCards.add(card.id));
    finalAiHand.forEach(card => newUsedCards.add(card.id));
    setUsedCards(newUsedCards);

    let winner = 'tie';
    if (playerEval.score > aiEval.score) winner = 'player';
    if (aiEval.score > playerEval.score) winner = 'ai';

    setPlayedHands({
        player: finalPlayerHand,
        ai: finalAiHand,
        playerDetails: playerEval,
        aiDetails: aiEval
    });

    let msg = '';
    if (winner === 'player') {
        setScores(s => ({ ...s, player: s.player + 1 }));
        msg = `You Win! ${playerEval.rankName} beats ${aiEval.rankName}`;
    } else if (winner === 'ai') {
        setScores(s => ({ ...s, ai: s.ai + 1 }));
        msg = `AI Wins! ${aiEval.rankName} beats ${playerEval.rankName}`;
    } else {
        msg = `It's a Tie! Both have ${playerEval.rankName}`;
    }

    setHandResult({ winner, message: msg });
    setGameState('SHOWDOWN');
  };

  const nextRound = () => {
    if (round >= 3) {
      setGameState('GAME_OVER');
    } else {
      setRound(r => r + 1);
      
      // Remove the 5 played cards from each hand, keep the remaining 2 cards
      const playedPlayerCardIds = new Set(playedHands.player.map(c => c.id));
      const playedAiCardIds = new Set(playedHands.ai.map(c => c.id));
      
      const remainingPlayerCards = playerHand.filter(card => !playedPlayerCardIds.has(card.id));
      const remainingAiCards = aiHand.filter(card => !playedAiCardIds.has(card.id));
      
      // Calculate how many cards each player needs to get back to 7
      const playerNeeds = 7 - remainingPlayerCards.length;
      const aiNeeds = 7 - remainingAiCards.length;
      
      // Get available deck (excluding used cards)
      let currentDeck = [...deck].filter(card => !usedCards.has(card.id));
      
      // If deck doesn't have enough cards, create a new deck from unused cards
      if (currentDeck.length < (playerNeeds + aiNeeds)) {
        // Create a new deck, excluding all used cards
        const fullDeck = createDeck();
        const availableCards = fullDeck.filter(card => !usedCards.has(card.id));
        const shuffledAvailable = shuffleDeck(availableCards);
        currentDeck = shuffledAvailable;
      }
      
      // Draw cards for player
      const newPlayerCards = currentDeck.slice(0, playerNeeds);
      currentDeck = currentDeck.slice(playerNeeds);
      
      // Draw cards for AI
      const newAiCards = currentDeck.slice(0, aiNeeds);
      currentDeck = currentDeck.slice(aiNeeds);
      
      // Update hands: keep remaining cards + new cards
      const updatedPlayerHand = [...remainingPlayerCards, ...newPlayerCards];
      const updatedAiHand = [...remainingAiCards, ...newAiCards];
      
      setPlayerHand(updatedPlayerHand);
      setAiHand(updatedAiHand);
      
      // Update deck
      setDeck([...currentDeck]);
      
      // Reset round-specific state
      setSelectedIndices([]);
      setHandResult({ winner: null, message: '' });
      setPlayedHands({ player: [], ai: [], playerDetails: null, aiDetails: null });
      setGameState('DISCARD');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-white relative overflow-hidden flex flex-col">
      
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 pointer-events-none" />
      <div className="fixed inset-0 opacity-5 pointer-events-none bg-[size:40px_40px] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]" />
      <div className="fixed inset-0 pointer-events-none opacity-30">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]" />
      </div>

      {/* Header - Responsive Layout */}
      <header className="relative z-10 p-4 flex flex-col md:flex-row justify-between items-center bg-blue-950/60 backdrop-blur-md border-b border-white/5 gap-3 md:gap-0">
        <div className="flex items-center gap-3">
            <div className="bg-cyan-500/80 p-2 rounded-xl shadow-sm">
                <Gamepad2 className="text-white" size={24} />
            </div>
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-wide">
                    Poker for <span className="text-cyan-400">One</span>
                </h1>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Score Board */}
          {gameState !== 'START' && (
               <div className="flex w-full md:w-auto justify-between md:justify-start gap-4 md:gap-8 text-sm font-medium bg-blue-900/40 p-2 px-6 rounded-xl md:rounded-full border border-white/5">
               <div className="flex flex-col items-center">
                   <span className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Round</span>
                   <span className="text-lg md:text-xl text-slate-200 font-bold">{round}/3</span>
               </div>
               <div className="h-8 w-px bg-white/10 self-center"></div>
               <div className="flex flex-col items-center">
                   <span className="text-cyan-400 text-[10px] uppercase tracking-wider mb-0.5">Player</span>
                   <span className="text-lg md:text-xl text-slate-200 font-bold">{scores.player}</span>
               </div>
               <div className="flex flex-col items-center">
                   <span className="text-rose-400 text-[10px] uppercase tracking-wider mb-0.5">Opponent</span>
                   <span className="text-lg md:text-xl text-slate-200 font-bold">{scores.ai}</span>
               </div>
           </div>
          )}
        </div>
      </header>

      <main className="relative z-10 flex-grow flex flex-col items-center justify-between md:justify-center md:gap-8 container mx-auto px-4 py-6 max-w-6xl">
        
        {gameState === 'START' && (
          <div className="flex flex-col items-center justify-center my-auto text-center space-y-8 animate-in fade-in zoom-in duration-500 w-full">
            <div className="p-8 md:p-12 bg-blue-900/30 backdrop-blur-md rounded-3xl border border-white/5 shadow-xl max-w-xl w-full">
                <div className="flex justify-center mb-6">
                    <Sparkles className="text-cyan-400/80 animate-spin-slow" size={48} />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-6">Poker for One</h2>
                <p className="text-slate-300 text-lg md:text-xl mb-10 leading-relaxed">
                    Beat the AI in a best-of-3 match. <br/>
                    Discard junk, keep the gems.
                </p>
                <button 
                    onClick={startGame}
                    className="w-full md:w-auto px-12 py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold text-xl shadow-lg shadow-cyan-900/20 hover:scale-105 transition-all duration-200"
                >
                    <span className="flex items-center justify-center gap-3">
                        Start Game <Play size={24} className="fill-current" />
                    </span>
                </button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-slate-400">
                <div className="bg-blue-900/30 px-4 py-2 rounded-full border border-white/5">
                    1. Discard up to 2
                </div>
                <div className="bg-blue-900/30 px-4 py-2 rounded-full border border-white/5">
                    2. Pick Best 5
                </div>
                <div className="bg-blue-900/30 px-4 py-2 rounded-full border border-white/5">
                    3. Win Rounds
                </div>
            </div>
          </div>
        )}

        {gameState === 'GAME_OVER' && (
           <div className="flex flex-col items-center justify-center my-auto text-center animate-in zoom-in duration-500 w-full">
              <div className="relative p-10 md:p-16 bg-slate-800 rounded-[2rem] border border-slate-700 shadow-2xl overflow-hidden max-w-lg w-full">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
                
                {scores.player > scores.ai ? (
                     <>
                        <div className="flex justify-center mb-6">
                            <Trophy size={80} className="text-cyan-400 drop-shadow-sm" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-2">Victory!</h2>
                        <p className="text-slate-400 mb-8 text-lg">You mastered the table.</p>
                     </>
                ) : scores.player < scores.ai ? (
                    <>
                        <div className="text-7xl mb-6 opacity-80">🫠</div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-2">Defeat</h2>
                        <p className="text-slate-400 mb-8 text-lg">The house always wins.</p>
                    </>
                ) : (
                    <>
                        <div className="text-7xl mb-6 opacity-80">🤝</div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-2">Draw</h2>
                        <p className="text-slate-400 mb-8 text-lg">Well played.</p>
                    </>
                )}

                <div className="text-4xl font-bold text-slate-200 mb-10 bg-black/20 inline-block px-10 py-4 rounded-xl border border-white/5">
                    {scores.player} - {scores.ai}
                </div>

                <button 
                    onClick={startGame}
                    className="w-full px-8 py-4 bg-slate-200 hover:bg-white text-slate-900 font-bold text-lg rounded-xl shadow-sm transition-all flex justify-center items-center gap-2"
                >
                    <RotateCcw size={20} /> Play Again
                </button>
              </div>
           </div>
        )}

        {(gameState === 'DISCARD' || gameState === 'PLAY' || gameState === 'SHOWDOWN') && (
            <div className="w-full flex flex-col justify-center items-center gap-8 md:gap-12 flex-grow">
                
                {/* AI Area */}
                <div className="flex flex-col items-center">
                    <div className="flex gap-3 mb-2 items-center">
                        <span className="text-[10px] md:text-xs font-bold tracking-widest text-slate-400 uppercase bg-blue-900/30 border border-blue-800/30 px-3 py-1 rounded-full">Opponent</span>
                        {gameState === 'SHOWDOWN' && (
                             <span className="text-[10px] md:text-xs font-bold text-slate-100 bg-rose-500/80 px-3 py-1 rounded-full animate-in zoom-in">
                                {playedHands.aiDetails?.rankName}
                             </span>
                        )}
                    </div>
                    
                    {/* Opponent Cards - Overlap on mobile, spaced on desktop */}
                    <div className="flex justify-center -space-x-3 md:space-x-2 transition-all">
                        {gameState === 'SHOWDOWN' ? (
                            playedHands.ai.map((card, i) => (
                                <Card key={i} card={card} isSmall index={i} />
                            ))
                        ) : (
                            Array(7).fill(0).map((_, i) => (
                                <Card key={i} hidden isSmall index={i} />
                            ))
                        )}
                    </div>
                </div>

                {/* Table Center / Actions */}
                <div className="flex items-center justify-center z-20 my-4">
                    {gameState === 'DISCARD' && (
                        <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 w-full px-4">
                            <p className="text-slate-300 mb-4 text-sm md:text-base font-medium bg-blue-900/50 border border-white/5 px-6 py-2 rounded-full text-center">
                                Select up to 2 cards to swap
                            </p>
                            <div className="flex gap-4 w-full md:w-auto">
                                <button 
                                    onClick={confirmDiscard}
                                    className="w-full md:w-auto px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 active:scale-95 md:active:scale-100 md:hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
                                >
                                    {selectedIndices.length === 0 ? 'Keep All' : `Swap ${selectedIndices.length}`}
                                </button>
                            </div>
                        </div>
                    )}

                    {gameState === 'PLAY' && (
                        <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 w-full px-4">
                            <p className="text-slate-300 mb-4 text-sm md:text-base font-medium bg-blue-900/50 border border-white/5 px-6 py-2 rounded-full text-center">
                                Pick your best 5 cards
                            </p>
                            <button 
                                onClick={submitHand}
                                disabled={selectedIndices.length !== 5}
                                className={`
                                    w-full md:w-auto px-12 py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex justify-center items-center gap-2
                                    ${selectedIndices.length === 5 
                                        ? 'bg-cyan-500 hover:bg-cyan-400 text-white active:scale-95 md:active:scale-100 md:hover:-translate-y-0.5 cursor-pointer shadow-cyan-900/20' 
                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed border border-white/5'}
                                `}
                            >
                                Play Hand <Play size={20} className="fill-current" />
                            </button>
                        </div>
                    )}

                    {gameState === 'SHOWDOWN' && (
                        <div className="flex flex-col items-center animate-in zoom-in duration-300 w-full px-4">
                             <div className={`
                                w-full md:w-auto px-10 py-6 rounded-2xl border mb-6 backdrop-blur-md shadow-xl transform
                                flex flex-col items-center
                                ${handResult.winner === 'player' ? 'bg-emerald-500/20 border-emerald-500/30' : 
                                  handResult.winner === 'ai' ? 'bg-rose-500/20 border-rose-500/30' : 
                                  'bg-slate-600/20 border-slate-500/30'}
                             `}>
                                <span className={`text-2xl md:text-3xl font-bold italic text-center ${
                                    handResult.winner === 'player' ? 'text-emerald-400' : 
                                    handResult.winner === 'ai' ? 'text-rose-400' : 'text-slate-300'
                                }`}>
                                    {handResult.winner === 'player' ? 'Round Won' : 
                                     handResult.winner === 'ai' ? 'Round Lost' : 'Draw'}
                                </span>
                                <span className="text-sm md:text-base text-slate-300 mt-2 text-center">
                                    {handResult.message}
                                </span>
                             </div>

                             <button 
                                onClick={nextRound}
                                className="w-full md:w-auto px-8 py-3 bg-slate-200 text-slate-900 font-bold rounded-xl hover:bg-white transition-all shadow-lg active:scale-95 md:active:scale-100"
                             >
                                {round === 3 ? 'Finish Game' : 'Next Round'}
                             </button>
                        </div>
                    )}
                </div>

                {/* Player Area */}
                <div className="flex flex-col items-center">
                    <div className="flex gap-2 mb-6 md:mb-8 w-full max-w-2xl px-4 justify-between items-end">
                         <span className="text-[10px] md:text-xs font-bold tracking-widest text-slate-400 uppercase bg-blue-900/30 border border-blue-800/30 px-3 py-1 rounded-full">You</span>
                         
                         {gameState === 'SHOWDOWN' && (
                            <span className="text-[10px] md:text-xs font-bold text-white bg-emerald-500/80 px-3 py-1 rounded-full shadow-lg animate-in zoom-in">
                                {playedHands.playerDetails?.rankName}
                            </span>
                         )}
                         {gameState === 'DISCARD' && (
                            <span className="text-[10px] md:text-xs font-bold text-slate-300 bg-blue-900/50 px-3 py-1 rounded-full border border-white/5">
                                {selectedIndices.length}/2
                            </span>
                         )}
                         {gameState === 'PLAY' && (
                            <span className={`text-[10px] md:text-xs font-bold px-3 py-1 rounded-full transition-colors border ${selectedIndices.length === 5 ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-blue-900/50 text-slate-400 border-white/5'}`}>
                                {selectedIndices.length}/5
                            </span>
                         )}
                    </div>

                    {/* Player Hand Container - Responsive Spacing */}
                    {/* Mobile: -space-x-3 (overlap) | Desktop: gap-4 (spaced out) */}
                    <div className="flex justify-center -space-x-3 md:space-x-0 md:gap-4 px-2 pb-4">
                        {gameState === 'SHOWDOWN' ? (
                            playedHands.player.map((card, i) => (
                                <Card 
                                    key={`played-${i}`} 
                                    card={card} 
                                    isSelected={false} // No interaction needed
                                    index={i}
                                />
                            ))
                        ) : (
                            playerHand.map((card, index) => (
                                <Card 
                                    key={card.id} 
                                    card={card} 
                                    isSelected={selectedIndices.includes(index)}
                                    onClick={() => toggleCardSelection(index)}
                                    index={index}
                                />
                            ))
                        )}
                    </div>
                </div>

            </div>
        )}

      </main>
    </div>
  );
}