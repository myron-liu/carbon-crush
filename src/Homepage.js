
import './Homepage.css';
import Sidebar from './components/Sidebar.jsx';
import Gameboard from './components/Gameboard.jsx';
import { DEFAULT_TOKENS } from './game/token.js';
import { Game, DEFAULT_WIDTH, DEFAULT_HEIGHT } from './game/game.js';
import { useState } from 'react';

function Homepage() {
  const [gameState, setGameState] = useState(
    new Game(DEFAULT_WIDTH, DEFAULT_HEIGHT, { regularTokens: DEFAULT_TOKENS.regularTokens }));
  const [shouldShowTimerState, setShouldShowTimerState] = useState(false);
  const [seconds, setSeconds] = useState(365);
  return (
    <main className="homepage">
      <section className="homepage-menu">
        <section className="homepage-header">
          <h1 className="homepage-title">Carbon Crush</h1>
          <p className="homepage-subtitle">Sequestrate those greenhouse gases!</p>
        </section>
        <Sidebar 
        score={gameState.getBoardScore()} 
        seconds={seconds} 
        setSeconds={setSeconds} 
        showTimer={shouldShowTimerState} newGameCallback={() => {
          const gameCanvas = document.getElementById("gameboard-canvas");
          const gameCtx = gameCanvas.getContext("2d");
          let { left, right, top, bottom } = gameCanvas.getBoundingClientRect();
          const gameCanvasWidth = right - left;
          const gameCanvasHeight = bottom - top;
          const actionCanvas = document.getElementById("action-canvas");
          const actionCtx = actionCanvas.getContext("2d");
          ({ left, right, top, bottom } = actionCanvas.getBoundingClientRect());
          const actionCanvasWidth = right - left;
          const actionCanvasHeight = bottom - top
          actionCtx.clearRect(0, 0, actionCanvasWidth, actionCanvasHeight);
          gameCtx.clearRect(0, 0, gameCanvasWidth, gameCanvasHeight);
          const gameCanvasClone = gameCanvas.cloneNode(true);
          const actionCanvasClone = actionCanvas.cloneNode(true);
          gameCanvas.parentNode.replaceChild(gameCanvasClone, gameCanvas);
          actionCanvas.parentNode.replaceChild(actionCanvasClone, actionCanvas);
          actionCanvas.style.display = 'none';
          setGameState(new Game(DEFAULT_WIDTH, DEFAULT_HEIGHT, { regularTokens: DEFAULT_TOKENS.regularTokens }));
          setShouldShowTimerState(true);
          setSeconds(365);
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
