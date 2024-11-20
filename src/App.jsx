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
