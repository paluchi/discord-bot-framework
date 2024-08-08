import {
  ChatMiddleware,
  Request,
  RequestDataResponse,
  Response,
  Next,
} from "./types";
import { PromiseManager } from "./PromiseManager";
import {
  Client,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

export class FlowExecutor {
  private middlewares: ChatMiddleware[];
  private promiseManager: PromiseManager;
  private discordClient: Client;

  constructor(
    middlewares: ChatMiddleware[],
    promiseManager: PromiseManager,
    discordClient: Client
  ) {
    this.middlewares = middlewares;
    this.promiseManager = promiseManager;
    this.discordClient = discordClient;
  }

  async execute(req: Request): Promise<void> {
    const response: Response = {
      send: (message: string) => this.send(req.channelId, message),
      sendButtons: (
        message: string,
        buttons: { id: string; label: string }[]
      ) => this.sendButtons(req.channelId, message, buttons),
      requestData: async (message?: string) => {
        if (message) {
          await this.send(req.channelId, message);
        }
        return this.requestData(req);
      },
    };

    const next: Next = (nextMiddleware?: ChatMiddleware | ChatMiddleware[]) => {
      this.executeMiddlewares(
        [
          ...(nextMiddleware
            ? Array.isArray(nextMiddleware)
              ? nextMiddleware
              : [nextMiddleware]
            : this.middlewares),
        ],
        req,
        response
      );
    };

    next();
  }

  private async executeMiddlewares(
    middlewares: ChatMiddleware[],
    req: Request,
    res: Response
  ): Promise<void> {
    const middlewareQueue: ChatMiddleware[] = [...middlewares];

    const executeNextMiddleware = async () => {
      if (middlewareQueue.length > 0) {
        const currentMiddleware = middlewareQueue.shift();
        if (currentMiddleware) {
          await new Promise<void>((resolve) => {
            currentMiddleware(
              req,
              res,
              (nextMiddleware?: ChatMiddleware | ChatMiddleware[]) => {
                if (nextMiddleware) {
                  if (Array.isArray(nextMiddleware)) {
                    middlewareQueue.unshift(...nextMiddleware);
                  } else {
                    middlewareQueue.unshift(nextMiddleware);
                  }
                }
                executeNextMiddleware().then(resolve);
              }
            );
          });
        }
      }
    };

    await executeNextMiddleware();
  }

  private async send(channelId: string, message: string): Promise<void> {
    const channel = await this.discordClient.channels.fetch(channelId);
    if (channel && channel.isTextBased()) {
      await (channel as TextChannel).send(message);
    } else {
      console.error(
        `Channel with ID ${channelId} not found or is not a text channel.`
      );
    }
  }

  private async sendButtons(
    channelId: string,
    message: string,
    buttons: { id: string; label: string }[]
  ): Promise<void> {
    const channel = await this.discordClient.channels.fetch(channelId);
    if (channel && channel.isTextBased()) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      buttons.forEach((button) => {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(button.id)
            .setLabel(button.label)
            .setStyle(ButtonStyle.Primary)
        );
      });
      await (channel as TextChannel).send({
        content: message,
        components: [row],
      });
    } else {
      console.error(
        `Channel with ID ${channelId} not found or is not a text channel.`
      );
    }
  }

  private async requestData(req: Request): Promise<RequestDataResponse> {
    const key = `${req.userId}:${req.channelId}`;
    return this.promiseManager.createPromise(key, 30000); // 30 seconds timeout
  }
}
