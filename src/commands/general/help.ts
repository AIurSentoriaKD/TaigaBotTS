import { SlashCommandBuilder } from "discord.js";
import { getCategoryRoot } from "../../pages/help";
import { command } from "../../utils";

const meta = new SlashCommandBuilder()
  .setName("help")
  .setDescription("help command ");

export default command(meta, ({ interaction }) => {
  return interaction.reply(getCategoryRoot(true));
});
