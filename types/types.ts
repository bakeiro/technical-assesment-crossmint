// Cell types for the galaxy map
export type CellType = 
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

// Galaxy map as 2D matrix of cells
export type GalaxyMap = CellType[][];

// Map size structure
export interface MapSize {
  rows: number;
  columns: number;
}

// Map data structure
export interface MapData {
  description: string;
  size: MapSize;
  map: GalaxyMap;
}

// Collection of maps from maps.json
export interface MapsCollection {
  map1: MapData;
  map2: MapData;
}

// Entity mapping structure for MapParser
export interface EntityMapping {
  entity: "polyanet" | "soloon" | "cometh";
  params: Record<string, string>;
}

export type EntityMappings = Record<string, EntityMapping>;

// Command types
export type CommandType = "create" | "delete";
export type EntityType = "polyanet" | "soloon" | "cometh";

export interface CommandParams {
  [key: string]: string;
}

// API response structure
export interface ExecutionResult {
  success: boolean;
  data?: any;
  status?: number;
  headers?: any;
  error?: any;
  message?: string;
}

// HTTP method types for GalaxyEntityBuilder
export type HttpMethod = "post" | "delete";

// Soloon and Cometh specific types
export type SoloonColor = "blue" | "red" | "purple" | "white";
export type ComethDirection = "up" | "down" | "left" | "right";

export interface SoloonParams {
  color: SoloonColor;
}

export interface ComethParams {
  direction: ComethDirection;
}

// API request structure
export interface RequestData {
  candidateId: string;
  row: number;
  column: number;
  [key: string]: any;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  status?: number;
  headers?: any;
  error?: any;
  message?: string;
}

// Queue dispatcher types
export interface ExecutionOptions {
  mockCalls?: boolean;
}

export interface CommandExecutionResult {
  success: boolean;
  shouldAbort: boolean;
  result?: any;
  error?: string;
}
