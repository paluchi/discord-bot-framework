import { Client, IntentsBitField, NewsChannel, TextChannel } from "discord.js";
import { Config } from "./Config";
import StateManager from "./StateManager";
import { PromiseManager } from "./PromiseManager";
import { Logger } from "./utils/Logger";
import { ChatRouter } from "./ChatRoutes";
import { FlowExecutor } from "./FlowExecutor";
import { DiscordListener } from "./DiscordListener";
import { ChatMiddleware } from "./types";

interface ListenerProps {
  channelId?: string | null;
  categoryId?: string | null;
  channelCreateCallback?: (
    channel: TextChannel | NewsChannel,
    client: Client
  ) => void;
  startPoint: ChatMiddleware;
}

export class ChatApp {
  private client: Client;
  private logger: Logger;
  private stateManager: StateManager;
  private listeners: DiscordListener[] = [];

  constructor() {
    Config.validate();

    this.logger = new Logger();
    this.stateManager = new StateManager();

    this.client = new Client({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
      ],
    });

    this.client.once("ready", () => {
      this.logger.info("Discord bot is ready!");
      this.startListeners();
    });
  }

  async init() {
    await this.stateManager.init();
    await this.client.login(Config.DISCORD_TOKEN);
  }

  getClient() {
    return this.client;
  }

  getLogger() {
    return this.logger;
  }

  getStateManager() {
    return this.stateManager;
  }

  addListener(props: ListenerProps) {
    if (!props.channelId && !props.categoryId) {
      throw new Error(
        "Invalid listener arguments: channelId or categoryId must be provided"
      );
    }
    if (props.categoryId && !props.channelCreateCallback) {
      throw new Error(
        "Invalid listener arguments: channelCreateCallback must be provided for categoryId"
      );
    }

    const router = new ChatRouter();
    router.use(props.startPoint);

    const promiseManager = new PromiseManager(this.stateManager);

    const flowExecutor = new FlowExecutor(
      router.getMiddlewares(),
      promiseManager,
      this.client
    );

    const discordListener = new DiscordListener({
      client: this.client,
      flowExecutor,
      stateManager: this.stateManager,
      logger: this.logger,
      channelId: props.channelId,
      categoryId: props.categoryId,
      channelCreateCallback: props.channelCreateCallback,
    });

    this.listeners.push(discordListener);

    return discordListener;
  }

  private startListeners() {
    this.listeners.forEach((listener) => listener.start());
  }
}

// Usage example
export async function createChatApp() {
  const chatApp = new ChatApp();
  await chatApp.init();
  return chatApp;
}
