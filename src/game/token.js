 /**
 * A token is a tile object associated with an asset. 
 */
export class Token {
  constructor(name, value, row, col) {
    this.name = name;
    this.value = value;
    this.path = `./assets/${name}.png`;
    this.row = row;
    this.col = col;
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

