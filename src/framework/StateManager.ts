import { createClient, RedisClientType } from "redis";
import envs from "../utils/env";

interface Insight {
  [key: string]: any;
}

class StateManager {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: envs.REDIS_URL,
    });
  }

  async init(): Promise<void> {
    await this.client.connect();
  }

  async setChatData(chatId: string, insights: Insight): Promise<void> {
    const key = `chat:${chatId}`;
    const value = JSON.stringify(insights);
    await this.client.set(key, value);
    console.log(`Stored chat data for key: ${key}`);
  }

  async getChatData(chatId: string): Promise<Insight | null> {
    const key = `chat:${chatId}`;
    const value = await this.client.get(key);
    console.log(`Retrieved chat data for key: ${key}`);
    return value ? JSON.parse(value) : null;
  }

  async updateChatData(chatId: string, insights: Insight): Promise<void> {
    const existingData = await this.getChatData(chatId);
    const updatedData = { ...existingData, ...insights };
    await this.setChatData(chatId, updatedData);
  }

  async deleteChatData(chatId: string): Promise<void> {
    const key = `chat:${chatId}`;
    await this.client.del(key);
    console.log(`Deleted chat data for key: ${key}`);
  }

  // New methods to support the promise-based data requests

  async setRequestData(key: string, value: string | object): Promise<void> {
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);
    await this.client.set(key, stringValue);
    await this.client.expire(key, 300); // Set expiration to 5 minutes
    console.log(`Stored request data for key: ${key}`);
  }

  async getRequestData(key: string): Promise<string | object | null> {
    const value = await this.client.get(key);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return null;
  }

  async deleteRequestData(key: string): Promise<void> {
    await this.client.del(key);
    console.log(`Deleted request data for key: ${key}`);
  }

  // Method to generate a unique key for request data
  generateRequestKey(userId: string, channelId: string): string {
    return `request:${userId}:${channelId}:${Date.now()}`;
  }

  // Method to check if there's an open request for a user in a channel
  async hasOpenRequest(userId: string, channelId: string): Promise<boolean> {
    const pattern = `request:${userId}:${channelId}`;
    const keys = await this.client.keys(pattern);
    console.log(
      `Checked for open requests with pattern: ${pattern}, found: ${keys.length}`
    );
    return keys.length > 0;
  }

  // Method to get the open request key for a user in a channel
  async getOpenRequestKey(
    userId: string,
    channelId: string
  ): Promise<string | null> {
    const pattern = `request:${userId}:${channelId}`;
    const keys = await this.client.keys(pattern);
    console.log(`Retrieved open request key for pattern: ${pattern}`);
    return keys.length > 0 ? keys[0] : null;
  }
}

export default StateManager;
