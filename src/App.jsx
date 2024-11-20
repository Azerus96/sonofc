import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Menu from '@/components/Menu';
import GameBoard from '@/components/GameBoard';

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameConfig, setGameConfig] = useState(null);

  const handleStartGame = (config) => {
    setGameConfig(config);
    setGameStarted(true);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        {!gameStarted ? (
          <Menu onStartGame={handleStartGame} />
        ) : (
          <GameBoard config={gameConfig} />
        )}
        
        <style jsx>{`
          .app {
            min-height: 100vh;
            background-color: #004400;
          }
        `}</style>
      </div>
    </DndProvider>
  );
};

export default App;
