import { SlashCommandBuilder, EmbedBuilder, TextChannel } from "discord.js";
import { artistInfo, command } from "../../utils";
import * as puppeteer from "puppeteer";
import { chunk } from "../../utils";
import { Pagination } from "discordjs-button-embed-pagination";

const meta = new SlashCommandBuilder()
  .setName("kp")
  .setDescription(
    "Use the artist name to bring their latest submission. If there is more than one coincidences in the name it only picks the first (this command is a more direct but unprecise version of the others)."
  )
  .addStringOption((option) =>
    option
      .setName("name")
      .setDescription("Name of the artist.")
      .setRequired(true)
  );
export default command(meta, async ({ interaction, client }) => {
  await interaction.deferReply();
  const artistName = interaction.options.get("name")?.value;
});
