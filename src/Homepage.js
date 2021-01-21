
import './Homepage.css';
import Sidebar from './components/Sidebar.jsx';
import Gameboard from './components/Gameboard.jsx';
import { DEFAULT_TOKENS } from './game/token.js';
import { Game, DEFAULT_WIDTH, DEFAULT_HEIGHT } from './game/game.js';
import { useState } from 'react';

function Homepage() {
  const [gameState, setGameState] = useState(
    new Game(DEFAULT_WIDTH, DEFAULT_HEIGHT, { regularTokens: DEFAULT_TOKENS.regularTokens }));
  return (
    <main className="homepage">
      <section className="homepage-menu">
        <h1 className="homepage-title">Carbon Crush</h1>
        <p className="homepage-subtitle">Sequestrate those greenhouse gases!</p>
        <Sidebar score={gameState.getBoardScore()} newGameCallback={() => {
          const gameCanvas = document.getElementById("gameboard-canvas");
          const gameCtx = gameCanvas.getContext("2d");
          const actionCanvas = document.getElementById("action-canvas");
          const actionCtx = actionCanvas.getContext("2d");
          actionCtx.clearRect(0, 0, actionCanvas.innerWidth, actionCanvas.innerHeight);
          gameCtx.clearRect(0, 0, gameCanvas.innerWidth, gameCanvas.innerHeight);
          const gameCanvasClone = gameCanvas.cloneNode(true);
          const actionCanvasClone = actionCanvas.cloneNode(true);
          gameCanvas.parentNode.replaceChild(gameCanvasClone, gameCanvas);
          actionCanvas.parentNode.replaceChild(actionCanvasClone, actionCanvas);
          actionCanvas.style.display = 'none';
          setGameState(new Game(DEFAULT_WIDTH, DEFAULT_HEIGHT, { regularTokens: DEFAULT_TOKENS.regularTokens }));
          const sidebarScore = document.querySelector('.sidebar-score');
          if (sidebarScore) {
            gameState.setBoardScore(0);
            sidebarScore.innerHTML = `Score: ${gameState.getBoardScore()}`;
          }
        }}
        />
      </section>
      <Gameboard game={gameState}/>
    </main>
  );
}

export default Homepage;
