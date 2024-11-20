import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Menu from './components/Menu';
import GameBoard from './components/GameBoard';

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameConfig, setGameConfig] = useState(null);

  // Загружаем состояние при монтировании
  useEffect(() => {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      try {
        const { started, config } = JSON.parse(savedState);
        setGameStarted(started);
        setGameConfig(config);
      } catch (error) {
        console.error('Error loading saved game state:', error);
        localStorage.removeItem('gameState');
      }
    }
  }, []);

  // Сохраняем состояние при изменении
  useEffect(() => {
    if (gameStarted && gameConfig) {
      localStorage.setItem('gameState', JSON.stringify({
        started: gameStarted,
        config: gameConfig
      }));
    } else {
      localStorage.removeItem('gameState');
    }
  }, [gameStarted, gameConfig]);

  const handleStartGame = (config) => {
    setGameConfig(config);
    setGameStarted(true);
  };

  const handleResetGame = () => {
    setGameStarted(false);
    setGameConfig(null);
    localStorage.removeItem('gameState');
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        {!gameStarted ? (
          <Menu onStartGame={handleStartGame} />
        ) : (
          <GameBoard 
            config={gameConfig} 
            onReset={handleResetGame}
          />
        )}
        
        <style jsx>{`
          .app {
            min-height: 100vh;
            background-color: #004400;
          }
          
          :global(body) {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
              'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
              sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        `}</style>
      </div>
    </DndProvider>
  );
};

export default App;
