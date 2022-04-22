import Timer from './Timer.jsx';
import { Game, DEFAULT_WIDTH, DEFAULT_HEIGHT } from '../game/game.js';
import { DEFAULT_TOKENS } from '../game/token.js'

function newGameCallbackFactory(setGameState, gameState, setSeconds, startSeconds, setActiveTimer, addTimeCallback, startMusic) {
  function newGameCallback() {
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
    setGameState(new Game(DEFAULT_WIDTH, DEFAULT_HEIGHT, { regularTokens: DEFAULT_TOKENS.regularTokens }, addTimeCallback));
    setActiveTimer(true);
    setSeconds(startSeconds);
    startMusic();
    const sidebarScore = document.querySelector('.sidebar-score');
    if (sidebarScore) {
      gameState.setBoardScore(0);
      sidebarScore.innerHTML = `Score: ${gameState.getBoardScore()}`;
    }
  }
  return newGameCallback;
}

function Scoreboard(props) {
  const { setGameState, gameState, seconds, setSeconds, active, setActiveTimer, startSeconds, addTimeCallback, startMusic } = props;
  return (
    <section className="scoreboard-container">
      <Timer seconds={seconds} setSeconds={setSeconds} active={active} />
      <section id="score-container" className="score-container">
        <span className="score-label">SCORE</span>
        <span id="score-value" className="score-value">{gameState.getBoardScore()}</span>
      </section>
      <button className="new-game-button" onClick={newGameCallbackFactory(setGameState, gameState, setSeconds, startSeconds, setActiveTimer, addTimeCallback, startMusic)}>NEW GAME</button>
    </section>
  );
}

export default Scoreboard;
