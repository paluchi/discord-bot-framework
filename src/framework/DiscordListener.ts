import {
  Client,
  Message,
  GuildChannel,
  NewsChannel,
  TextChannel,
} from "discord.js";
import { MessageResolver } from "./MessageResolver";
import { FlowExecutor } from "./FlowExecutor";
import { Request } from "./types";
import { Logger } from "./utils/Logger";
import StateManager from "./StateManager";

interface DiscordListenerOptions {
  client: Client;
  flowExecutor: FlowExecutor;
  stateManager: StateManager;
  logger: Logger;
  channelId?: string | null;
  categoryId?: string | null;
  channelCreateCallback?: (
    channel: TextChannel | NewsChannel,
    client: Client
  ) => void;
}

export class DiscordListener {
  private client: Client;
  private messageResolver: MessageResolver;
  private flowExecutor: FlowExecutor;
  private logger: Logger;
  private channelId: string | null;
  private categoryId: string | null;
  private channelCreateCallback: (
    channel: TextChannel | NewsChannel,
    client: Client
  ) => void;

  constructor({
    client,
    flowExecutor,
    stateManager,
    logger,
    channelId = null,
    categoryId = null,
    channelCreateCallback = () => {},
  }: DiscordListenerOptions) {
    this.client = client;
    this.flowExecutor = flowExecutor;
    this.logger = logger;
    this.channelId = channelId;
    this.categoryId = categoryId;
    this.channelCreateCallback = channelCreateCallback;

    this.messageResolver = new MessageResolver(stateManager, logger);
  }

  start(): void {
    this.client.on("messageCreate", this.handleMessage.bind(this));

    if (this.categoryId) {
      this.client.on("channelCreate", this.handleChannelCreate.bind(this));
    }

    this.logger.info("DiscordListener started");
  }

  private async handleMessage(message: Message): Promise<void> {
    if (message.author.bot) return;

    const channel = message.channel;

    // If it's a category listener and a message is sent in to a channel NOT in the category then ignore
    if (
      this.categoryId &&
      channel instanceof GuildChannel &&
      channel.parentId !== this.categoryId
    )
      return;

    // Only process messages in the specified channel
    if (this.channelId && channel.id !== this.channelId) return;

    try {
      const resolved = await this.messageResolver.resolveMessage(message);
      if (!resolved) {
        // Start a new flow execution
        const request: Request = {
          message: message.content,
          userId: message.author.id,
          channelId: channel.id,
        };
        await this.flowExecutor.execute(request);
      }
    } catch (error: any) {
      this.logger.error("Error handling message", error);
    }
  }

  private async handleChannelCreate(channel: GuildChannel): Promise<void> {
    console.log("TEST");

    // Only process channels created in the specified category
    if (this.categoryId && channel.parentId !== this.categoryId) return;

    // Check if the channel is a TextChannel or NewsChannel
    if (channel.isTextBased()) {
      // Execute the callback passing the client
      this.channelCreateCallback(
        channel as TextChannel | NewsChannel,
        this.client
      );
    } else {
      this.logger.warn("Channel is not a TextChannel or NewsChannel");
    }
  }
}
