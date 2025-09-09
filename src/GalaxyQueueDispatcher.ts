import type { GalaxyCommand } from "./GalaxyCommand.ts";
import type { GalaxyEntityBuilder } from "./GalaxyEntityBuilder.ts";
import type {
  ExecutionOptions,
  CommandExecutionResult
} from "../types/types.ts";

/**
 * GalaxyQueueDispatcher class for executing galaxy construction commands
 * Takes commands from MapParser and executes them with retry logic
 */
export class GalaxyQueueDispatcher {
  private readonly galaxyEntityBuilder: GalaxyEntityBuilder;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(
    galaxyEntityBuilder: GalaxyEntityBuilder,
    maxRetries: number = 3,
    retryDelay: number = 2500
  ) {
    this.galaxyEntityBuilder = galaxyEntityBuilder;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  async executeCommands(
    commands: GalaxyCommand[],
    options: ExecutionOptions = {}
  ): Promise<CommandExecutionResult[]> {
    const results: CommandExecutionResult[] = [];

    for (const command of commands) {
      let lastError: string | null = null;
      let commandResult: CommandExecutionResult | null = null;
      
      for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
        try {
          const result = await command.execute(this.galaxyEntityBuilder);
          
          if (result.success) {
            console.log(`✅ SUCCESS: ${command.getDescription()} - Status: ${result.status}`);
            commandResult = { success: true, shouldAbort: false, result };
            break;
          }
          
          lastError = result.error || `Command failed with status ${result.status}`;
          
        } catch (error: any) {
          lastError = `Execution error: ${error.message}`;
        }
        
        if (attempt < this.maxRetries) {
          console.log(`🔄 RETRY ${attempt}/${this.maxRetries}: ${command.getDescription()} - ${lastError}`);
          await this._delay(this.retryDelay * Math.pow(2, attempt - 1));
        }
      }
      
      if (!commandResult) {
        commandResult = {
          success: false,
          shouldAbort: true,
          error: `Command failed after ${this.maxRetries} attempts. Last error: ${lastError}. Stopping command queue.`
        };
      }
      
      results.push(commandResult);
      
      if (commandResult.shouldAbort) {
        break;
      }
    }

    return results;
  }

  /**
   * Utility method to add delay between operations
   */
  private async _delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
