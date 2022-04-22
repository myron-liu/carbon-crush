
import './Homepage.css';
import Achievements from './components/Achievements.jsx';
import Scoreboard from './components/Scoreboard.jsx';
import { Gameboard } from './components/Gameboard.jsx';
import { DEFAULT_TOKENS } from './game/token.js';
import { Game, DEFAULT_WIDTH, DEFAULT_HEIGHT } from './game/game.js';
import { useState, useRef } from 'react';
import { Howl, Howler } from "howler"

import SOUNDTRACK from './assets/sounds/sm_crushmusic1.mp3';
import MUTE_ICON from './assets/mute_icon.svg';
import UNMUTE_ICON from './assets/unmute_icon.svg';

let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

let canvasWidth = 0.94 * windowWidth;
let canvasHeight = 0.94 * windowHeight;

if (windowHeight > 800 && windowWidth < 1170) {
  canvasWidth = 0.9 * windowWidth;
  canvasHeight = 0.9 * windowHeight;
}

if (windowHeight > 800 && windowWidth < 1100) {
  canvasWidth = 0.875 * windowWidth;
  canvasHeight = 0.875 * windowHeight;
}

if (windowHeight > 800 && windowWidth < 1040) {
  canvasWidth = 0.825 * windowWidth;
  canvasHeight = 0.825 * windowHeight;
}

if (windowHeight > 800 && windowWidth < 980) {
  canvasWidth = 0.775 * windowWidth;
  canvasHeight = 0.775 * windowHeight;
}

if (windowHeight > 800 && windowWidth < 900) {
  canvasWidth = 0.725 * windowWidth;
  canvasHeight = 0.725 * windowHeight;
}


canvasWidth = Math.min(canvasWidth, canvasHeight);
canvasHeight = canvasWidth;

const DEFAULT_START_SECONDS = 300;

const SOUNDTRACK_CLIP = new Howl({
  src: [SOUNDTRACK],
  loop: true,
})

function Homepage() {
  const [seconds, setSeconds] = useState(DEFAULT_START_SECONDS);
  const secondsRef = useRef();
  secondsRef.current = seconds;
  function addTimeCallback(time) {
    setSeconds(secondsRef.current + time);
  }

  // setup mute / unmute button
  const [muted, setMuted] = useState(false);
  function toggleMute() {
    Howler.mute(!muted);
    setMuted(!muted)
  }
  function startMusic() {
    if (!SOUNDTRACK_CLIP.playing()) {
      SOUNDTRACK_CLIP.play();
    }
  }
  startMusic();

  const [gameState, setGameState] = useState(
    new Game(DEFAULT_WIDTH, DEFAULT_HEIGHT, { regularTokens: DEFAULT_TOKENS.regularTokens }, addTimeCallback));
  const [displaySpecialAchievements, toggleSpecialAchievements] = useState(false);
  const [activeTimer, setActiveTimer] = useState(false);

  const homepageMenuStyle = { width: 0.75 * (windowWidth - canvasWidth) };



  return (
    <main className="homepage">
      <img id="mute_button" onClick={() => { toggleMute() }} alt={muted ? "unmute" : "mute"} src={muted ? MUTE_ICON : UNMUTE_ICON} role="button"></img>
      <article className="homepage-menu" style={homepageMenuStyle}>
        <section className="homepage-header">
          <section className="homepage-title">
            <h1 className="homepage-title-start">CARBON</h1>
            <h1 className="homepage-title-end">CRUSH</h1>
          </section>
          <section className="homepage-subtitle">
            <p className="homepage-subtitle-start">Eliminate those greenhouse gases!</p>
            <p className="homepage-subtitle-end">Match three in a row to clear gases and get points.</p>
          </section>
        </section>
        <section className="homepage-submenu">
          <Achievements
            gameState={gameState}
            toggleSpecialAchievements={toggleSpecialAchievements}
            displaySpecialAchievements={displaySpecialAchievements}
          />
          <Scoreboard
            gameState={gameState}
            setGameState={setGameState}
            seconds={seconds}
            setSeconds={setSeconds}
            startSeconds={DEFAULT_START_SECONDS}
            active={activeTimer}
            setActiveTimer={setActiveTimer}
            addTimeCallback={addTimeCallback}
            startMusic={startMusic}
          />
        </section>
      </article>
      <article className="homepage-game">
        <Gameboard
          game={gameState}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
        />
      </article>
    </main>
  );
}

export default Homepage;
