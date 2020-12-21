import './Gameboard.css';
import CARBON_DIOXIDE from '../assets/carbon-dioxide.png';
import NITROUS_OXIDE from '../assets/nitrous-oxide.png';
import HYDROGEN_DIOXIDE from '../assets/hydrogen-dioxide.png';
import OZONE from '../assets/ozone.png';
import DICHLORODIFLUOROMETHANE from '../assets/dichlorodifluoromethane.png';
import METHANE from '../assets/methane.png';
import { useEffect } from 'react';

let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;
let canvasWidth = Math.min(windowWidth * 0.72, windowHeight) * 0.90;

const TOKEN_TO_IMAGE_MAP = {
  'carbon-dioxide': CARBON_DIOXIDE,
  'nitrous-oxide': NITROUS_OXIDE,
  'hydrogen-dioxide': HYDROGEN_DIOXIDE,
  'ozone': OZONE,
  'dichlorodifluoromethane': DICHLORODIFLUOROMETHANE,
  'methane': METHANE,
};

function computeRow(game, gameCanvasHeight, offsetY) {
  return Math.floor(offsetY * game.getBoardHeight() / gameCanvasHeight);
}

function computeCol(game, gameCanvasWidth, offsetX) {
  return Math.floor(offsetX * game.getBoardWidth() / gameCanvasWidth);
}

function tokenMoveCallbackFactory(game, tokenImage, initialXOffset, initialYOffset, mouseX, mouseY) {
  let prevX = mouseX;
  let prevY = mouseY;
  const gameCanvas = document.getElementById("gameboard-canvas");
  const actionCanvas = document.getElementById('action-canvas');
  const actionCtx = actionCanvas.getContext('2d');
  let { left, right, top, bottom } = gameCanvas.getBoundingClientRect();
  const gameCanvasWidth = right - left;
  const gameCanvasHeight = bottom - top;
  const tokenWidth = gameCanvasWidth / game.getBoardWidth();
  const tokenHeight = gameCanvasHeight / game.getBoardHeight();
  
  actionCtx.drawImage(tokenImage, prevX - initialXOffset, prevY - initialYOffset, tokenWidth, tokenHeight);

  function tokenMoveCallback(e) {
    const { offsetX, offsetY } = e;
    actionCtx.clearRect(prevX - initialXOffset, prevY - initialYOffset, actionCanvas.width, actionCanvas.height);
    prevX = offsetX;
    prevY = offsetY;
    actionCtx.drawImage(tokenImage, offsetX - initialXOffset, offsetY - initialYOffset, tokenWidth, tokenHeight);
  }
  return tokenMoveCallback;
}

function tokenMouseUpCallbackFactory(game, token, tokenImage, tokenMoveCallback) {
  const gameCanvas = document.getElementById("gameboard-canvas");
  const gameCtx = gameCanvas.getContext("2d");
  const actionCanvas = document.getElementById('action-canvas');
  const actionCtx = actionCanvas.getContext('2d');
  let { left, right, top, bottom } = gameCanvas.getBoundingClientRect();
  const gameCanvasWidth = right - left;
  const gameCanvasHeight = bottom - top;
  const tokenWidth = gameCanvasWidth / game.getBoardWidth();
  const tokenHeight = gameCanvasHeight / game.getBoardHeight();
  function tokenMouseUpCallback(e) {
    actionCanvas.removeEventListener('mousemove', tokenMoveCallback);
    actionCtx.clearRect(0, 0, actionCanvas.clientWidth, actionCanvas.clientHeight);
    actionCanvas.style.display = 'none';
    gameCtx.drawImage(tokenImage, token.col * tokenWidth, token.row * tokenHeight, tokenWidth, tokenHeight);
    actionCanvas.removeEventListener('mouseup', this);
    return tokenMouseUpCallback;
  }
  return tokenMouseUpCallback;
}

function tokenMouseDownCallbackFactory(game) {
  const gameCanvas = document.getElementById("gameboard-canvas");
  const gameCtx = gameCanvas.getContext("2d");
  const actionCanvas = document.getElementById('action-canvas');
  const actionCtx = actionCanvas.getContext('2d');
  const { left, right, top, bottom } = gameCanvas.getBoundingClientRect();
  const gameCanvasWidth = right - left;
  const gameCanvasHeight = bottom - top;
  const tokenWidth = gameCanvasWidth / game.getBoardWidth();
  const tokenHeight = gameCanvasHeight / game.getBoardHeight();

  function tokenMouseDownCallback(e) {
    const { offsetX, offsetY } = e;
    const col = computeCol(game, gameCanvasWidth, offsetX);
    const row = computeRow(game, gameCanvasHeight, offsetY);
    const initialYOffset = offsetY - row * tokenHeight;
    const initialXOffset = offsetX - col * tokenWidth;
    console.log(initialXOffset);
    console.log(initialYOffset);
    gameCtx.clearRect(col * tokenWidth, row * tokenHeight, tokenWidth, tokenHeight);
    const token = game.getToken(row, col);
    const mouseX = left  + offsetX;
    const mouseY = top + offsetY;
    const tokenImage = new Image();
    tokenImage.src = TOKEN_TO_IMAGE_MAP[token.name];
    actionCanvas.style.display = 'block';
    const tokenMoveCallback = tokenMoveCallbackFactory(game, tokenImage, initialXOffset, initialYOffset, mouseX, mouseY);
    actionCanvas.addEventListener('mousemove', tokenMoveCallback);
    const tokenMouseUpCallback = tokenMouseUpCallbackFactory(game, token, tokenImage, tokenMoveCallback);
    actionCanvas.addEventListener('mouseup', tokenMouseUpCallback);
  }
  return tokenMouseDownCallback;
}


function Gameboard(props) {  
  const { game } = props;
  useEffect(() => {
    const gameCanvas = document.getElementById("gameboard-canvas");
    const gameCtx = gameCanvas.getContext("2d");
    const { left, right, top, bottom } = gameCanvas.getBoundingClientRect();
    const gameCanvasWidth = right - left;
    const gameCanvasHeight = bottom - top;
    const tokenWidth = gameCanvasWidth / game.getBoardWidth();
    const tokenHeight = gameCanvasHeight / game.getBoardHeight();
    gameCtx.clearRect(0, 0, gameCanvasWidth, gameCanvasHeight);
    for (let row = 0; row < game.getBoardHeight(); row++) {
      for (let col = 0; col < game.getBoardWidth(); col++) {
        if (game.isEmptySquare(row, col)) {
          continue;
        }
        const token = game.getToken(row, col);
        let tokenImage = new Image();
        tokenImage.src = TOKEN_TO_IMAGE_MAP[token.name];
        tokenImage.onload = function() {
          gameCtx.drawImage(tokenImage, token.col * tokenWidth, token.row * tokenHeight, tokenWidth, tokenHeight);
        }
      }
    }
    gameCanvas.addEventListener('mousedown', tokenMouseDownCallbackFactory(game));
  });

  return (
    <>
      <section className="homepage-gameboard">
        <canvas id="gameboard-canvas" className="gameboard-canvas" width={canvasWidth} height={canvasWidth} />
      </section>
      <canvas id="action-canvas" className="action-canvas" width={windowWidth} height={windowHeight} />
    </>
  );
}

export default Gameboard;