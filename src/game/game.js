import { Token } from './token.js';

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
    while (this.findCapturedTokens().length !== 0) {
      this.captureTokens(false);
      this.refillTokens();
    }
  }

  /**
   * Returns the gameboard.
   * @returns Array<Array<Token>>
   */
  getBoardSquares() {
    return this.boardSquares;
  }

  setBoardSquare(token, row, col) {
    if (!this.isValidLocation(row, col)) {
      throw new Error(`Invalid location, got row: ${row}, col: ${col}`);
    }
    this.boardSquares[row][col] = token;
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

  setBoardScore(score) {
    this.boardScore = 0;
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

    /**
   * Returns the token corresponding to row and column if it is a valid square on the board.
   * @param {*number} row - row value (indexed from 0 - starting from top left going right)
   * @param {*number} col - column value (indexed from 0 - starting from top left going down)
   * @returns Token object or null
   */
  captureToken(row, col) {
    if (!this.isValidLocation(row, col)) {
      throw new Error(`Invalid location, got row: ${row}, col: ${col}`);
    }
    this.boardScore += this.boardSquares[row][col].value;
    this.boardSquares[row][col] = null;
  }


  isValidMove(x0, y0, x1, y1) {
    const isValidDistance = Math.abs(x1 - x0) <= 1 && Math.abs(y1 - y0) <= 1;
    const isValidLocation = this.isValidLocation(y0, x0) && this.isValidLocation(y1, x1);
    return isValidDistance && isValidLocation;
  }

  flipTokens(row0, col0, row1, col1) {
    if (this.isValidMove(row0, col0, row1, col1)) {
      let token0 = this.getToken(row0, col0);
      let token1 = this.getToken(row1, col1)
      this.boardSquares[row0][col0] = token1;
      this.boardSquares[row1][col1] = token0;
      if (token1) {
        token1.row = row0;
        token1.col = col0;
      }
      if (token0) {
        token0.row = row1;
        token0.col = col1;
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
    return new Token(tokenName, row, col, false, false);
  }

  generateToken() {
    const { regularTokens } = this.tokenSet;
    const tokenName = regularTokens[Math.floor(Math.random() * regularTokens.length)];
    return new Token(tokenName, null, null, false, false);
  }

  findCapturedTokens() {
    const tokens = new Set();
    for (let row = 0; row < this.boardHeight; row++) {
      for (let col = 0; col < this.boardWidth; col++) {
        let token = this.getToken(row, col);
        if (this.detectCapture(token)) {
          tokens.add(token);
          if (token.isSpecial) {
            for (let x = 0; x < this.boardWidth; x++) {
              token = this.getToken(row, x);
              tokens.add(token);
            }
          }
        }
      }
    }
    return Array.from(tokens);
  }

  findQuadrupletCapturedTokens() {
    const tokens = [];
    for (let row = 0; row < this.boardHeight; row++) {
      for (let col = 0; col < this.boardWidth; col++) {
        let token = this.getToken(row, col);
        const specialTokens = this.detectQuadrupletCapture(token);
        if (specialTokens.length > 0) {
          specialTokens.forEach(t => tokens.push(t));
        }
      }
    }
    return tokens;
  }

  detectQuadrupletCapture(token) {
    const { row, col, name } = token;
    const tokenSet = [];
    
    const leftToken = this.isValidLocation(row, col - 1) ? this.getToken(row, col - 1) : null;
    const rightToken = this.isValidLocation(row, col + 1) ? this.getToken(row, col + 1) : null;
    const secondRightToken = this.isValidLocation(row, col + 2) ? this.getToken(row, col + 2) : null;
    const thirdRightToken = this.isValidLocation(row, col + 3) ? this.getToken(row, col + 3) : null;
    const fourthRightToken = this.isValidLocation(row, col + 4) ? this.getToken(row, col + 4) : null;

    const rightTokenMatch = rightToken !== null && this.isTokenMatch(name, rightToken.name);
    const secondRightTokenMatch = secondRightToken !== null && this.isTokenMatch(name, secondRightToken.name);
    const thirdRightTokenMatch = thirdRightToken !== null && this.isTokenMatch(name, thirdRightToken.name);
    const fourthRightTokenMatch = fourthRightToken !== null && this.isTokenMatch(name, fourthRightToken.name);

    const hasLeft = leftToken !== null && this.isTokenMatch(name, leftToken.name);
    const hasHorizontalQuadruplet = rightTokenMatch && secondRightTokenMatch && thirdRightTokenMatch && !fourthRightTokenMatch;

    if (!hasLeft && hasHorizontalQuadruplet) {
      tokenSet.push([token, rightToken, secondRightToken, thirdRightToken]);
    }

    const topToken = this.isValidLocation(row - 1, col) ? this.getToken(row - 1, col) : null;
    const bottomToken = this.isValidLocation(row + 1, col) ? this.getToken(row + 1, col) : null;
    const secondBottomToken = this.isValidLocation(row + 2, col) ? this.getToken(row + 2, col) : null;
    const thirdBottomToken = this.isValidLocation(row + 3, col) ? this.getToken(row + 3, col) : null;
    const fourthBottomToken = this.isValidLocation(row + 4, col) ? this.getToken(row + 4, col) : null;

    const bottomTokenMatch = bottomToken !== null && this.isTokenMatch(name, bottomToken.name);
    const secondBottomTokenMatch = secondBottomToken !== null && this.isTokenMatch(name, secondBottomToken.name);
    const thirdBottomTokenMatch = thirdBottomToken !== null && this.isTokenMatch(name, thirdBottomToken.name);
    const fourthBottomTokenMatch = fourthBottomToken !== null && this.isTokenMatch(name, fourthBottomToken.name);

    const hasTop = topToken !== null && this.isTokenMatch(name, topToken.name);
    const hasVerticalQuadruplet = bottomTokenMatch && secondBottomTokenMatch && thirdBottomTokenMatch && !fourthBottomTokenMatch;

    if (!hasTop && hasVerticalQuadruplet) {
      tokenSet.push([token, bottomToken, secondBottomToken, thirdBottomToken]);
    }
    return tokenSet;
  }

  getAllTokensOfType(token) {
    const tokens = new Set();
    for (let row = 0; row < this.boardHeight; row++) {
      for (let col = 0; col < this.boardWidth; col++) {
        const secondToken = this.getToken(row, col);
        const { name } = secondToken;
        if (this.isTokenMatch(token.name, name) || token.isBomb) {
          tokens.add(secondToken);
          if (secondToken.isSpecial) {
            for (let x = 0; x < this.boardWidth; x++) {
              const nextToken = this.getToken(row, x);
              tokens.add(nextToken);
            }
          }
        }
      }
    }
    return Array.from(tokens);
  }

  findBombCapturedTokens() {
    const tokens = [];
    for (let row = 0; row < this.boardHeight; row++) {
      for (let col = 0; col < this.boardWidth; col++) {
        let token = this.getToken(row, col);
        const bombTokens = this.detectQuintupletCapture(token);
        if (bombTokens.length > 0) {
          bombTokens.forEach(t => tokens.push(t));
        }
      }
    }
    return tokens;
  }

  detectQuintupletCapture(token) {
    const { row, col, name } = token;
    const tokenSet = [];
    
    const leftToken = this.isValidLocation(row, col - 1) ? this.getToken(row, col - 1) : null;
    const rightToken = this.isValidLocation(row, col + 1) ? this.getToken(row, col + 1) : null;
    const secondRightToken = this.isValidLocation(row, col + 2) ? this.getToken(row, col + 2) : null;
    const thirdRightToken = this.isValidLocation(row, col + 3) ? this.getToken(row, col + 3) : null;
    const fourthRightToken = this.isValidLocation(row, col + 4) ? this.getToken(row, col + 4) : null;
    const fifthRightToken = this.isValidLocation(row, col + 5) ? this.getToken(row, col + 5) : null;
    const sixthRightToken = this.isValidLocation(row, col + 6) ? this.getToken(row, col + 6) : null;
    const seventhRightToken = this.isValidLocation(row, col + 7) ? this.getToken(row, col + 7) : null;

    const rightTokenMatch = rightToken !== null && this.isTokenMatch(name, rightToken.name);
    const secondRightTokenMatch = secondRightToken !== null && this.isTokenMatch(name, secondRightToken.name);
    const thirdRightTokenMatch = thirdRightToken !== null && this.isTokenMatch(name, thirdRightToken.name);
    const fourthRightTokenMatch = fourthRightToken !== null && this.isTokenMatch(name, fourthRightToken.name);
    const fifthRightTokenMatch = fifthRightToken !== null && this.isTokenMatch(name, fifthRightToken.name);
    const sixthRightTokenMatch = sixthRightToken !== null && this.isTokenMatch(name, sixthRightToken.name);
    const seventhRightTokenMatch = seventhRightToken !== null && this.isTokenMatch(name, seventhRightToken.name);

    const hasLeft = leftToken !== null && this.isTokenMatch(name, leftToken.name);
    const hasHorizontalQuintuple = rightTokenMatch && secondRightTokenMatch && thirdRightTokenMatch && fourthRightTokenMatch;

    if (!hasLeft && hasHorizontalQuintuple) {
      const horizontalTokens = [token, rightToken, secondRightToken, thirdRightToken, fourthRightToken];
      if (fifthRightTokenMatch) {
        horizontalTokens.push(fifthRightToken);
      }
      if (sixthRightTokenMatch) {
        horizontalTokens.push(sixthRightToken)
      }
      if (seventhRightTokenMatch) {
        horizontalTokens.push(seventhRightToken);
      }
      tokenSet.push(horizontalTokens);
    }

    const topToken = this.isValidLocation(row - 1, col) ? this.getToken(row - 1, col) : null;
    const bottomToken = this.isValidLocation(row + 1, col) ? this.getToken(row + 1, col) : null;
    const secondBottomToken = this.isValidLocation(row + 2, col) ? this.getToken(row + 2, col) : null;
    const thirdBottomToken = this.isValidLocation(row + 3, col) ? this.getToken(row + 3, col) : null;
    const fourthBottomToken = this.isValidLocation(row + 4, col) ? this.getToken(row + 4, col) : null;
    const fifthBottomToken = this.isValidLocation(row + 5, col) ? this.getToken(row + 5, col) : null;
    const sixthBottomToken = this.isValidLocation(row + 6, col) ? this.getToken(row + 6, col) : null;
    const seventhBottomToken = this.isValidLocation(row + 7, col) ? this.getToken(row + 7, col) : null;

    const bottomTokenMatch = bottomToken !== null && this.isTokenMatch(name, bottomToken.name);
    const secondBottomTokenMatch = secondBottomToken !== null && this.isTokenMatch(name, secondBottomToken.name);
    const thirdBottomTokenMatch = thirdBottomToken !== null && this.isTokenMatch(name, thirdBottomToken.name);
    const fourthBottomTokenMatch = fourthBottomToken !== null && this.isTokenMatch(name, fourthBottomToken.name);
    const fifthBottomTokenMatch = fifthBottomToken !== null && this.isTokenMatch(name, fifthBottomToken.name);
    const sixthBottomTokenMatch = sixthBottomToken !== null && this.isTokenMatch(name, sixthBottomToken.name);
    const seventhBottomTokenMatch = seventhBottomToken !== null && this.isTokenMatch(name, seventhBottomToken.name);

    const hasTop = topToken !== null && this.isTokenMatch(name, topToken.name);
    const hasVerticalQuintuple = bottomTokenMatch && secondBottomTokenMatch && thirdBottomTokenMatch && fourthBottomTokenMatch;

    if (!hasTop && hasVerticalQuintuple) {
      const verticalTokens = [token, bottomToken, secondBottomToken, thirdBottomToken, fourthBottomToken];
      if (fifthBottomTokenMatch) {
        verticalTokens.push(fifthBottomToken);
      }
      if (sixthBottomTokenMatch) {
        verticalTokens.push(sixthBottomToken)
      }
      if (seventhBottomTokenMatch) {
        verticalTokens.push(seventhBottomToken);
      }
      tokenSet.push(verticalTokens);
    }
    return tokenSet;
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
    if (this.detectTriplet(row + 1, col, row + 2, col, name)) {
      return true;
    }
    return false;
  }


  detectTriplet(firstRow, firstCol, secondRow, secondCol, name) {
    if (this.isValidLocation(firstRow, firstCol) && this.isValidLocation(secondRow, secondCol)) {
      const firstToken = this.getToken(firstRow, firstCol);
      const secondToken = this.getToken(secondRow, secondCol);
      if (this.isTokenMatch(name, firstToken.name) && this.isTokenMatch(name, secondToken.name)) {
        return true;
      }
    }
    return false;
  }

  isTokenMatch(name, secondName) {
    return name === secondName || `special-${name}` == secondName || name === `special-${secondName}`;
  }
}
