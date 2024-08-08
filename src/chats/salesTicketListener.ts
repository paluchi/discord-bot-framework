import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Events,
  TextChannel,
} from "discord.js";
import envs from "../framework/utils/env";
import { getChatApp } from "./shared/chatApp";

export async function startSalesTicketListener() {
  try {
    const chatApp = await getChatApp();

    const client = chatApp.getClient();

    client.once(Events.ClientReady, async () => {
      // Send the message with the button on bot initialization
      const channel = client.channels.cache.get(
        envs.SALES_REQUEST_CHANNEL_ID
      ) as TextChannel;

      if (channel) {
        try {
          // Fetch the last 100 messages in the channel
          const messages = await channel.messages.fetch({ limit: 100 });
          const buttonMessage = messages.find(
            (message) =>
              message.author.id === client.user!.id &&
              message.components.length > 0
          );

          if (buttonMessage) {
            console.log("Open new sale ticket button already exists");
            return;
          }

          const button = new ButtonBuilder()
            .setCustomId("create_ticket_button")
            .setLabel("Abrir nuevo ticket de venta")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("📩");

          const row = new ActionRowBuilder().addComponents(button);

          (channel as any).send({
            content: "Registro de Ventas",
            components: [row],
          });
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      } else {
        console.error("Channel not found");
      }
    });

    client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isButton()) return;

      const { customId } = interaction;

      if (customId === "create_ticket_button") {
        const category = interaction.guild!.channels.cache.get(
          envs.OPEN_SALES_CATEGORY_ID
        );

        if (category && category.type === ChannelType.GuildCategory) {
          const newChannel = await interaction.guild!.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: category.id,
          });

          await interaction.reply({
            content: `Channel created: ${newChannel}`,
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: "Category not found or is not a category type",
            ephemeral: true,
          });
        }
      }
    });
  } catch (error) {
    console.error("Failed to start the application:", error);
    process.exit(1);
  }
}
