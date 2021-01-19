 /**
 * A token is a tile object associated with an asset. 
 */
export class Token {
  constructor(name, row, col, isSpecial) {
    this.name = name;
    this.value = 1;
    this.path = `./assets/${name}.png`;
    this.row = row;
    this.col = col;
    this.isSpecial = isSpecial;
  }
}

export const DEFAULT_TOKENS = {
  regularTokens: [
    'carbon-dioxide',
    'nitrous-oxide',
    'hydrogen-dioxide',
    'ozone',
    'dichlorodifluoromethane',
    'methane'
  ]
};

