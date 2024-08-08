import dotenv from "dotenv";
dotenv.config();

const envs = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN!,
  OPEN_SALES_CATEGORY_ID: process.env.OPEN_SALES_CATEGORY_ID!,
  CLOSED_SALES_CATEGORY_ID: process.env.CLOSED_SALES_CATEGORY_ID!,
  SALES_REQUEST_CHANNEL_ID: process.env.SALES_REQUEST_CHANNEL_ID!,
  OWNER_ID: process.env.OWNER_ID!,
  REDIS_URL: process.env.REDIS_URL!,
};

export default envs;
