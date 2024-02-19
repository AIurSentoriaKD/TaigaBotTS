import { SlashCommandBuilder } from "discord.js";
import { command } from "../../utils";

const meta = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Ping command ")
  .addStringOption((option) =>
    option
      .setName("message")
      .setDescription("provide the bot a message")
      .setMinLength(1)
      .setMaxLength(2000)
      .setRequired(true)
  );

export default command(meta, ({ interaction }) => {
  const message = interaction.options.get("message")?.value ?? "";

  return interaction.reply({
    ephemeral: true,
    content: "pong",
  });
});
