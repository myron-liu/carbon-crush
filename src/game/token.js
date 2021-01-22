 /**
 * A token is a tile object associated with an asset. 
 */

 const TOKEN_TO_VALUE_MAP = {
  'carbon-dioxide': 1,
  'methane': 2,
  'nitrous-oxide': 4,
  'pfc': 8,
  'cfc': 9,
  'sulfur-hexafluoride': 10,
  'special-carbon-dioxide': 2,
  'special-methane': 4,
  'special-nitrous-oxide': 8,
  'special-pfc': 16,
  'special-cfc': 18,
  'special-sulfur-hexafluoride': 20,
  'carbon-bomb': 100,
 };

export class Token {
  constructor(name, row, col, isSpecial, isBomb) {
    this.name = name;
    this.value = TOKEN_TO_VALUE_MAP[name];
    this.path = `./assets/${name}.png`;
    this.row = row;
    this.col = col;
    this.isSpecial = isSpecial;
    this.isBomb = isBomb;
  }
};

export const DEFAULT_TOKENS = {
  regularTokens: [
    'carbon-dioxide',
    'nitrous-oxide',
    'pfc',
    'cfc',
    'sulfur-hexafluoride',
    'methane'
  ]
};

