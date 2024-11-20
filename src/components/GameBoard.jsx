import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Hand from './Hand';
import Card from './Card';
import GameStatus from './GameStatus';
import FantasyMode from './FantasyMode';
import Game from '../game/Game';
import { GAME_STATES, INITIAL_CARDS } from '../utils/constants';

const GameBoard = ({ config, onReset }) => {
  const [game, setGame] = useState(null);
  const [currentStreetCards, setCurrentStreetCards] = useState([]);
  const [scores, setScores] = useState({});
  const [gameState, setGameState] = useState(GAME_STATES.WAITING);
  const [isDealing, setIsDealing] = useState(false);
  const [fantasyMode, setFantasyMode] = useState(false);
  const [fantasyCards, setFantasyCards] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);

  useEffect(() => {
    const newGame = new Game(config.playerCount);
    setGame(newGame);
    setCurrentPlayer(newGame.players[0]);
  }, [config.playerCount]);

  const startGame = async () => {
    if (game && !isDealing) {
      setIsDealing(true);
      try {
        await game.start();
        setGameState(GAME_STATES.PLAYING);
        const humanPlayer = game.players[0];
        if (humanPlayer.currentStreetCards) {
          setCurrentStreetCards(humanPlayer.currentStreetCards);
        }
        setCurrentPlayer(humanPlayer);
        setGame({...game});
      } catch (error) {
        console.error('Error starting game:', error);
      } finally {
        setIsDealing(false);
      }
    }
  };

  const handleCardMove = async (cardId, sourceLine, targetLine) => {
    if (game && gameState === GAME_STATES.PLAYING && !isDealing) {
      const success = game.makeMove(0, cardId, targetLine);
      if (success) {
        const humanPlayer = game.players[0];
        setCurrentStreetCards(humanPlayer.currentStreetCards || []);
        
        // Проверяем возможность активации режима фантазии
        if (game.canActivateFantasy(humanPlayer.hand)) {
          setFantasyMode(true);
          setFantasyCards(game.getFantasyCards());
        }
        
        setGame({...game});

        if (humanPlayer.isStreetComplete()) {
          await handleStreetComplete();
        }
      }
    }
  };

  const handleStreetComplete = async () => {
    setIsDealing(true);
    try {
      if (game.isGameOver()) {
        const finalScores = await game.endGame();
        setScores(finalScores);
        setGameState(GAME_STATES.SCORING);
      } else {
        await game.dealStreetCards();
        const humanPlayer = game.players[0];
        setCurrentStreetCards(humanPlayer.currentStreetCards || []);
        setGame({...game});
        
        // Обновляем текущего игрока
        setCurrentPlayer(game.getCurrentPlayer());
      }
    } finally {
      setIsDealing(false);
    }
  };

  const handleFantasyCardSelect = async (cardId, index) => {
    if (fantasyMode && !isDealing) {
      const success = game.makeFantasyMove(0, cardId, index);
      if (success) {
        setFantasyCards(game.getFantasyCards());
        setGame({...game});

        if (game.isFantasyComplete()) {
          setFantasyMode(false);
          await handleStreetComplete();
        }
      }
    }
  };

  const renderCurrentStreetCards = () => {
    if (!currentStreetCards || currentStreetCards.length === 0) return null;

    return (
      <div className="street-cards">
        <h3>Your Cards</h3>
        <div className="cards-container">
          {currentStreetCards.map((card, index) => (
            <Card
              key={`street-${card.rank}${card.suit}`}
              card={card}
              isPlayable={!isDealing && !fantasyMode}
              onCardMove={(cardId) => handleCardMove(cardId, 'street', null)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="game-board">
        <GameStatus 
          gameState={gameState}
          scores={scores}
          currentPlayer={currentPlayer}
        />

        <div className="game-controls">
          {gameState === GAME_STATES.WAITING && (
            <button 
              onClick={startGame}
              disabled={isDealing}
            >
              {isDealing ? 'Dealing...' : 'Start Game'}
            </button>
          )}
          {gameState === GAME_STATES.SCORING && (
            <div className="end-game-controls">
              <button 
                onClick={startGame}
                disabled={isDealing}
              >
                New Game
              </button>
              <button 
                onClick={onReset}
                disabled={isDealing}
              >
                Back to Menu
              </button>
            </div>
          )}
        </div>

        {fantasyMode && (
          <FantasyMode
            cards={fantasyCards}
            onCardSelect={handleFantasyCardSelect}
            isActive={!isDealing}
          />
        )}

        {game && game.players.map((player, index) => (
          <div key={player.id} className="player-section">
            <h3>
              {player.name} {player.isAI ? '(AI)' : ''} 
              {currentPlayer && currentPlayer.id === player.id && ' - Current Turn'}
            </h3>
            <Hand
              hand={player.hand}
              onCardMove={handleCardMove}
              isActive={!player.isAI && gameState === GAME_STATES.PLAYING && !isDealing && !fantasyMode}
            />
            {scores[index] !== undefined && (
              <div className="score">Score: {scores[index]}</div>
            )}
          </div>
        ))}

        {renderCurrentStreetCards()}

        <style jsx>{`
          .game-board {
            padding: 20px;
            background-color: #006600;
            min-height: 100vh;
            color: white;
          }

          .game-controls {
            margin-bottom: 20px;
            text-align: center;
          }

          .end-game-controls {
            display: flex;
            gap: 10px;
            justify-content: center;
          }

          button {
            padding: 10px 20px;
            font-size: 16px;
            background-color: #004400;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s;
          }

          button:hover {
            background-color: #005500;
          }

          button:disabled {
            background-color: #333;
            cursor: not-allowed;
          }

          .street-cards {
            margin: 20px 0;
            padding: 15px;
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
          }

          .cards-container {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            padding: 10px;
          }

          .player-section {
            margin-bottom: 20px;
            padding: 15px;
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            transition: all 0.3s;
          }

          .player-section:hover {
            background-color: rgba(0, 0, 0, 0.3);
          }

          h3 {
            margin: 0 0 10px 0;
            color: #ffffff;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .score {
            margin-top: 10px;
            font-size: 18px;
            font-weight: bold;
            color: #ffff00;
            text-align: right;
          }

          .current-turn {
            color: #ffff00;
            font-size: 14px;
            margin-left: 10px;
          }

          @keyframes dealingAnimation {
            0% { opacity: 0; transform: translateY(-20px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          .dealing {
            animation: dealingAnimation 0.3s ease-out;
          }

          .fantasy-mode-active .player-section:not(.current-player) {
            opacity: 0.5;
            pointer-events: none;
          }

          .game-status {
            position: sticky;
            top: 0;
            z-index: 100;
            background-color: rgba(0, 68, 0, 0.9);
            padding: 10px;
            margin: -20px -20px 20px -20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .error-message {
            background-color: rgba(255, 0, 0, 0.2);
            color: #ff0000;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 10px;
            text-align: center;
          }

          .success-message {
            background-color: rgba(0, 255, 0, 0.2);
            color: #00ff00;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 10px;
            text-align: center;
          }

          @media (max-width: 768px) {
            .game-board {
              padding: 10px;
            }

            .cards-container {
              justify-content: center;
            }

            button {
              width: 100%;
              margin-bottom: 10px;
            }

            .end-game-controls {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </DndProvider>
  );
};

export default GameBoard;
