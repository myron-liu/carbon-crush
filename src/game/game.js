import { DEFAULT_TOKENS, Token } from './token.js';

/**
 * Game is the coordinator for the gameboard and scoreboard. A gameboard is an array of arrays.
 * The gameboard can be a size between 8 to 12. The default size is a 10 x 10 board.
 *
 * Each square contains exactly one greenhouse gas.
 * Each square is identified by its row and column, numbered from 0 to
 * size-1.  Square [0,0] is in the upper-left corner of the carbon-board.
 * Rows are numbered downward, and columns are numbered to the right.
 * The carbon type on each square is random.
 * 
 */

/** Constants */
const MIN_BOARD_WIDTH = 8;
const MIN_BOARD_HEIGHT = 8;
const MAX_BOARD_WIDTH = 12;
const MAX_BOARD_HEIGHT = 12;
export const DEFAULT_WIDTH = 9;
export const DEFAULT_HEIGHT = 9;

 /** Precondition functions */
function boardConstructorPreconditions(width, height) {
  if (width < MIN_BOARD_WIDTH) {
    throw new Error(`Min width of board is ${MIN_BOARD_WIDTH}, got width: ${width}`);
  }
  else if (height < MIN_BOARD_HEIGHT) {
    throw new Error(`Min height of board is ${MIN_BOARD_HEIGHT}, got height: ${height}`);
  }
  else if (width > MAX_BOARD_WIDTH) {
    throw new Error(`Max width of board is ${MAX_BOARD_WIDTH}, got width: ${width}`);
  }
  else if (height > MAX_BOARD_HEIGHT) {
    throw new Error(`Max height of board is ${MAX_BOARD_HEIGHT}, got height: ${height}`);
  }
}

export class Game {
  constructor(width, height, tokenSet) {
    try {
      boardConstructorPreconditions(width, height);
    }
    catch (err) {
      console.error(err);
    }
    this.boardWidth = width;
    this.boardHeight = height;
    this.boardScore = 0;
    this.boardSquares = new Array(this.boardHeight);
    this.tokenSet = tokenSet;

    // initialize an empty board
    for (let row = 0; row < this.boardHeight; row++) {
      this.boardSquares[row] = new Array(this.boardWidth);
      for (let col = 0; col < this.boardWidth; col++) {
        this.boardSquares[row][col] = null;
      }
    }
    this.refillTokens();
    // capture tokens if there available options 
    // we want to generate a game state that doesn't have automatic captures
    let hasCapturedTokens = this.captureTokens(false);
    while (hasCapturedTokens) {
      this.refillTokens();
      hasCapturedTokens = this.captureTokens(false);
    }
  }

  /**
   * Returns the gameboard.
   * @returns Array<Array<Token>>
   */
  getBoardSquares() {
    return this.boardSquares;
  }

  /**
   * Returns the gameboard width.
   * @returns number
   */
  getBoardWidth() {
    return this.boardWidth;
  }

  /**
   * Returns the gameboard height.
   * @returns number
   */
  getBoardHeight() {
    return this.boardHeight;
  }

  /**
   * Returns the gameboard score.
   * @returns number
   */
  getBoardScore() {
    return this.boardScore;
  }


  /**
   * Returns true if the row and column identify a valid square on the board.
   * @param {*number} row - row value (indexed from 0 - starting from top left going right)
   * @param {*number} col - column value (indexed from 0 - starting from top left going down)
   * @returns boolean
   */
  isValidLocation(row, col) {
    return row >= 0 && col >= 0 && row < this.boardHeight && col < this.boardWidth;
  }

  /**
   * Returns true if the square corresponding to row and column location is empty 
   * @param {*number} row - row value (indexed from 0 - starting from top left going right)
   * @param {*number} col - column value (indexed from 0 - starting from top left going down)
   * @returns boolean
   */
  isEmptySquare(row, col) {
    if (!this.isValidLocation(row, col)) {
      throw new Error(`Invalid location, got row: ${row}, col: ${col}`);
    }
    return this.boardSquares[row][col] === null;
  }

  /**
   * Returns the token corresponding to row and column if it is a valid square on the board.
   * @param {*number} row - row value (indexed from 0 - starting from top left going right)
   * @param {*number} col - column value (indexed from 0 - starting from top left going down)
   * @returns Token object or null
   */
  getToken(row, col) {
    if (!this.isValidLocation(row, col)) {
      throw new Error(`Invalid location, got row: ${row}, col: ${col}`);
    }
    return this.boardSquares[row][col];
  }

  isValidMove(x0, y0, x1, y1) {
    const isValidDistance = Math.abs(x1 - x0) <= 1 && Math.abs(y1 - y0) <= 1;
    const isValidLocation = this.isValidLocation(y0, x0) && this.isValidLocation(y1, x1);
    return isValidDistance && isValidLocation;
  }

  flipTokens(x0, y0, x1, y1) {
    if (this.isValidMove(x0, y0, x1, y1)) {
      let token0 = this.getToken(y0, x0);
      let token1 = this.getToken(y1, x1)
      this.boardSquares[y0][x0] = token1;
      this.boardSquares[y1][x1] = token0;
      if (token1) {
        token1.x = x0;
        token1.y = y0;
      }
      if (token0) {
        token0.x = x1;
        token0.y = y1;
      }
      return true;
    }
    return false;
  }

  captureTokens(shouldScore) {
    const tokens = this.findCapturedTokens();
    if (tokens.length === 0) {
      return false;
    }
    for (const token of tokens) {
      // May need to save board state
      this.boardSquares[token.row][token.col] = null;
      if (shouldScore) {
        this.boardScore += token.value;
      }
    }
    return true;
  }

  refillTokens() {
    for (let row = 0; row < this.boardHeight; row++) {
      for (let col = 0; col < this.boardWidth; col++) {
        if (this.isEmptySquare(row, col)) {
          this.boardSquares[row][col] = this.spawnToken(row, col);
        }
      }
    }
  }

  spawnToken(row, col) {
    const { regularTokens } = this.tokenSet;
    const tokenName = regularTokens[Math.floor(Math.random() * regularTokens.length)];
    return new Token(tokenName, 1, row, col);
  }

  findCapturedTokens() {
    const tokens = [];
    for (let row = 0; row < this.boardHeight; row++) {
      for (let col = 0; col < this.boardWidth; col++) {
        let token = this.getToken(row, col);
        if (this.detectCapture(token)) {
          tokens.push(token);
        }
      }
    }
    return tokens;
  }

  detectCapture(token) {
    const { row, col, name } = token;

    // check left side and second left side
    if (this.detectTriplet(row, col - 1, row, col - 2, name)) {
      return true;
    }
    // check left side and right side
    if (this.detectTriplet(row, col - 1, row, col + 1, name)) {
      return true;
    }
    // check right side and second right side
    if (this.detectTriplet(row, col + 1, row, col + 2, name)) {
      return true;
    }
    // check up side and second up side
    if (this.detectTriplet(row - 1, col, row - 2, col, name)) {
      return true;
    }
    // check up side and down side
    if (this.detectTriplet(row - 1, col, row + 1, col, name)) {
      return true;
    }
    // check down side and second down side
    if (this.detectTriplet(row - 1, col, row - 2, col, name)) {
      return true;
    }
    return false;
  }


  detectTriplet(firstRow, firstCol, secondRow, secondCol, name) {
    if (this.isValidLocation(firstRow, firstCol) && this.isValidLocation(secondRow, secondCol)) {
      const firstToken = this.getToken(firstRow, firstCol);
      const secondToken = this.getToken(secondRow, secondCol);
      if (firstToken.name === name && secondToken.name === name) {
        return true;
      }
    }
    return false;
  }
}
