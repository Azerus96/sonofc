import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Hand from './Hand';
import Card from './Card';
import GameStatus from './GameStatus';
import FantasyMode from './FantasyMode';
import Game from '../game/Game';
import { GAME_STATES, LINES } from '../utils/constants';

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
        setCurrentStreetCards(humanPlayer.currentStreetCards || []);
        setCurrentPlayer(humanPlayer);
        setGame({ ...game });
      } catch (error) {
        console.error('Error starting game:', error);
      } finally {
        setIsDealing(false);
      }
    }
  };

  const handleCardMove = async (cardId, sourceLine, targetLine, targetIndex) => {
    if (!currentPlayer || !game) return;

    const success = game.makeMove(currentPlayer.id, cardId, targetLine, targetIndex);
    if (success) {
      const humanPlayer = game.players[0];
      setCurrentStreetCards(humanPlayer.currentStreetCards || []);
      setGame({ ...game });
      setCurrentPlayer(game.getCurrentPlayer());
    } else {
      console.error("Card move failed.");
    }
  };

  const handleStreetComplete = async () => {
    if (!game) return;
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
        setGame({ ...game });
        setCurrentPlayer(game.getCurrentPlayer());
      }
    } catch (error) {
      console.error("Error completing street:", error);
    } finally {
      setIsDealing(false);
    }
  };

  const handleFantasyCardSelect = async (cardId, index) => {
    if (fantasyMode && !isDealing && game) {
      const success = game.makeFantasyMove(0, cardId, index);
      if (success) {
        setFantasyCards(game.getFantasyCards());
        setGame({ ...game });

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

  const renderPlayers = () => {
    if (!game || !game.players) return null;

    const humanPlayer = game.players[0];
    const aiPlayers = game.players.slice(1);

    return (
      <div className="players-layout">
        <div className="ai-players">
          {aiPlayers.map((player) => (
            <div key={player.id} className="player-section ai-player">
              <h3>
                {player.name} {player.isAI ? '(AI)' : ''}
                {currentPlayer && currentPlayer.id === player.id && ' - Current Turn'}
              </h3>
              <Hand
                hand={player.hand}
                onCardMove={handleCardMove}
                isActive={false}
              />
              {scores[player.id] !== undefined && (
                <div className="score">Score: {scores[player.id]}</div>
              )}
            </div>
          ))}
        </div>

        <div className="human-player">
          {renderCurrentStreetCards()}
          <div className="player-section">
            <h3>
              {humanPlayer.name}
              {currentPlayer && currentPlayer.id === humanPlayer.id && ' - Your Turn'}
            </h3>
            <Hand
              hand={humanPlayer.hand}
              onCardMove={handleCardMove}
              isActive={gameState === GAME_STATES.PLAYING && !isDealing && !fantasyMode}
            />
            {scores[humanPlayer.id] !== undefined && (
              <div className="score">Score: {scores[humanPlayer.id]}</div>
            )}
          </div>
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
          <button
            onClick={onReset}
            className="menu-button"
          >
            Back to Menu
          </button>
        </div>

        {fantasyMode && (
          <FantasyMode
            cards={fantasyCards}
            onCardSelect={handleFantasyCardSelect}
            isActive={!isDealing}
          />
        )}

        {renderPlayers()}

        <style jsx>{`
          .game-board {
            padding: 20px;
            background-color: #006600;
            min-height: 100vh;
            color: white;
            display: flex;
            flex-direction: column;
          }

          .players-layout {
            display: flex;
            flex-direction: column;
            gap: 20px;
            flex: 1;
          }

          .ai-players {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 20px;
          }

          .ai-player {
            flex: 1;
            max-width: 45%;
          }

          .human-player {
            margin-top: auto;
          }

          .game-controls {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-bottom: 20px;
          }

          .menu-button {
            background-color: #660000;
          }

          .menu-button:hover {
            background-color: #880000;
          }

          .player-section {
            padding: 15px;
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
          }

          .street-cards {
            margin-bottom: 20px;
            padding: 15px;
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
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

          .cards-container {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            padding: 10px;
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

          @media (max-width: 768px) {
            .game-board {
              padding: 10px;
            }

            .ai-players {
              flex-direction: column;
              align-items: center;
            }

            .ai-player {
              max-width: 100%;
              width: 100%;
            }

            .game-controls {
              flex-direction: column;
            }

            button {
              width: 100%;
            }

            .cards-container {
              justify-content: center;
            }
          }
        `}</style>
      </div>
    </DndProvider>
  );
};

export default GameBoard;
