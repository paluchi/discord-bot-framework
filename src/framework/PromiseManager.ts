import StateManager from "./StateManager";
import { RequestDataResponse } from "./types";

export class PromiseManager {
  private stateManager: StateManager;
  private activePromises: {
    [key: string]: { resolve: Function; reject: Function };
  } = {};

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  async createPromise(
    key: string,
    timeoutMs: number
  ): Promise<RequestDataResponse> {
    const keyPattern = `request:${key}`;
    await this.stateManager.setRequestData(keyPattern, {
      status: "awaiting",
    });

    return new Promise((resolve, reject) => {
      this.activePromises[keyPattern] = { resolve, reject };

      const checkInterval = setInterval(async () => {
        const data = await this.stateManager.getRequestData(keyPattern);
        if (data && (data as any).status !== "awaiting") {
          clearInterval(checkInterval);
          clearTimeout(timeoutId);
          this.activePromises[keyPattern].resolve(data);
          delete this.activePromises[keyPattern];
          await this.stateManager.deleteRequestData(keyPattern);
        }
      }, 1000);

      const timeoutId = setTimeout(() => {
        clearInterval(checkInterval);
        this.activePromises[keyPattern].reject(
          new Error("Timeout waiting for response")
        );
        delete this.activePromises[keyPattern];
      }, timeoutMs);
    });
  }
}
