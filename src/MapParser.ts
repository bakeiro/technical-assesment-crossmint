import { GalaxyCommand } from "./GalaxyCommand.ts";

// Types
type CellType = 
  | null 
  | undefined 
  | "SPACE"
  | "POLYANET" 
  | "BLUE_SOLOON" 
  | "RED_SOLOON" 
  | "PURPLE_SOLOON" 
  | "WHITE_SOLOON"
  | "UP_COMETH" 
  | "DOWN_COMETH" 
  | "LEFT_COMETH" 
  | "RIGHT_COMETH";

type GalaxyMap = CellType[][];

interface MapData {
  description: string;
  size: {
    rows: number;
    columns: number;
  };
  map: GalaxyMap;
}

interface EntityMapping {
  entity: "polyanet" | "soloon" | "cometh";
  params: Record<string, string>;
}

type EntityMappings = Record<string, EntityMapping>;

const CELL_TO_ASCII: Record<string, string> = {
  "null": ".",
  "undefined": ".",
  "SPACE": ".",

  "POLYANET": "o",

  "BLUE_SOLOON": "*",
  "RED_SOLOON": "*",
  "PURPLE_SOLOON": "*",
  "WHITE_SOLOON": "*",

  "UP_COMETH": "↑",
  "DOWN_COMETH": "↓",
  "LEFT_COMETH": "←",
  "RIGHT_COMETH": "→",
};

/**
 * MapParser class for translating galaxy maps into executable commands
 * Takes a map representation and converts it into structured commands
 */
export class MapParser {
  private readonly entityMapping: EntityMappings;

  constructor() {
    this.entityMapping = {
      "POLYANET": { entity: "polyanet", params: {} },

      "BLUE_SOLOON": { entity: "soloon", params: { color: "blue" } },
      "RED_SOLOON": { entity: "soloon", params: { color: "red" } },
      "PURPLE_SOLOON": { entity: "soloon", params: { color: "purple" } },
      "WHITE_SOLOON": { entity: "soloon", params: { color: "white" } },

      "UP_COMETH": { entity: "cometh", params: { direction: "up" } },
      "DOWN_COMETH": { entity: "cometh", params: { direction: "down" } },
      "LEFT_COMETH": { entity: "cometh", params: { direction: "left" } },
      "RIGHT_COMETH": { entity: "cometh", params: { direction: "right" } },
    };
  }

  /**
   * Loads and parses a map from JSON data
   */
  parseMapData(mapData: MapData, cleanMap: boolean = false): GalaxyCommand[] {
    if (!mapData || !mapData.map) {
      throw new Error('Map data must contain a "map" property');
    }

    if (!this._isValidMap(mapData.map)) {
      throw new Error("Invalid map format provided");
    }

    return this._transferMapToCommands(mapData.map, cleanMap);
  }

  /**
   * Visualizes a map using ASCII characters
   */
  visualizeMap(map: GalaxyMap): string {
    if (!map || !Array.isArray(map) || map.length === 0) {
      return "Empty or invalid map";
    }

    let visualization = "";

    for (let row = 0; row < map.length; row++) {
      let rowDisplay = `${row.toString().padStart(2)}: `;

      for (let column = 0; column < map[row].length; column++) {
        const cell = map[row][column];        
        rowDisplay += CELL_TO_ASCII[String(cell)] || '?' + " ";
      }

      visualization += rowDisplay + "\n";
    }

    return visualization;
  }

  /**
   * Transforms a galaxy map into an array of commands
   */
  private _transferMapToCommands(map: GalaxyMap, cleanMap: boolean): GalaxyCommand[] {
    const commands: GalaxyCommand[] = [];

    for (let row = 0; row < map.length; row++) {
      for (let column = 0; column < map[row].length; column++) {
        const cell = map[row][column];

        if (cell === null || cell === undefined || cell === "SPACE") {
          continue;
        }

        const mapping = this.entityMapping[cell];

        if (mapping) {
          let command = new GalaxyCommand("create", mapping.entity, row, column, { ...mapping.params });
          if (cleanMap) {
            command = new GalaxyCommand("delete", mapping.entity, row, column);
          }

          commands.push(command);
        }
      }
    }

    return commands;
  }

  /**
   * Validates if a map format is supported and follows business rules
   */
  private _isValidMap(map: GalaxyMap): boolean {
    if (!Array.isArray(map)) {
      console.error("Map must be an array");
      return false;
    }

    if (map.length === 0) {
      console.error("Map cannot be empty");
      return false;
    }

    const expectedLength = map[0].length;
    for (let i = 0; i < map.length; i++) {
      if (!Array.isArray(map[i])) {
        console.error(`Row ${i} is not an array`);
        return false;
      }
      if (map[i].length !== expectedLength) {
        console.error(
          `Row ${i} has incorrect length. Expected ${expectedLength}, got ${
            map[i].length
          }`,
        );
        return false;
      }
    }

    return this._validateBusinessRules(map);
  }

  /**
   * Validates business rules for galaxy entities
   */
  private _validateBusinessRules(map: GalaxyMap): boolean {
    for (let row = 0; row < map.length; row++) {
      for (let column = 0; column < map[row].length; column++) {
        const cell = map[row][column];

        if (cell && cell !== "SPACE" && cell.startsWith("SOLOON_")) {
          if (!this._hasSoloonAdjacentPolyanet(map, row, column)) {
            console.error(
              `❌ VALIDATION ERROR: Soloon at position (${row}, ${column}) is not adjacent to any Polyanet.`,
            );
            console.error(
              "   Business rule: Soloons can only be adjacent to a Polyanet.",
            );
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Checks if a Soloon has at least one adjacent Polyanet (horizontally or vertically)
   */
  private _hasSoloonAdjacentPolyanet(map: GalaxyMap, row: number, column: number): boolean {
    const directions: [number, number][] = [
      [-1, 0], // up
      [1, 0], // down
      [0, -1], // left
      [0, 1], // right
    ];

    for (const [deltaRow, deltaCol] of directions) {
      const newRow = row + deltaRow;
      const newCol = column + deltaCol;

      if (
        newRow >= 0 && newRow < map.length &&
        newCol >= 0 && newCol < map[0].length
      ) {
        const adjacentCell = map[newRow][newCol];
        if (adjacentCell === "POLYANET") {
          return true;
        }
      }
    }

    return false;
  }
}
