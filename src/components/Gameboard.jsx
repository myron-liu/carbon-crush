import './Gameboard.css';
import CARBON_DIOXIDE from '../assets/carbon-dioxide.png';
import CFC from '../assets/cfc.png';
import PFC from '../assets/pfc.png';
import SULFUR_HEXAFLUORIDE from '../assets/sulfur-hexafluoride.png';
import NITROUS_OXIDE from '../assets/nitrous-oxide.png';
import METHANE from '../assets/methane.png';
import SPECIAL_CARBON_DIOXIDE from '../assets/special-carbon-dioxide.png';
import SPECIAL_CFC from '../assets/special-cfc.png';
import SPECIAL_PFC from '../assets/special-pfc.png';
import SPECIAL_SULFUR_HEXAFLUORIDE from '../assets/special-sulfur-hexafluoride.png';
import SPECIAL_NITROUS_OXIDE from '../assets/special-nitrous-oxide.png';
import SPECIAL_METHANE from '../assets/special-methane.png';
import CARBON_BOMB from '../assets/carbon-bomb.png';
import { Token } from '../game/token.js';
import { useLayoutEffect, useRef } from 'react';

let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;
let canvasWidth = Math.min(windowWidth * 0.72, windowHeight) * 0.90;
let mouseUpEventListener = null;

const TOKEN_TO_IMAGE_PATH_MAP = {
  'carbon-dioxide': CARBON_DIOXIDE,
  'nitrous-oxide': NITROUS_OXIDE,
  'cfc': CFC,
  'pfc': PFC,
  'sulfur-hexafluoride': SULFUR_HEXAFLUORIDE,
  'methane': METHANE,
  'special-carbon-dioxide': SPECIAL_CARBON_DIOXIDE,
  'special-nitrous-oxide': SPECIAL_NITROUS_OXIDE,
  'special-cfc': SPECIAL_CFC,
  'special-pfc': SPECIAL_PFC,
  'special-sulfur-hexafluoride': SPECIAL_SULFUR_HEXAFLUORIDE,
  'special-methane': SPECIAL_METHANE,
  'carbon-bomb': CARBON_BOMB,
};

const LOADED_TOKEN_IMAGE_CACHE = new Object();


function loadTokenImages() {
  for (const key in TOKEN_TO_IMAGE_PATH_MAP) {
    const tokenImage = new Image();
    tokenImage.src = TOKEN_TO_IMAGE_PATH_MAP[key];
    LOADED_TOKEN_IMAGE_CACHE[key] = tokenImage;
  }
}
loadTokenImages();

function getTokenImage(name) {
  if (name in LOADED_TOKEN_IMAGE_CACHE) {
    return LOADED_TOKEN_IMAGE_CACHE[name];
  }
  else {
    const tokenImage = new Image();
    tokenImage.src = TOKEN_TO_IMAGE_PATH_MAP[name];
    LOADED_TOKEN_IMAGE_CACHE[name] = tokenImage;
    return tokenImage;
  }
}


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

function dropTokenAnimation(game) {
  const gameCanvas = document.getElementById("gameboard-canvas");
  const gameCtx = gameCanvas.getContext('2d');
  let { left, right, top, bottom } = gameCanvas.getBoundingClientRect();
  const gameCanvasWidth = right - left;
  const gameCanvasHeight = bottom - top;
  const tokenWidth = gameCanvasWidth / game.getBoardWidth();
  const tokenHeight = gameCanvasHeight / game.getBoardHeight();
  const actionCanvas = document.getElementById('action-canvas');
  const actionCtx = actionCanvas.getContext('2d');

  const tokenDropFrame = 10;
  const tokenDropRate = tokenHeight / tokenDropFrame;

  // Note the index corresponds to which column the destination belongs to
  const destinationSquares = new Array(game.getBoardWidth());
  const totalDestinationSquares = new Array(game.getBoardWidth());
  const numTokensToGenerate = new Array(game.getBoardWidth());
  const tokenSquares = new Array(game.getBoardWidth());
  for (let col = 0; col < game.getBoardWidth(); col++) {
    let drop = 0;
    destinationSquares[col] = new Array(game.getBoardHeight());
    totalDestinationSquares[col] = new Array(game.getBoardHeight());
    tokenSquares[col] = new Array(game.getBoardHeight());
    for (let row = game.getBoardHeight() - 1; row >= 0; row--) {
      tokenSquares[col][row] = game.getToken(row, col);
      if (game.isEmptySquare(row, col)) {
        drop += 1;
        destinationSquares[col][row] = 0;
        totalDestinationSquares[col][row] = 0;
      }
      else {
        destinationSquares[col][row] = drop * tokenDropFrame;
        totalDestinationSquares[col][row] = drop;
      }
    }
    numTokensToGenerate[col] = drop;
  }
  const generatedTokens = new Array(game.getBoardWidth());
  const generatedTokenDistance = new Array(game.getBoardWidth());
  for (let col = 0; col < game.getBoardWidth(); col++) {
    generatedTokens[col] = new Array(numTokensToGenerate[col]);
    generatedTokenDistance[col] = new Array(numTokensToGenerate[col]);
    let i = 0;
    while (i < numTokensToGenerate[col]) {
      generatedTokens[col][i] = game.spawnToken(i, col);
      generatedTokenDistance[col][i] = 0;
      i++;
    }
  }
  function dropTokenAnimationStep() {
    let completed = true;
    for (let col = 0; col < game.getBoardWidth(); col++) {
      const colDestinationSquares = destinationSquares[col];
      const colTotalDestinationSquares = totalDestinationSquares[col];
      const colTokenSquares = tokenSquares[col];
      const currentX = col * tokenWidth;
      for (let row = game.getBoardHeight() - 1; row >= 0; row--) {
        if (colDestinationSquares[row] > 0 && colTokenSquares[row] !== null) {
          const distanceTravelled = colTotalDestinationSquares[row] * tokenDropFrame - colDestinationSquares[row];
          const currentY = distanceTravelled * tokenDropRate + colTokenSquares[row].row * tokenHeight;
          gameCtx.clearRect(currentX, currentY, tokenWidth, tokenHeight);
          colDestinationSquares[row] -= 1;
          const tokenImage = getTokenImage(colTokenSquares[row].name);
          gameCtx.drawImage(tokenImage, currentX, currentY + tokenDropRate, tokenWidth, tokenHeight);
          completed = false;
        }
      }
      const colGeneratedTokens = generatedTokens[col];
      const colGeneratedTokenDistance = generatedTokenDistance[col];
      const totalDistanceTravelled = colGeneratedTokenDistance.length * tokenDropFrame;
      for (let i = 0; i < colGeneratedTokens.length; i++) {
        if (colGeneratedTokenDistance[i] < totalDistanceTravelled) {
          const distanceTravelled = colGeneratedTokenDistance[i];
          const currentY = -(colGeneratedTokens.length - i) * tokenHeight + distanceTravelled * tokenDropRate;
          gameCtx.clearRect(currentX, currentY, tokenWidth, tokenHeight);
          colGeneratedTokenDistance[i] += 1;
          const tokenImage = getTokenImage(colGeneratedTokens[i].name);
          gameCtx.drawImage(tokenImage, currentX, currentY + tokenDropRate, tokenWidth, tokenHeight);
          completed = false;
        }
      }
    }
    if (!completed) {
      window.requestAnimationFrame(dropTokenAnimationStep)
    }
    else {
      for (let col = 0; col < game.getBoardWidth(); col++) {
        const colTotalDestinationSquares = totalDestinationSquares[col];
        for (let row = game.getBoardHeight() - 1; row >= 0; row--) {
          if (colTotalDestinationSquares[row] > 0) {
            const token = game.getToken(row, col);
            token.row = colTotalDestinationSquares[row] + row;
            game.setBoardSquare(token, colTotalDestinationSquares[row] + row, col);
          }
        }
        const colGeneratedTokens = generatedTokens[col];
        for (let i = 0; i < colGeneratedTokens.length; i++) {
          const token = colGeneratedTokens[i];
          token.row = i;
          token.col = col;
          game.setBoardSquare(token, i, col);
        }
      }
      actionCtx.clearRect(0, 0, actionCanvas.width, actionCanvas.height);
      const capturedTokens = game.findCapturedTokens();
      if (capturedTokens.length !== 0) {
        captureTokenAnimation(game);
      }
      else {
        actionCanvas.style.display = 'none';
      }
    }
  }
  window.requestAnimationFrame(dropTokenAnimationStep);
}

function captureTokenAnimation(game) {
  const gameCanvas = document.getElementById("gameboard-canvas");
  const gameCtx = gameCanvas.getContext("2d");
  const actionCanvas = document.getElementById('action-canvas');
  const actionCtx = actionCanvas.getContext('2d');
  let { left, right, top, bottom } = gameCanvas.getBoundingClientRect();
  const gameCanvasWidth = right - left;
  const gameCanvasHeight = bottom - top;
  const tokenWidth = gameCanvasWidth / game.getBoardWidth();
  const tokenHeight = gameCanvasHeight / game.getBoardHeight();
  const capturedTokens = game.findCapturedTokens();
  const quadrupletCapturedTokens = game.findQuadrupletCapturedTokens();
  const bombCapturedTokens = game.findBombCapturedTokens();
  console.log(bombCapturedTokens);
  for (const token of capturedTokens) {
    const { row, col } = token;
    game.captureToken(row, col);
    gameCtx.clearRect(col * tokenWidth, row * tokenHeight, tokenWidth, tokenHeight);
  }
  for (let j = 0; j < bombCapturedTokens.length; j++) {
    const tokenSet = bombCapturedTokens[j];
    let randToken = tokenSet[Math.floor(Math.random() * tokenSet.length)];
    let { row, col } = randToken;
    while (!game.isEmptySquare(row, col)) {
      randToken = tokenSet[Math.floor(Math.random() * tokenSet.length)];
      row = randToken.row;
      col = randToken.col;
    }
    const bombToken = new Token('carbon-bomb', row, col, false, true);
    game.setBoardSquare(bombToken, row, col);
    const tokenImage = getTokenImage(bombToken.name);
    gameCtx.drawImage(tokenImage, col * tokenWidth, row * tokenHeight, tokenWidth, tokenHeight);
  }
  for (let i = 0; i < quadrupletCapturedTokens.length; i++) {
    const tokenSet = quadrupletCapturedTokens[i];
    let randToken = tokenSet[Math.floor(Math.random() * tokenSet.length)];
    let { row, col } = randToken;
    while (!game.isEmptySquare(row, col)) {
      randToken = tokenSet[Math.floor(Math.random() * tokenSet.length)];
      row = randToken.row;
      col = randToken.col;
    }
    const specialToken = new Token(`special-${randToken.name}`, row, col, true, false);
    game.setBoardSquare(specialToken, row, col);
    const tokenImage = getTokenImage(specialToken.name);
    gameCtx.drawImage(tokenImage, col * tokenWidth, row * tokenHeight, tokenWidth, tokenHeight);
  }
  actionCtx.clearRect(0, 0, actionCanvas.width, actionCanvas.height);
  const sidebarScore = document.getElementById("sidebar-score");
  if (sidebarScore) {
    sidebarScore.innerHTML = `Score: ${game.getBoardScore()}`;
  }
  dropTokenAnimation(game);
}

function flipTokenAnimation(game, tokenImage0, row0, col0, tokenImage1, row1, col1) {
  const gameCanvas = document.getElementById("gameboard-canvas");
  const gameCtx = gameCanvas.getContext("2d");
  const actionCanvas = document.getElementById('action-canvas');
  const actionCtx = actionCanvas.getContext('2d');
  let { left, right, top, bottom } = gameCanvas.getBoundingClientRect();
  const gameCanvasWidth = right - left;
  const gameCanvasHeight = bottom - top;
  const tokenWidth = gameCanvasWidth / game.getBoardWidth();
  const tokenHeight = gameCanvasHeight / game.getBoardHeight();
  const token0row = row0 * tokenWidth;
  const token0col = col0 * tokenHeight;
  const token1col = col1 * tokenWidth;
  const token1row = row1 * tokenHeight;
  
  const numAnimationFrames = 10;
  const animationIncrementCol = (token1col - token0col) / numAnimationFrames;
  const animationIncrementRow = (token1row - token0row) / numAnimationFrames;

  actionCanvas.style.display = 'block';
  gameCtx.clearRect(token0col, token0row, tokenWidth, tokenHeight);
  gameCtx.clearRect(token1col, token1row, tokenWidth, tokenHeight);
  gameCtx.drawImage(tokenImage0, token0col, token0row, tokenWidth, tokenHeight);
  actionCtx.drawImage(tokenImage1, left + token1col, top + token1row, tokenWidth, tokenHeight);
  let prev0row = token0row;
  let prev0col = token0col;
  let prev1row = top + token1row;
  let prev1col = left + token1col;
  
  let next0row = token0row + animationIncrementRow;
  let next0col = token0col + animationIncrementCol;
  let next1row = top + token1row - animationIncrementRow;
  let next1col = left + token1col - animationIncrementCol;
  let numFrames = 0;
  function flipTokenAnimationStep() {
    if (numFrames >= numAnimationFrames) {
      gameCtx.drawImage(tokenImage1, prev1col - left, prev1row - top, tokenWidth, tokenHeight);
      actionCtx.clearRect(0, 0, actionCanvas.width, actionCanvas.height);
      captureTokenAnimation(game);
      return;
    }
    gameCtx.clearRect(prev0col, prev0row, tokenWidth, tokenHeight);
    actionCtx.clearRect(prev1col, prev1row, tokenWidth, tokenHeight);
    gameCtx.drawImage(tokenImage0, next0col, next0row, tokenWidth, tokenHeight);
    actionCtx.drawImage(tokenImage1, next1col, next1row, tokenWidth, tokenHeight);

    prev0row = next0row;
    prev0col = next0col;
    prev1row = next1row;
    prev1col = next1col;
    next0row += animationIncrementRow;
    next0col += animationIncrementCol;
    next1row -= animationIncrementRow;
    next1col -= animationIncrementCol;
    numFrames += 1;
    window.requestAnimationFrame(flipTokenAnimationStep);
  }
  window.requestAnimationFrame(flipTokenAnimationStep);
}

function bombTokenAnimation(game, bombToken, token) {
  const gameCanvas = document.getElementById("gameboard-canvas");
  const gameCtx = gameCanvas.getContext("2d");
  const tokens = game.getAllTokensOfType(token);
  console.log(tokens);
  let { left, right, top, bottom } = gameCanvas.getBoundingClientRect();
  const gameCanvasWidth = right - left;
  const gameCanvasHeight = bottom - top;
  const tokenWidth = gameCanvasWidth / game.getBoardWidth();
  const tokenHeight = gameCanvasHeight / game.getBoardHeight();
  for (const bombedToken of tokens) {
    const { row, col } = bombedToken;
    game.captureToken(row, col);
    gameCtx.clearRect(col * tokenWidth, row * tokenHeight, tokenWidth, tokenHeight);
  }
  game.captureToken(bombToken.row, bombToken.col);
  gameCtx.clearRect(bombToken.col * tokenWidth, bombToken.row * tokenHeight, tokenWidth, tokenHeight);
  const sidebarScore = document.getElementById("sidebar-score");
  if (sidebarScore) {
    sidebarScore.innerHTML = `Score: ${game.getBoardScore()}`;
  }
  dropTokenAnimation(game);
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
    gameCtx.drawImage(tokenImage, token.col * tokenWidth, token.row * tokenHeight, tokenWidth, tokenHeight);
    if (mouseUpEventListener !== null) {
      actionCanvas.removeEventListener('mouseup', mouseUpEventListener);
    }
    const { offsetX, offsetY } = e;
    if (offsetX >= left && offsetX <= left + gameCanvasWidth 
      && offsetY >= top && offsetY <= top + gameCanvasHeight)
    {
      const row1 = computeRow(game, gameCanvasHeight, offsetY - top);
      const col1 = computeCol(game, gameCanvasHeight, offsetX - left);
      if ((Math.abs(row1 - token.row) + Math.abs(col1 - token.col) === 1)) {
        const row0 = token.row;
        const col0 = token.col;
        const tokenName0 = token.name;
        const token1 = game.getToken(row1, col1);
        if (token.isBomb) {
          bombTokenAnimation(game, token, token1);
          actionCtx.clearRect(0, 0, actionCanvas.width, actionCanvas.height);
          actionCanvas.style.display = 'none';
          return;
        }
        else if (token1.isBomb) {
          bombTokenAnimation(game, token1, token);
          actionCtx.clearRect(0, 0, actionCanvas.width, actionCanvas.height);
          actionCanvas.style.display = 'none';
          return;
        }
        const tokenName1 = token1.name;
        const tokenImage0 = getTokenImage(tokenName0);
        const tokenImage1 = getTokenImage(tokenName1);
        game.flipTokens(token.row, token.col, row1, col1);
        const capturedTokens = game.findCapturedTokens();
        if (capturedTokens.length !== 0) {
          flipTokenAnimation(game, tokenImage0, row0, col0, tokenImage1, row1, col1);
        }
        else {
          game.flipTokens(row1, col1, row0, col0);
          actionCtx.clearRect(0, 0, actionCanvas.width, actionCanvas.height);
          actionCanvas.style.display = 'none';
        }
      }
      else {
        actionCtx.clearRect(0, 0, actionCanvas.width, actionCanvas.height);
        actionCanvas.style.display = 'none';
      }
    }
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

    gameCtx.clearRect(col * tokenWidth, row * tokenHeight, tokenWidth, tokenHeight);
    const token = game.getToken(row, col);
    const mouseX = left  + offsetX;
    const mouseY = top + offsetY;
    const tokenImage = getTokenImage(token.name);
    actionCanvas.style.display = 'block';
    const tokenMoveCallback = tokenMoveCallbackFactory(game, tokenImage, initialXOffset, initialYOffset, mouseX, mouseY);
    actionCanvas.addEventListener('mousemove', tokenMoveCallback);
    const tokenMouseUpCallback = tokenMouseUpCallbackFactory(game, token, tokenImage, tokenMoveCallback);
    actionCanvas.addEventListener('mouseup', tokenMouseUpCallback);
    mouseUpEventListener = tokenMouseUpCallback;
  }
  return tokenMouseDownCallback;
}


function Gameboard(props) {  
  const { game } = props;
  const firstUpdate = useRef(true);
  useLayoutEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
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
        let tokenImage = getTokenImage(token.name);
        gameCtx.drawImage(tokenImage, token.col * tokenWidth, token.row * tokenHeight, tokenWidth, tokenHeight);
      }
    }
    gameCanvas.addEventListener('mousedown', tokenMouseDownCallbackFactory(game));
  }, [game]);

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