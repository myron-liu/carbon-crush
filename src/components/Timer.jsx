import React, { useEffect } from 'react';

export default function Timer(props) {
  const { seconds, setSeconds, active } = props;
  
  useEffect(() => {
    let interval = null;
    if (active && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds - 1);
      }, 1000);
    }
    else if (active) {
      clearInterval(interval);
      const gameCanvas = document.getElementById("gameboard-canvas");
      const actionCanvas = document.getElementById("action-canvas");
      const gameCanvasClone = gameCanvas.cloneNode(true);
      const actionCanvasClone = actionCanvas.cloneNode(true);
      const gameCanvasCloneCtx = gameCanvasClone.getContext('2d');
      gameCanvasCloneCtx.drawImage(gameCanvas, 0, 0);
      gameCanvas.parentNode.replaceChild(gameCanvasClone, gameCanvas);
      actionCanvas.parentNode.replaceChild(actionCanvasClone, actionCanvas);
      actionCanvas.style.display = 'none';
    }
    return () => clearInterval(interval);
  }, [seconds, setSeconds, active]);
  
  const timerClassNames = `timer ${seconds < 60 ? 'timer-red' : ''}`;
  const secondsText = (seconds % 60 < 10) ? `0${seconds % 60}` : seconds % 60;
  const timerText = seconds < 60 ? `:${secondsText}` : `${Math.floor(seconds / 60)}:${secondsText}`;
  return (
    <section className={timerClassNames}>
      <section className="timer-label">
        {"TIME"}
      </section>
      <section className="timer-value">
        {timerText}
      </section>

    </section>
  )
}