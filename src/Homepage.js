
import './Homepage.css';
import Timer from './components/Timer.jsx';
import { TOKEN_TO_IMAGE_PATH_MAP, Gameboard } from './components/Gameboard.jsx';
import { DEFAULT_TOKENS } from './game/token.js';
import { Game, DEFAULT_WIDTH, DEFAULT_HEIGHT } from './game/game.js';
import { useState, useRef } from 'react';

let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

let canvasWidth = 0.8 * windowWidth;
let canvasHeight = 0.8 * windowHeight;

canvasWidth = Math.min(canvasWidth, canvasHeight);
canvasHeight = canvasWidth;

const TOKEN_TO_NAME_MAP = {
  'carbon-dioxide': 'CARBON DIOXIDE',
  'nitrous-oxide': 'NITROUS OXIDE',
  'cfc': 'CHLOROFLUOROCARBONS',
  'pfc': 'PERFLUOROCARBONS',
  'sulfur-hexafluoride': 'SULFUR HEXAFLUORIDE',
  'methane': 'METHANE',
  'special-carbon-dioxide': 'BISMUTH',
  'special-nitrous-oxide': 'TITANIUM DIOXIDE',
  'special-cfc': 'TETRAFLUOROPROPENE',
  'special-pfc': 'AMMONIA',
  'special-sulfur-hexafluoride': 'TRIFLUOROIODOMETHANE',
  'special-methane': 'ZEOLITES',
  'carbon-bomb': 'REFORESTATION',
};

const DEFAULT_START_SECONDS = 300;

function Homepage() {
  const [seconds, setSeconds] = useState(DEFAULT_START_SECONDS);
  const secondsRef = useRef();
  secondsRef.current = seconds;
  function addTimeCallback(time) {
    setSeconds(secondsRef.current + time);
  }
  const [gameState, setGameState] = useState(
    new Game(DEFAULT_WIDTH, DEFAULT_HEIGHT, { regularTokens: DEFAULT_TOKENS.regularTokens }, addTimeCallback));
  const [shouldDisplaySpecialAchievements, setShouldDisplaySpecialAchievement] = useState(false);
  const [activeTimer, setActiveTimer] = useState(false);

  const homepageAwardWidth = (0.95 * windowWidth - canvasWidth);
  const homepageGameWidth = windowWidth - homepageAwardWidth;
  const homepageGameStyle = {width: homepageGameWidth};
  const homepageAwardsStyle = {width: homepageAwardWidth};
  const achievementsHeaderStyle = {height: 0.1 * canvasHeight};
  const achievementsContainerStyle = {height: canvasHeight};
  const achievementsStyle = {height: 0.9 * canvasHeight, maxHeight: 0.9 * canvasHeight};
  const achievementsImageStyle = {height: 0.13 * canvasHeight, width: 0.13 * canvasHeight, marginLeft: 'auto', marginRight: 'auto'};

  const achievementsColOne = [];
  const achievementsColTwo = [];
  const tokens = shouldDisplaySpecialAchievements ? DEFAULT_TOKENS.specialTokens : DEFAULT_TOKENS.regularTokens;
  for (let i = 0; i < tokens.length; i++) {
    const tokenImagePath = TOKEN_TO_IMAGE_PATH_MAP[tokens[i]];
    const image = (
      <section className="achievement-container" key={tokens[i]}>
        <section className="achievement-image-container">
          <img src={tokenImagePath} style={achievementsImageStyle} alt={TOKEN_TO_NAME_MAP[tokens[i]]}/>
          <section className="achievement-label">{TOKEN_TO_NAME_MAP[tokens[i]]}</section>
        </section>
        <section className="achievement-value">{`${gameState.getCaptureCount(tokens[i])}x`}</section>
      </section>
    )
    if (i % 2 === 0) {
      achievementsColOne.push(image);
    }
    else {
      achievementsColTwo.push(image);
    }
  }

  return (
    <main className="homepage">
      <article className="homepage-game" style={homepageGameStyle}>
        <section className="homepage-header">
          <section className="homepage-title">
            <h1 className="homepage-title-start">CARBON</h1>
            <h1 className="homepage-title-end">CRUSH</h1>
          </section>
        </section>
        <Gameboard 
          game={gameState} 
          setGame={setGameState} 
          startSeconds={DEFAULT_START_SECONDS} 
          setSeconds={setSeconds}
          setActiveTimer={setActiveTimer}
          canvasWidth={canvasWidth} 
          canvasHeight={canvasHeight}
          addTimeCallback={addTimeCallback}
        />
      </article>
      <article className="homepage-awards" style={homepageAwardsStyle}>
        <Timer seconds={seconds} setSeconds={setSeconds} active={activeTimer} small={false}/>
        <section className="achievements-container" style={achievementsContainerStyle}>
          <section className="achievements-header" style={achievementsHeaderStyle}>
            <section className="achievements-title">ACHIEVEMENTS</section>
            <section className="achievements-tabs">
              <button className="achievements-tab" onClick={() => setShouldDisplaySpecialAchievement(false)}>REGULAR</button>
              <button className="achievements-tab" onClick={() => setShouldDisplaySpecialAchievement(true)}>SPECIAL</button>
            </section>
          </section>
          <section className="achievements" style={achievementsStyle}>
            <section className="achievements-table">
              <section className="achievements-col">
                {achievementsColOne}
              </section>
              <section className="achievements-col">
                {achievementsColTwo}
              </section>
            </section>
            {shouldDisplaySpecialAchievements && 
              <section className="achievement-container carbon-bomb">
                <section className="achievement-image-container">
                  <img src={TOKEN_TO_IMAGE_PATH_MAP['carbon-bomb']} style={achievementsImageStyle} alt={TOKEN_TO_NAME_MAP['carbon-bomb']}/>
                  <section className="achievement-label">{TOKEN_TO_NAME_MAP['carbon-bomb']}</section>
                </section>
              <section className="achievement-value">{`${gameState.getCaptureCount('carbon-bomb')}x`}</section>
             </section>
            }
          </section>
        </section>
      </article>
    </main>
  );
}

export default Homepage;
