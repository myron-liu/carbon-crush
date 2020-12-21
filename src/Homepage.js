
import './Homepage.css';
import Sidebar from './components/Sidebar.jsx';
import Gameboard from './components/Gameboard.jsx';
import { DEFAULT_TOKENS, Token } from './game/token.js';
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
        <Sidebar score={gameState.getBoardScore()} newGameCallback={() => 
          setGameState(new Game(DEFAULT_WIDTH, DEFAULT_HEIGHT, { regularTokens: DEFAULT_TOKENS.regularTokens }))}
        />
      </section>
      <Gameboard game={gameState}/>
    </main>
  );
}

export default Homepage;
