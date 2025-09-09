import type { GalaxyEntityBuilder } from "./GalaxyEntityBuilder.ts";
import type {
  CommandType,
  EntityType,
  CommandParams,
  ExecutionResult
} from "../types/types.ts";

/**
 * GalaxyCommand class representing a single command to execute in the galaxy
 * Encapsulates command logic, validation, and execution
 */
export class GalaxyCommand {
  public readonly type: CommandType;
  public readonly entity: EntityType;
  public readonly row: number;
  public readonly column: number;
  public readonly params: CommandParams;

  constructor(
    type: CommandType,
    entity: EntityType,
    row: number,
    column: number,
    params: CommandParams = {}
  ) {
    this.type = type;
    this.entity = entity;
    this.row = row;
    this.column = column;
    this.params = params;
  }

  /**
   * Gets a human-readable description of the command
   */
  getDescription(): string {
    return `${this.type.toUpperCase()} ${this.entity} at (${this.row}, ${this.column})`;
  }

  /**
   * Executes the command using the provided GalaxyEntityBuilder
   */
  async execute(galaxyEntityBuilder: GalaxyEntityBuilder): Promise<ExecutionResult> {
    const entityName = this.entity.charAt(0).toUpperCase() + this.entity.slice(1);
    const methodName = `${this.type}${entityName}` as keyof GalaxyEntityBuilder;

    const method = galaxyEntityBuilder[methodName];
    if (typeof method !== 'function') {
      throw new Error(`Method ${methodName} not found on GalaxyEntityBuilder`);
    }

    return await (method as Function).call(
      galaxyEntityBuilder,
      this.row,
      this.column,
      this.params,
    );
  }
}
