import React, { useState } from 'react';

const Menu = ({ onStartGame }) => {
  const [playerCount, setPlayerCount] = useState(2);
  const [aiType, setAiType] = useState('mccfr');

  const handleStartGame = () => {
    onStartGame({
      playerCount: parseInt(playerCount),
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

        h1 {
          margin-bottom: 30px;
          color: #ffffff;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .menu-option {
          margin: 10px 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 300px;
        }

        label {
          font-size: 18px;
          margin-bottom: 5px;
        }

        select {
          padding: 10px;
          font-size: 16px;
          border-radius: 5px;
          border: none;
          background-color: #ffffff;
          cursor: pointer;
        }

        select:focus {
          outline: none;
          box-shadow: 0 0 5px #ffffff;
        }

        button {
          margin-top: 30px;
          padding: 15px 40px;
          font-size: 18px;
          background-color: #006600;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        button:hover {
          background-color: #008800;
        }

        button:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
};

export default Menu;
