import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Hand from '@/components/Hand';
import Card from '@/components/Card';
import Game from '@/game/Game';
import { GAME_STATES } from '@/utils/constants';

const GameBoard = () => {
  const [game, setGame] = useState(null);
  const [currentStreetCards, setCurrentStreetCards] = useState([]);
  const [scores, setScores] = useState({});
  const [gameState, setGameState] = useState(GAME_STATES.WAITING);

  useEffect(() => {
    const newGame = new Game(2); // 2 игрока по умолчанию
    setGame(newGame);
  }, []);

  const startGame = () => {
    if (game) {
      game.start();
      setGameState(GAME_STATES.PLAYING);
      dealStreetCards();
    }
  };

  const dealStreetCards = () => {
    if (game && game.state === GAME_STATES.PLAYING) {
      const humanPlayer = game.players[0];
      if (humanPlayer.currentStreetCards) {
        setCurrentStreetCards(humanPlayer.currentStreetCards);
      }
    }
  };

  const handleCardMove = (cardId, sourceLine, targetLine, targetIndex) => {
    if (game && game.state === GAME_STATES.PLAYING) {
      const humanPlayer = game.players[0];
      const success = game.makeMove(0, cardId, targetLine);
      
      if (success) {
        setGame({ ...game });
        
        if (humanPlayer.isHandComplete()) {
          handleStreetComplete();
        }
      }
    }
  };

  const handleStreetComplete = () => {
    if (game.isGameOver()) {
      const finalScores = game.calculateScores();
      setScores(finalScores);
      setGameState(GAME_STATES.SCORING);
    } else {
      game.dealStreetCards();
      dealStreetCards();
    }
  };

  const renderCurrentStreetCards = () => {
    if (!currentStreetCards.length) return null;

    return (
      <div className="street-cards">
        <h3>Current Street Cards</h3>
        <div style={{ display: 'flex', gap: '4px' }}>
          {currentStreetCards.map((card, index) => (
            <Card
              key={`street-${card.rank}${card.suit}`}
              card={card}
              isPlayable={true}
              onCardMove={(cardId) => handleCardMove(cardId, 'street', null, index)}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderPlayers = () => {
    if (!game) return null;

    return game.players.map((player, index) => (
      <div key={player.id} className="player-section">
        <h3>{player.name} {player.isAI ? '(AI)' : ''}</h3>
        <Hand
          hand={player.hand}
          onCardMove={handleCardMove}
          isActive={!player.isAI && gameState === GAME_STATES.PLAYING}
        />
        {scores[index] !== undefined && (
          <div className="score">Score: {scores[index]}</div>
        )}
      </div>
    ));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="game-board">
        <div className="game-controls">
          {gameState === GAME_STATES.WAITING && (
            <button onClick={startGame}>Start Game</button>
          )}
          {gameState === GAME_STATES.SCORING && (
            <button onClick={startGame}>New Game</button>
          )}
        </div>

        {renderCurrentStreetCards()}
        
        <div className="players-container">
          {renderPlayers()}
        </div>

        <style jsx>{`
          .game-board {
            padding: 20px;
            background-color: #006600;
            min-height: 100vh;
          }
          
          .game-controls {
            margin-bottom: 20px;
          }
          
          .players-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          
          .player-section {
            background-color: rgba(0, 0, 0, 0.2);
            padding: 15px;
            border-radius: 10px;
          }
          
          .street-cards {
            margin-bottom: 20px;
            padding: 15px;
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
          }
          
          .score {
            margin-top: 10px;
            font-size: 18px;
            color: white;
          }
        `}</style>
      </div>
    </DndProvider>
  );
};

export default GameBoard;
