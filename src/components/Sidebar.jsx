import './Sidebar.css';

import Timer from './Timer.jsx';

function Sidebar(props) {
  const { score, newGameCallback, showTimer , seconds, setSeconds } = props;
  return (
    <section className="homepage-sidebar">
      <section className="homepage-sidebar-container">
        <button className="sidebar-new-game-button" onClick={newGameCallback}>New Game</button>
        <section id="sidebar-score" className="sidebar-score">Score: {score}</section>
      </section>
      {showTimer && <Timer seconds={seconds} setSeconds={setSeconds}/>}
    </section>
  );
}

export default Sidebar;