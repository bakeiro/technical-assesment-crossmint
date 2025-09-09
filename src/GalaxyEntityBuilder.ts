import sanitizer from "sanitize-html";
import axios from "axios";

// Types
type HttpMethod = "post" | "delete";

type SoloonColor = "blue" | "red" | "purple" | "white";
type ComethDirection = "up" | "down" | "left" | "right";

interface RequestData {
  candidateId: string;
  row: number;
  column: number;
  [key: string]: any;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  status?: number;
  headers?: any;
  error?: any;
  message?: string;
}

interface SoloonParams {
  color: SoloonColor;
}

interface ComethParams {
  direction: ComethDirection;
}

/**
 * GalaxyEntityBuilder class for managing galaxy entities (Polyanets, Soloons, Comeths)
 * Provides specific endpoints for creating and deleting cosmic entities
 */
export class GalaxyEntityBuilder {
  private readonly baseUrl: string;
  private readonly candidateId: string;
  private readonly delayMs: number;

  constructor(baseUrl: string, candidateId: string, delayMs: number = 0) {
    this.baseUrl = baseUrl;
    this.candidateId = candidateId;
    this.delayMs = delayMs;
  }

  private async _sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Makes an HTTP request to the specified endpoint
   */
  private async _request(method: HttpMethod, endpoint: string, data: RequestData): Promise<ApiResponse> {
    // Validate that only POST and DELETE are allowed
    const allowedMethods: HttpMethod[] = ["post", "delete"];
    if (!allowedMethods.includes(method.toLowerCase() as HttpMethod)) {
      throw new Error(
        `Method ${method} not allowed. Only POST and DELETE are supported.`,
      );
    }

    try {
      if (this.delayMs > 0) {
        await this._sleep(this.delayMs);
      }

      const response = await axios.request({
        method: method,
        url: this.baseUrl + endpoint,
        headers: { "content-type": "application/json" },
        data: data,
      });

      return {
        success: true,
        data: response.data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error: any) {
      
      if (error.response?.data) {
        // Clean HTML/JS/CSS from the response if exists
        error.response.data = sanitizer(error.response.data, {
          allowedTags: [],
        });
      }

      console.log("  Full error:", JSON.stringify(error, null, 2));

      return {
        success: false,
        error: error?.response?.data || error?.message,
        status: error?.response?.status,
        message: `Error: ${error?.message}`,
      };
    }
  }

  /**
   * Creates a Polyanet at the specified position
   */
  async createPolyanet(row: number, column: number, additionalData: Record<string, any> = {}): Promise<ApiResponse> {
    const data: RequestData = {
      candidateId: this.candidateId,
      row,
      column,
      ...additionalData,
    };
    return await this._request("post", "polyanets", data);
  }

  /**
   * Deletes a Polyanet at the specified position
   */
  async deletePolyanet(row: number, column: number, additionalData: Record<string, any> = {}): Promise<ApiResponse> {
    const data: RequestData = {
      candidateId: this.candidateId,
      row,
      column,
      ...additionalData,
    };
    return await this._request("delete", "polyanets", data);
  }

  /**
   * Creates a Soloon at the specified position
   */
  async createSoloon(row: number, column: number, colorParams: SoloonParams, additionalData: Record<string, any> = {}): Promise<ApiResponse> {
    const validColors: SoloonColor[] = ["blue", "red", "purple", "white"];
    if (!validColors.includes(colorParams.color)) {
      throw new Error(
        `Invalid color: ${colorParams.color}. Must be one of: ${
          validColors.join(", ")
        }`,
      );
    }

    const data: RequestData = {
      candidateId: this.candidateId,
      row,
      column,
      color: colorParams.color,
      ...additionalData,
    };
    return await this._request("post", "soloons", data);
  }

  /**
   * Deletes a Soloon at the specified position
   */
  async deleteSoloon(row: number, column: number, additionalData: Record<string, any> = {}): Promise<ApiResponse> {
    const data: RequestData = {
      candidateId: this.candidateId,
      row,
      column,
      ...additionalData,
    };
    return await this._request("delete", "soloons", data);
  }

  /**
   * Creates a Cometh at the specified position
   */
  async createCometh(row: number, column: number, directionParams: ComethParams, additionalData: Record<string, any> = {}): Promise<ApiResponse> {
    const validDirections: ComethDirection[] = ["up", "down", "left", "right"];
    if (!validDirections.includes(directionParams.direction)) {
      throw new Error(
        `Invalid direction: ${directionParams.direction}. Must be one of: ${
          validDirections.join(", ")
        }`,
      );
    }

    const data: RequestData = {
      candidateId: this.candidateId,
      row,
      column,
      direction: directionParams.direction,
      ...additionalData,
    };
    return await this._request("post", "comeths", data);
  }

  /**
   * Deletes a Cometh at the specified position
   */
  async deleteCometh(row: number, column: number, additionalData: Record<string, any> = {}): Promise<ApiResponse> {
    const data: RequestData = {
      candidateId: this.candidateId,
      row,
      column,
      ...additionalData,
    };
    return await this._request("delete", "comeths", data);
  }
}
