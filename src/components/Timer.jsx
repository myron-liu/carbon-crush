import React, { useState, useEffect } from 'react';

export default function Timer(props) {
  const { seconds, setSeconds } = props;
  
  useEffect(() => {
    let interval = null;
    if (seconds > 0) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds - 1);
      }, 1000);
    }
    else {
      clearInterval(interval);
      const gameCanvas = document.getElementById("gameboard-canvas");
      const gameCtx = gameCanvas.getContext("2d");
      const actionCanvas = document.getElementById("action-canvas");
      const actionCtx = actionCanvas.getContext("2d");
      const gameCanvasClone = gameCanvas.cloneNode(true);
      const actionCanvasClone = actionCanvas.cloneNode(true);
      const gameCanvasCloneCtx = gameCanvasClone.getContext('2d');
      gameCanvasCloneCtx.drawImage(gameCanvas, 0, 0);
      gameCanvas.parentNode.replaceChild(gameCanvasClone, gameCanvas);
      actionCanvas.parentNode.replaceChild(actionCanvasClone, actionCanvas);
      actionCanvas.style.display = 'none';
    }
    return () => clearInterval(interval);
  }, [seconds]);
  
  const timerClassNames = `timer ${seconds < 60 ? 'timer-red' : ''}`;
  const timerText = seconds < 60 
    ? `${seconds % 60} seconds remaining` 
    : `${Math.floor(seconds / 60)} minutes and ${seconds % 60} seconds remaining`;
  return (
    <section className={timerClassNames}>
      {timerText}
    </section>
  )
}