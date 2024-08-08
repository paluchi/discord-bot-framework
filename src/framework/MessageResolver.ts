import { Message } from "discord.js";
import StateManager from "./StateManager";
import { Logger } from "./utils/Logger";

export class MessageResolver {
  private stateManager: StateManager;
  private logger: Logger;

  constructor(stateManager: StateManager, logger: Logger) {
    this.stateManager = stateManager;
    this.logger = logger;
  }

  async resolveMessage(message: Message): Promise<boolean> {
    try {
      const openRequestKey = await this.stateManager.getOpenRequestKey(
        message.author.id,
        message.channel.id
      );
      // if key exsits get data from request
      if (openRequestKey) {
        const data = (await this.stateManager.getRequestData(
          openRequestKey
        )) as any;
        if (!data!.status || data!.status !== "awaiting") {
          // Delete the request data if it's not in the awaiting state
          await this.stateManager.deleteRequestData(openRequestKey);
          return false;
        }
        const requestData = {
          status: "received",
          response: message.content,
        };
        await this.stateManager.setRequestData(openRequestKey, requestData);
        this.logger.info(`Resolved message for request: ${openRequestKey}`);
        return true;
      }
      return false;
    } catch (error: any) {
      this.logger.error("Error resolving message", error);
      return false;
    }
  }
}
