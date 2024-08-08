import { Client, GatewayIntentBits } from "discord.js";
import envs from "../utils/env";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.login(envs.DISCORD_TOKEN);

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

export default client;
