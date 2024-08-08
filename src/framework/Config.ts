import dotenv from "dotenv";

dotenv.config();

export class Config {
  static REDIS_URL: string = process.env.REDIS_URL || "redis://localhost:6379";
  static DISCORD_TOKEN: string = process.env.DISCORD_TOKEN || "";
  static LOG_LEVEL: string = process.env.LOG_LEVEL || "info";
  static REQUEST_TIMEOUT_MS: number = parseInt(
    process.env.REQUEST_TIMEOUT_MS || "30000",
    10
  );
  static POLLING_INTERVAL_MS: number = parseInt(
    process.env.POLLING_INTERVAL_MS || "200",
    10
  );

  static validate(): void {
    if (!this.DISCORD_TOKEN) {
      throw new Error("DISCORD_TOKEN is not set in the environment variables");
    }
    // Add more validation as needed
  }
}
