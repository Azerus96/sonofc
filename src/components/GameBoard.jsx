import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Hand from './Hand';
import Card from './Card';
import GameStatus from './GameStatus';
import FantasyMode from './FantasyMode';
import Game from '../game/Game';
import { GAME_STATES } from '../utils/constants';

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
        setGame({ ...game });
      } catch (error) {
        console.error('Error starting game:', error);
      } finally {
        setIsDealing(false);
      }
    }
  };

  const handleCardMove = async (cardId, sourceLine, targetLine, targetIndex) => {
    console.log("Attempting to move card:", cardId, "from line:", sourceLine, "to line:", targetLine);
    
    const success = game.makeMove(currentPlayer.id, cardId, targetLine);
    if (success) {
      const humanPlayer = game.players[0];
      setCurrentStreetCards(humanPlayer.currentStreetCards || []);
      console.log("Successfully moved card. Current street cards:", humanPlayer.currentStreetCards);
    } else {
      console.error("Card move failed.");
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
              onCardMove={handleCardMove}
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
          {aiPlayers.map((player, index) => (
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
          /* Остальные стили... */
        `}</style>
      </div>
    </DndProvider>
  );
};

export default GameBoard;
