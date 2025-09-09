# Small API Project (Overview)

A Deno project that builds a "galaxy map" by interacting with an API. Starting from a map (JSON), the system analyzes it, generates construction commands (create/delete cosmic entities) and executes them with retry handling.

## Deno in this project
- Requires Deno installed: https://deno.land/
- No dependency installation needed: Deno resolves them on-the-fly
- Direct execution:
```bash
deno run -A main.js
```

## Project structure
```
small-api-project/
├── main.js                          
├── deno.json                        
├── data/
│   └── maps.json                    
├── src/
│   ├── MapParser.ts                 
│   ├── GalaxyCommand.ts             
│   ├── GalaxyEntityBuilder.ts       
│   └── GalaxyQueueDispatcher.ts     
└── README.md
```

## Class map (high level)
```
 maps.json  ->  MapParser  ->  GalaxyQueueDispatcher  ->  GalaxyCommand[]  ->  GalaxyEntityBuilder (HTTP API)
                                      |                           ^
                                      └─────────── execute() ─────┘
```
- `MapParser` transforms the map (2D matrix of cells) into a list of typed commands.
- `GalaxyCommand` encapsulates an action (create/delete) on an entity and knows how to execute itself with a builder.
- `GalaxyQueueDispatcher` executes the command list with retries and exponential backoff.
- `GalaxyEntityBuilder` makes HTTP calls to the API (create/delete polyanets, soloons and comeths).

## Quick reference of classes and public methods

### MapParser
Responsible for: validating, visualizing and translating maps to commands.
- `parseMapData(mapData, cleanMap = false): GalaxyCommand[]`
  - Validates the map and transforms it into `create` commands (or `delete`).
- `visualizeMap(map): string`
  - Returns an ASCII representation of the map for quick inspection.

### GalaxyCommand
Responsible for: representing a self-contained command.
- `getDescription(): string`
  - Returns a human-readable description (e.g., `CREATE soloon at (r, c)`).
- `execute(galaxyEntityBuilder): Promise<ExecutionResult>`
  - Dynamically invokes the appropriate method (`create|delete + Entity`) on the `GalaxyEntityBuilder`.

### GalaxyEntityBuilder
Responsible for: making HTTP calls to the API for entities.
- `createPolyanet(row, column, additionalData?)`
- `deletePolyanet(row, column, additionalData?)`
- `createSoloon(row, column, { color }, additionalData?)`  — valid colors: `blue | red | purple | white`
- `deleteSoloon(row, column, additionalData?)`
- `createCometh(row, column, { direction }, additionalData?)` — valid directions: `up | down | left | right`
- `deleteCometh(row, column, additionalData?)`

### GalaxyQueueDispatcher
Responsible for: executing the command queue with retries in case they fail.
- `executeCommands(commands, options?): Promise<CommandExecutionResult[]>`
  - Executes commands in order; applies retries (default 3) with backoff and aborts on persistent failure.

## Dependencies
- HTTP client: `axios` (import map configured in `deno.json`).
- Data sanitization: `sanitize-html` (used to remove css/html/js from responses).
