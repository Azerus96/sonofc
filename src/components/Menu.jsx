import React, { useState } from 'react';

const Menu = ({ onStartGame }) => {
  const [playerCount, setPlayerCount] = useState(2);
  const [aiType, setAiType] = useState('mccfr');

  const handleStartGame = () => {
    onStartGame({
      playerCount,
      aiType
    });
  };

  return (
    <div className="menu">
      <h1>OFC Pineapple Poker</h1>
      
      <div className="menu-option">
        <label>Number of Players:</label>
        <select 
          value={playerCount} 
          onChange={(e) => setPlayerCount(parseInt(e.target.value))}
        >
          <option value={2}>2 Players</option>
          <option value={3}>3 Players</option>
        </select>
      </div>

      <div className="menu-option">
        <label>AI Type:</label>
        <select 
          value={aiType} 
          onChange={(e) => setAiType(e.target.value)}
        >
          <option value="mccfr">MCCFR</option>
        </select>
      </div>

      <button onClick={handleStartGame}>Start Game</button>

      <style jsx>{`
        .menu {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          background-color: #004400;
          min-height: 100vh;
          color: white;
        }

        .menu-option {
          margin: 10px 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        select {
          padding: 5px;
          width: 200px;
        }

        button {
          margin-top: 20px;
          padding: 10px 20px;
          background-color: #006600;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        button:hover {
          background-color: #008800;
        }
      `}</style>
    </div>
  );
};

export default Menu;
