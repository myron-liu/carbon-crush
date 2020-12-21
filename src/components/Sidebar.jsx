import './Sidebar.css';

function Sidebar(props) {
  const { score, newGameCallback } = props;
  return (
    <section className="homepage-sidebar">
      <button className="sidebar-new-game-button" onClick={newGameCallback}>New Game</button>
      <section className="sidebar-score">Score: {score}</section>
    </section>
  );
}

export default Sidebar;